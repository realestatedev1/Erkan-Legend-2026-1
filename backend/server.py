from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Form, status
from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
import os
import logging
from typing import List, Optional
from datetime import datetime, timezone
import uuid
import shutil

from models import (
    User, UserCreate, UserLogin,
    Franchise, FranchiseCreate,
    Property, PropertyCreate,
    ContactMessage, ContactMessageCreate,
    CareerApplication, CareerApplicationCreate,
    FranchiseApplication, FranchiseApplicationCreate
)
from auth import (
    get_password_hash, verify_password, create_access_token,
    get_current_user, require_super_admin
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create uploads directory
UPLOAD_DIR = ROOT_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

# Create the main app
app = FastAPI()

# Create API router
api_router = APIRouter(prefix="/api")

# Mount static files under /api/uploads
app.mount("/api/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# ============ AUTH ENDPOINTS ============

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    """Login endpoint for both super admin and franchise admin"""
    user = await db.users.find_one({"username": credentials.username}, {"_id": 0})
    
    if not user or not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    if not user.get("active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive"
        )
    
    token_data = {
        "sub": user["id"],
        "username": user["username"],
        "role": user["role"],
        "franchise_id": user.get("franchise_id"),
        "name": user["name"]
    }
    
    access_token = create_access_token(data=token_data)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "username": user["username"],
            "role": user["role"],
            "name": user["name"],
            "franchise_id": user.get("franchise_id")
        }
    }


@api_router.post("/auth/register", dependencies=[Depends(require_super_admin)])
async def register_user(user_data: UserCreate):
    """Register new user (only super admin can do this)"""
    existing_user = await db.users.find_one({"username": user_data.username})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists"
        )
    
    user = User(
        username=user_data.username,
        password_hash=get_password_hash(user_data.password),
        role=user_data.role,
        franchise_id=user_data.franchise_id,
        name=user_data.name,
        email=user_data.email,
        phone=user_data.phone
    )
    
    user_dict = user.model_dump()
    user_dict['created_at'] = user_dict['created_at'].isoformat()
    
    await db.users.insert_one(user_dict)
    
    return {"message": "User registered successfully", "user_id": user.id}


@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get current user info"""
    return current_user


# ============ FRANCHISE ENDPOINTS ============

@api_router.get("/franchises")
async def get_franchises(active_only: bool = True):
    """Get all franchises (public endpoint)"""
    query = {"active": True} if active_only else {}
    franchises = await db.franchises.find(query, {"_id": 0}).to_list(100)
    
    for franchise in franchises:
        if isinstance(franchise.get('created_at'), str):
            franchise['created_at'] = franchise['created_at']
    
    return franchises


@api_router.get("/franchises/{franchise_id}")
async def get_franchise(franchise_id: str):
    """Get single franchise details"""
    franchise = await db.franchises.find_one({"id": franchise_id}, {"_id": 0})
    if not franchise:
        raise HTTPException(status_code=404, detail="Franchise not found")
    
    # Get property count for this franchise
    property_count = await db.properties.count_documents({
        "franchise_id": franchise_id,
        "active": True
    })
    franchise["property_count"] = property_count
    
    return franchise


@api_router.post("/franchises", dependencies=[Depends(require_super_admin)])
async def create_franchise(franchise_data: FranchiseCreate):
    """Create new franchise (super admin only)"""
    franchise = Franchise(**franchise_data.model_dump())
    
    franchise_dict = franchise.model_dump()
    franchise_dict['created_at'] = franchise_dict['created_at'].isoformat()
    
    await db.franchises.insert_one(franchise_dict)
    
    return {"message": "Franchise created successfully", "franchise_id": franchise.id}


@api_router.put("/franchises/{franchise_id}", dependencies=[Depends(require_super_admin)])
async def update_franchise(franchise_id: str, franchise_data: dict):
    """Update franchise (super admin only)"""
    franchise_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    result = await db.franchises.update_one(
        {"id": franchise_id},
        {"$set": franchise_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Franchise not found")
    
    return {"message": "Franchise updated successfully"}


@api_router.delete("/franchises/{franchise_id}", dependencies=[Depends(require_super_admin)])
async def delete_franchise(franchise_id: str):
    """Delete franchise (super admin only)"""
    result = await db.franchises.delete_one({"id": franchise_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Franchise not found")
    
    return {"message": "Franchise deleted successfully"}


# ============ PROPERTY ENDPOINTS ============

@api_router.get("/properties")
async def get_properties(
    property_type: Optional[str] = None,
    category: Optional[str] = None,
    city: Optional[str] = None,
    district: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    rooms: Optional[str] = None,
    franchise_id: Optional[str] = None,
    featured_only: bool = False,
    limit: int = 20,
    skip: int = 0
):
    """Get properties with filters (public endpoint)"""
    query = {"active": True}
    
    if property_type:
        query["property_type"] = property_type
    if category:
        query["category"] = category
    if city:
        query["city"] = city
    if district:
        query["district"] = district
    if min_price:
        query["price"] = {"$gte": min_price}
    if max_price:
        if "price" in query:
            query["price"]["$lte"] = max_price
        else:
            query["price"] = {"$lte": max_price}
    if rooms:
        query["rooms"] = rooms
    if franchise_id:
        query["franchise_id"] = franchise_id
    if featured_only:
        query["featured"] = True
    
    properties = await db.properties.find(query, {"_id": 0}).skip(skip).limit(limit).to_list(limit)
    total = await db.properties.count_documents(query)
    
    # Add franchise info to each property
    for prop in properties:
        franchise = await db.franchises.find_one({"id": prop["franchise_id"]}, {"_id": 0})
        if franchise:
            prop["franchise_info"] = {
                "office_name": franchise["office_name"],
                "phone": franchise["phone"],
                "email": franchise["email"]
            }
    
    return {
        "properties": properties,
        "total": total,
        "skip": skip,
        "limit": limit
    }


@api_router.get("/properties/{property_id}")
async def get_property(property_id: str):
    """Get single property details"""
    property_data = await db.properties.find_one({"id": property_id}, {"_id": 0})
    
    if not property_data:
        raise HTTPException(status_code=404, detail="Property not found")
    
    # Increment view count
    await db.properties.update_one(
        {"id": property_id},
        {"$inc": {"view_count": 1}}
    )
    
    # Add franchise info
    franchise = await db.franchises.find_one(
        {"id": property_data["franchise_id"]},
        {"_id": 0}
    )
    if franchise:
        property_data["franchise_info"] = franchise
    
    return property_data


@api_router.post("/properties")
async def create_property(
    property_data: PropertyCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create new property"""
    franchise_id = current_user.get("franchise_id")
    
    # Super admin can create for any franchise, franchise admin only for their own
    if current_user["role"] == "franchise_admin":
        if not franchise_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Franchise admin must have franchise_id"
            )
        final_franchise_id = franchise_id
    else:
        # Super admin - use first available franchise for demo
        franchises = await db.franchises.find_one({})
        final_franchise_id = franchises["id"] if franchises else None
    
    if not final_franchise_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No franchise available"
        )
    
    property_obj = Property(
        **property_data.model_dump(),
        franchise_id=final_franchise_id,
        created_by=current_user["sub"]
    )
    
    property_dict = property_obj.model_dump()
    property_dict['created_at'] = property_dict['created_at'].isoformat()
    property_dict['updated_at'] = property_dict['updated_at'].isoformat()
    
    await db.properties.insert_one(property_dict)
    
    return {"message": "Property created successfully", "property_id": property_obj.id}


@api_router.put("/properties/{property_id}")
async def update_property(
    property_id: str,
    property_data: dict,
    current_user: dict = Depends(get_current_user)
):
    """Update property"""
    existing_property = await db.properties.find_one({"id": property_id}, {"_id": 0})
    
    if not existing_property:
        raise HTTPException(status_code=404, detail="Property not found")
    
    # Check permissions
    if current_user["role"] == "franchise_admin":
        if existing_property["franchise_id"] != current_user.get("franchise_id"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only edit your franchise's properties"
            )
    
    property_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.properties.update_one(
        {"id": property_id},
        {"$set": property_data}
    )
    
    return {"message": "Property updated successfully"}


@api_router.delete("/properties/{property_id}")
async def delete_property(
    property_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete property"""
    existing_property = await db.properties.find_one({"id": property_id}, {"_id": 0})
    
    if not existing_property:
        raise HTTPException(status_code=404, detail="Property not found")
    
    # Check permissions
    if current_user["role"] == "franchise_admin":
        if existing_property["franchise_id"] != current_user.get("franchise_id"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only delete your franchise's properties"
            )
    
    await db.properties.delete_one({"id": property_id})
    
    return {"message": "Property deleted successfully"}


@api_router.post("/properties/{property_id}/upload-image")
async def upload_property_image(
    property_id: str,
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Upload property image"""
    # Check if property exists and user has permission
    existing_property = await db.properties.find_one({"id": property_id}, {"_id": 0})
    
    if not existing_property:
        raise HTTPException(status_code=404, detail="Property not found")
    
    if current_user["role"] == "franchise_admin":
        if existing_property["franchise_id"] != current_user.get("franchise_id"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only upload images for your franchise's properties"
            )
    
    # Save file
    file_extension = file.filename.split(".")[-1]
    file_name = f"{property_id}_{uuid.uuid4()}.{file_extension}"
    file_path = UPLOAD_DIR / file_name
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Update property with new image - USE /api/uploads path for Kubernetes ingress
    image_url = f"/api/uploads/{file_name}"
    await db.properties.update_one(
        {"id": property_id},
        {"$push": {"images": image_url}}
    )
    
    return {"message": "Image uploaded successfully", "image_url": image_url}


# ============ CONTACT MESSAGE ENDPOINTS ============

@api_router.post("/contact")
async def create_contact_message(message_data: ContactMessageCreate):
    """Create contact message (public endpoint)"""
    message = ContactMessage(**message_data.model_dump())
    
    message_dict = message.model_dump()
    message_dict['created_at'] = message_dict['created_at'].isoformat()
    
    await db.contact_messages.insert_one(message_dict)
    
    return {"message": "Message sent successfully"}


@api_router.get("/contact/messages")
async def get_contact_messages(current_user: dict = Depends(get_current_user)):
    """Get contact messages (admin only)"""
    query = {}
    
    # Franchise admin can only see messages for their franchise
    if current_user["role"] == "franchise_admin":
        query["franchise_id"] = current_user.get("franchise_id")
    
    messages = await db.contact_messages.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    return messages


@api_router.put("/contact/messages/{message_id}/read")
async def mark_message_read(
    message_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Mark message as read"""
    await db.contact_messages.update_one(
        {"id": message_id},
        {"$set": {"read": True}}
    )
    
    return {"message": "Message marked as read"}


# ============ CAREER APPLICATION ENDPOINTS ============

@api_router.post("/career/apply")
async def create_career_application(application_data: CareerApplicationCreate):
    """Submit career application (public endpoint)"""
    application = CareerApplication(**application_data.model_dump())
    
    application_dict = application.model_dump()
    application_dict['created_at'] = application_dict['created_at'].isoformat()
    
    await db.career_applications.insert_one(application_dict)
    
    return {"message": "Application submitted successfully"}


@api_router.get("/career/applications", dependencies=[Depends(require_super_admin)])
async def get_career_applications():
    """Get career applications (super admin only)"""
    applications = await db.career_applications.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    return applications


# ============ FRANCHISE APPLICATION ENDPOINTS ============

@api_router.post("/franchise/apply")
async def create_franchise_application(application_data: FranchiseApplicationCreate):
    """Submit franchise application (public endpoint)"""
    application = FranchiseApplication(**application_data.model_dump())
    
    application_dict = application.model_dump()
    application_dict['created_at'] = application_dict['created_at'].isoformat()
    
    await db.franchise_applications.insert_one(application_dict)
    
    return {"message": "Franchise application submitted successfully"}


@api_router.get("/franchise/applications", dependencies=[Depends(require_super_admin)])
async def get_franchise_applications():
    """Get franchise applications (super admin only)"""
    applications = await db.franchise_applications.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    return applications


# ============ ADMIN DASHBOARD STATS ============

@api_router.get("/admin/stats")
async def get_admin_stats(current_user: dict = Depends(get_current_user)):
    """Get dashboard statistics"""
    query = {}
    
    if current_user["role"] == "franchise_admin":
        query["franchise_id"] = current_user.get("franchise_id")
        
        property_count = await db.properties.count_documents({**query, "active": True})
        message_count = await db.contact_messages.count_documents({**query, "read": False})
        
        return {
            "total_properties": property_count,
            "unread_messages": message_count,
            "role": "franchise_admin"
        }
    else:
        # Super admin stats
        total_properties = await db.properties.count_documents({"active": True})
        total_franchises = await db.franchises.count_documents({"active": True})
        unread_messages = await db.contact_messages.count_documents({"read": False})
        career_applications = await db.career_applications.count_documents({"read": False})
        franchise_applications = await db.franchise_applications.count_documents({"read": False})
        
        return {
            "total_properties": total_properties,
            "total_franchises": total_franchises,
            "unread_messages": unread_messages,
            "career_applications": career_applications,
            "franchise_applications": franchise_applications,
            "role": "super_admin"
        }


# ============ SEED DATA ENDPOINT ============

@api_router.post("/seed-data")
async def seed_initial_data():
    """Seed initial demo data (run once)"""
    # Check if already seeded
    existing_users = await db.users.count_documents({})
    if existing_users > 0:
        return {"message": "Data already seeded"}
    
    # Create super admin
    super_admin = User(
        username="admin",
        password_hash=get_password_hash("LegendCities2025!"),
        role="super_admin",
        name="Super Admin",
        email="admin@legendcities.com.tr",
        phone="+90 212 324 0 444"
    )
    
    super_admin_dict = super_admin.model_dump()
    super_admin_dict['created_at'] = super_admin_dict['created_at'].isoformat()
    await db.users.insert_one(super_admin_dict)
    
    # Create demo franchises
    franchises_data = [
        {
            "office_name": "Legend Cities Etiler (Merkez)",
            "address": "Nisbetiye Mahallesi Nisbetiye Caddesi No:28/16",
            "city": "İstanbul",
            "district": "Beşiktaş",
            "phone": "+90 212 324 0 444",
            "email": "etiler@legendcities.com.tr",
            "manager_name": "Ahmet Yılmaz",
            "latitude": 41.0766,
            "longitude": 29.0185
        },
        {
            "office_name": "Legend Cities Kadıköy",
            "address": "Caferağa Mahallesi Moda Caddesi No:45",
            "city": "İstanbul",
            "district": "Kadıköy",
            "phone": "+90 216 555 1234",
            "email": "kadikoy@legendcities.com.tr",
            "manager_name": "Ayşe Demir",
            "latitude": 40.9885,
            "longitude": 29.0301
        },
        {
            "office_name": "Legend Cities İzmir",
            "address": "Alsancak Mahallesi Kıbrıs Şehitleri Caddesi No:120",
            "city": "İzmir",
            "district": "Konak",
            "phone": "+90 232 555 5678",
            "email": "izmir@legendcities.com.tr",
            "manager_name": "Mehmet Kaya",
            "latitude": 38.4382,
            "longitude": 27.1427
        }
    ]
    
    franchise_ids = []
    for franchise_data in franchises_data:
        franchise = Franchise(**franchise_data)
        franchise_dict = franchise.model_dump()
        franchise_dict['created_at'] = franchise_dict['created_at'].isoformat()
        await db.franchises.insert_one(franchise_dict)
        franchise_ids.append(franchise.id)
    
    # Create franchise admins
    franchise_admins_data = [
        {"username": "etiler", "name": "Ahmet Yılmaz", "franchise_id": franchise_ids[0]},
        {"username": "kadikoy", "name": "Ayşe Demir", "franchise_id": franchise_ids[1]},
        {"username": "izmir", "name": "Mehmet Kaya", "franchise_id": franchise_ids[2]}
    ]
    
    for admin_data in franchise_admins_data:
        franchise_admin = User(
            username=admin_data["username"],
            password_hash=get_password_hash("franchise123"),
            role="franchise_admin",
            franchise_id=admin_data["franchise_id"],
            name=admin_data["name"],
            email=f"{admin_data['username']}@legendcities.com.tr",
            phone="+90 555 123 4567"
        )
        
        franchise_admin_dict = franchise_admin.model_dump()
        franchise_admin_dict['created_at'] = franchise_admin_dict['created_at'].isoformat()
        await db.users.insert_one(franchise_admin_dict)
    
    return {"message": "Demo data seeded successfully", "franchise_ids": franchise_ids}


# Include router and add CORS
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
