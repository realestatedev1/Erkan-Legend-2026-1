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
    FranchiseApplication, FranchiseApplicationCreate,
    Customer, CustomerCreate, CustomerLogin, CustomerUpdate,
    Notification, SavedSearch, PriceAlert
)
from auth import (
    get_password_hash, verify_password, create_access_token,
    get_current_user, require_super_admin, SECRET_KEY
)
from datetime import timedelta

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

# CORS middleware - must be added before routes
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],  # Allow all origins
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

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
    neighborhood: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    rooms: Optional[str] = None,
    # Yeni filtreler
    min_area: Optional[float] = None,
    max_area: Optional[float] = None,
    min_age: Optional[int] = None,
    max_age: Optional[int] = None,
    floor: Optional[str] = None,
    min_floor: Optional[int] = None,
    max_floor: Optional[int] = None,
    total_floors_min: Optional[int] = None,
    total_floors_max: Optional[int] = None,
    heating: Optional[str] = None,
    furnished: Optional[str] = None,
    parking: Optional[str] = None,
    balcony: Optional[bool] = None,
    elevator: Optional[bool] = None,
    in_complex: Optional[bool] = None,
    credit_eligible: Optional[bool] = None,
    exchange: Optional[bool] = None,
    usage_status: Optional[str] = None,
    facade: Optional[str] = None,
    security: Optional[bool] = None,
    pool: Optional[bool] = None,
    gym: Optional[bool] = None,
    garden: Optional[bool] = None,
    # Genel
    franchise_id: Optional[str] = None,
    featured_only: bool = False,
    include_inactive: bool = False,
    limit: int = 20,
    skip: int = 0
):
    """Get properties with advanced filters (public endpoint)"""
    query = {}
    
    # Varsayılan olarak sadece aktif ilanları göster (include_inactive=True ise hepsini göster)
    if not include_inactive:
        query["active"] = True
    
    # Temel filtreler
    if property_type:
        query["property_type"] = property_type
    if category:
        query["category"] = category
    if city:
        query["city"] = city
    if district:
        query["district"] = district
    if neighborhood:
        query["neighborhood"] = neighborhood
    if rooms:
        query["rooms"] = rooms
    if franchise_id:
        query["franchise_id"] = franchise_id
    if featured_only:
        query["featured"] = True
    
    # Fiyat filtresi
    if min_price or max_price:
        query["price"] = {}
        if min_price:
            query["price"]["$gte"] = min_price
        if max_price:
            query["price"]["$lte"] = max_price
    
    # Alan (m²) filtresi
    if min_area or max_area:
        area_query = {}
        if min_area:
            area_query["$gte"] = min_area
        if max_area:
            area_query["$lte"] = max_area
        query["$or"] = [
            {"area_gross": area_query},
            {"area_net": area_query},
            {"area_sqm": area_query}
        ]
    
    # Bina yaşı filtresi
    if min_age is not None or max_age is not None:
        query["age"] = {}
        if min_age is not None:
            query["age"]["$gte"] = min_age
        if max_age is not None:
            query["age"]["$lte"] = max_age
    
    # Kat filtreleri
    if floor:
        query["floor"] = floor
    if total_floors_min or total_floors_max:
        query["total_floors"] = {}
        if total_floors_min:
            query["total_floors"]["$gte"] = total_floors_min
        if total_floors_max:
            query["total_floors"]["$lte"] = total_floors_max
    
    # Özellik filtreleri
    if heating:
        query["heating"] = heating
    if furnished:
        query["furnished"] = furnished
    if parking:
        query["parking"] = parking
    if usage_status:
        query["usage_status"] = usage_status
    if facade:
        query["facade"] = facade
    
    # Boolean filtreler
    if balcony is not None:
        query["balcony"] = balcony
    if elevator is not None:
        query["elevator"] = elevator
    if in_complex is not None:
        query["in_complex"] = in_complex
    if credit_eligible is not None:
        query["credit_eligible"] = credit_eligible
    if exchange is not None:
        query["exchange"] = exchange
    if security is not None:
        query["security"] = security
    if pool is not None:
        query["pool"] = pool
    if gym is not None:
        query["gym"] = gym
    if garden is not None:
        query["garden"] = garden
    
    properties = await db.properties.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    total = await db.properties.count_documents(query)
    
    # Batch fetch franchise info to avoid N+1 queries
    if properties:
        franchise_ids = list(set(prop["franchise_id"] for prop in properties))
        franchises_cursor = db.franchises.find({"id": {"$in": franchise_ids}}, {"_id": 0})
        franchises_list = await franchises_cursor.to_list(len(franchise_ids))
        franchises_dict = {f["id"]: f for f in franchises_list}
        
        # Add franchise info to each property
        for prop in properties:
            franchise = franchises_dict.get(prop["franchise_id"])
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


@api_router.patch("/properties/{property_id}/deactivate")
async def deactivate_property(
    property_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Deactivate property (move to archive)"""
    existing_property = await db.properties.find_one({"id": property_id}, {"_id": 0})
    
    if not existing_property:
        raise HTTPException(status_code=404, detail="Property not found")
    
    # Check permissions
    if current_user["role"] == "franchise_admin":
        if existing_property["franchise_id"] != current_user.get("franchise_id"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only deactivate your franchise's properties"
            )
    
    await db.properties.update_one(
        {"id": property_id},
        {"$set": {"active": False, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"message": "Property deactivated successfully"}


@api_router.patch("/properties/{property_id}/activate")
async def activate_property(
    property_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Activate property (publish again)"""
    existing_property = await db.properties.find_one({"id": property_id}, {"_id": 0})
    
    if not existing_property:
        raise HTTPException(status_code=404, detail="Property not found")
    
    # Check permissions
    if current_user["role"] == "franchise_admin":
        if existing_property["franchise_id"] != current_user.get("franchise_id"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only activate your franchise's properties"
            )
    
    await db.properties.update_one(
        {"id": property_id},
        {"$set": {"active": True, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"message": "Property activated successfully"}


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
    """Upload property image (max 30 images per property)"""
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
    
    # Check image limit (max 30)
    current_images = existing_property.get("images", [])
    if len(current_images) >= 30:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum 30 images allowed per property. Please remove some images first."
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
    
    return {"message": "Image uploaded successfully", "image_url": image_url, "total_images": len(current_images) + 1}


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
        
        # Property type distribution
        sale_count = await db.properties.count_documents({"property_type": "sale", "active": True})
        rent_count = await db.properties.count_documents({"property_type": "rent", "active": True})
        
        # Category distribution
        residential_count = await db.properties.count_documents({"category": "residential", "active": True})
        commercial_count = await db.properties.count_documents({"category": "commercial", "active": True})
        land_count = await db.properties.count_documents({"category": "land", "active": True})
        
        # Top viewed properties
        top_viewed = await db.properties.find(
            {"active": True},
            {"_id": 0, "id": 1, "title": 1, "view_count": 1, "city": 1, "district": 1}
        ).sort("view_count", -1).limit(5).to_list(5)
        
        # Total views
        pipeline = [
            {"$match": {"active": True}},
            {"$group": {"_id": None, "total_views": {"$sum": {"$ifNull": ["$view_count", 0]}}}}
        ]
        total_views_result = await db.properties.aggregate(pipeline).to_list(1)
        total_views = total_views_result[0]["total_views"] if total_views_result else 0
        
        # City distribution
        city_pipeline = [
            {"$match": {"active": True}},
            {"$group": {"_id": "$city", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": 5}
        ]
        city_distribution = await db.properties.aggregate(city_pipeline).to_list(5)
        
        return {
            "total_properties": total_properties,
            "total_franchises": total_franchises,
            "unread_messages": unread_messages,
            "career_applications": career_applications,
            "franchise_applications": franchise_applications,
            "total_views": total_views,
            "property_type_distribution": {
                "sale": sale_count,
                "rent": rent_count
            },
            "category_distribution": {
                "residential": residential_count,
                "commercial": commercial_count,
                "land": land_count
            },
            "top_viewed_properties": top_viewed,
            "city_distribution": [{"city": c["_id"], "count": c["count"]} for c in city_distribution],
            "role": "super_admin"
        }


# ============ SEED DATA ENDPOINT ============

@api_router.post("/seed-data")
async def seed_initial_data():
    """Seed initial demo data (run once)"""
    # Check if already seeded
    existing_users = await db.users.count_documents({})
    if existing_users > 0:
        # Even if users exist, check properties and add demo properties if missing
        existing_properties = await db.properties.count_documents({})
        if existing_properties == 0:
            # Get franchise IDs
            franchises = await db.franchises.find({}, {"id": 1}).to_list(10)
            if franchises:
                franchise_ids = [f["id"] for f in franchises]
                await seed_demo_properties(franchise_ids)
                return {"message": "Demo properties added", "properties_count": 15}
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
            "phone": "+90 212 324 0 444\n+90 532 212 51 47",
            "email": "etiler@legendcities.com.tr",
            "manager_name": "Erkan Çankaya",
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
        {"username": "etiler", "name": "Erkan Çankaya", "franchise_id": franchise_ids[0]},
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
    
    # Seed demo properties
    await seed_demo_properties(franchise_ids)
    
    return {"message": "Demo data seeded successfully", "franchise_ids": franchise_ids}


async def seed_demo_properties(franchise_ids):
    """Create demo property listings"""
    demo_properties = [
        # İstanbul - Beşiktaş (Etiler ofisi)
        {
            "title": "Etiler'de Lüks 4+1 Rezidans Dairesi",
            "description": "Boğaz manzaralı, güvenlikli site içinde, kapalı otoparklı lüks rezidans dairesi. Akıllı ev sistemi, merkezi klima ve yerden ısıtma mevcut.",
            "property_type": "sale",
            "category": "residential",
            "sub_category": "residence",
            "price": 32500000,
            "city": "İstanbul",
            "district": "Beşiktaş",
            "neighborhood": "Etiler",
            "address": "Nisbetiye Cad. No:15",
            "area_gross": 280,
            "area_net": 250,
            "rooms": "4+1",
            "bathrooms": 3,
            "floor": "12",
            "total_floors": 25,
            "age": 2,
            "heating": "merkezi",
            "furnished": "hayir",
            "parking": "kapali",
            "balcony": True,
            "elevator": True,
            "in_complex": True,
            "security": True,
            "pool": True,
            "gym": True,
            "credit_eligible": True,
            "featured": True,
            "images": ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800"],
            "franchise_id": franchise_ids[0],
            "created_by": "admin"
        },
        {
            "title": "Levent'te Kiralık Ofis Katı",
            "description": "Levent iş merkezinde, metro yakınında, 500 m² kullanım alanlı açık ofis katı. Hazır altyapı, toplantı odaları mevcut.",
            "property_type": "rent",
            "category": "commercial",
            "sub_category": "office",
            "price": 185000,
            "city": "İstanbul",
            "district": "Beşiktaş",
            "neighborhood": "Levent",
            "address": "Büyükdere Cad. No:185",
            "area_gross": 550,
            "area_net": 500,
            "rooms": "10+",
            "floor": "8",
            "total_floors": 32,
            "age": 5,
            "heating": "merkezi",
            "parking": "kapali",
            "elevator": True,
            "in_complex": True,
            "security": True,
            "images": ["https://images.unsplash.com/photo-1497366216548-37526070297c?w=800"],
            "franchise_id": franchise_ids[0],
            "created_by": "admin"
        },
        {
            "title": "Bebek'te Deniz Manzaralı 3+1 Daire",
            "description": "Bebek sahilinde, eşsiz Boğaz manzaralı, yenilenmiş tarihi bina içinde ferah daire. Yüksek tavan, parke zemin.",
            "property_type": "sale",
            "category": "residential",
            "sub_category": "apartment",
            "price": 28000000,
            "city": "İstanbul",
            "district": "Beşiktaş",
            "neighborhood": "Bebek",
            "address": "Cevdet Paşa Cad. No:42",
            "area_gross": 180,
            "area_net": 160,
            "rooms": "3+1",
            "bathrooms": 2,
            "floor": "3",
            "total_floors": 5,
            "age": 15,
            "heating": "kombi",
            "furnished": "evet",
            "parking": "yok",
            "balcony": True,
            "elevator": True,
            "credit_eligible": True,
            "featured": True,
            "images": ["https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800"],
            "franchise_id": franchise_ids[0],
            "created_by": "admin"
        },
        # İstanbul - Kadıköy (Kadıköy ofisi)
        {
            "title": "Moda'da Butik 2+1 Daire",
            "description": "Moda Caddesi üzerinde, denize yürüme mesafesinde, yenilenmiş butik daire. Yüksek tavan, ahşap detaylar.",
            "property_type": "sale",
            "category": "residential",
            "sub_category": "apartment",
            "price": 8500000,
            "city": "İstanbul",
            "district": "Kadıköy",
            "neighborhood": "Moda",
            "address": "Moda Cad. No:85",
            "area_gross": 110,
            "area_net": 95,
            "rooms": "2+1",
            "bathrooms": 1,
            "floor": "2",
            "total_floors": 4,
            "age": 20,
            "heating": "kombi",
            "furnished": "kismen",
            "parking": "yok",
            "balcony": True,
            "elevator": False,
            "credit_eligible": True,
            "images": ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"],
            "franchise_id": franchise_ids[1],
            "created_by": "admin"
        },
        {
            "title": "Caddebostan'da Satılık 5+2 Villa",
            "description": "Caddebostan sahiline yakın, müstakil bahçeli lüks villa. Özel havuz, kapalı garaj, akıllı ev sistemi.",
            "property_type": "sale",
            "category": "residential",
            "sub_category": "villa",
            "price": 65000000,
            "city": "İstanbul",
            "district": "Kadıköy",
            "neighborhood": "Caddebostan",
            "address": "Bağdat Cad. Arkası",
            "area_gross": 450,
            "area_net": 400,
            "rooms": "5+2",
            "bathrooms": 4,
            "floor": "zemin",
            "total_floors": 3,
            "age": 0,
            "heating": "yerden",
            "furnished": "hayir",
            "parking": "kapali",
            "balcony": True,
            "elevator": True,
            "in_complex": False,
            "security": True,
            "pool": True,
            "garden": True,
            "smart_home": True,
            "credit_eligible": True,
            "featured": True,
            "images": ["https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800"],
            "franchise_id": franchise_ids[1],
            "created_by": "admin"
        },
        {
            "title": "Bağdat Caddesi'nde Kiralık Dükkan",
            "description": "Bağdat Caddesi üzerinde, yoğun yaya trafiği olan konumda, geniş cepheli dükkan. Depo dahil.",
            "property_type": "rent",
            "category": "commercial",
            "sub_category": "shop",
            "price": 95000,
            "city": "İstanbul",
            "district": "Kadıköy",
            "neighborhood": "Suadiye",
            "address": "Bağdat Cad. No:280",
            "area_gross": 120,
            "area_net": 100,
            "floor": "zemin",
            "total_floors": 6,
            "age": 10,
            "heating": "klima",
            "parking": "yok",
            "images": ["https://images.unsplash.com/photo-1604014237800-1c9102c219da?w=800"],
            "franchise_id": franchise_ids[1],
            "created_by": "admin"
        },
        {
            "title": "Fenerbahçe'de Deniz Manzaralı 3+1",
            "description": "Fenerbahçe sahilinde, eşsiz ada ve deniz manzaralı, yeni tadilatlı daire.",
            "property_type": "sale",
            "category": "residential",
            "sub_category": "apartment",
            "price": 14500000,
            "city": "İstanbul",
            "district": "Kadıköy",
            "neighborhood": "Fenerbahçe",
            "address": "Münir Nurettin Selçuk Cad. No:20",
            "area_gross": 145,
            "area_net": 130,
            "rooms": "3+1",
            "bathrooms": 2,
            "floor": "5",
            "total_floors": 8,
            "age": 8,
            "heating": "dogalgaz",
            "furnished": "hayir",
            "parking": "acik",
            "balcony": True,
            "elevator": True,
            "in_complex": True,
            "security": True,
            "credit_eligible": True,
            "images": ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800"],
            "franchise_id": franchise_ids[1],
            "created_by": "admin"
        },
        # İzmir (İzmir ofisi)
        {
            "title": "Alsancak'ta Satılık 2+1 Daire",
            "description": "Kordon'a yürüme mesafesinde, yenilenmiş, ferah daire. Metro ve tramvay yakınında.",
            "property_type": "sale",
            "category": "residential",
            "sub_category": "apartment",
            "price": 4200000,
            "city": "İzmir",
            "district": "Konak",
            "neighborhood": "Alsancak",
            "address": "Kıbrıs Şehitleri Cad. No:65",
            "area_gross": 95,
            "area_net": 85,
            "rooms": "2+1",
            "bathrooms": 1,
            "floor": "4",
            "total_floors": 6,
            "age": 12,
            "heating": "kombi",
            "furnished": "kismen",
            "parking": "yok",
            "balcony": True,
            "elevator": True,
            "credit_eligible": True,
            "images": ["https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800"],
            "franchise_id": franchise_ids[2],
            "created_by": "admin"
        },
        {
            "title": "Karşıyaka'da Deniz Manzaralı 4+1 Daire",
            "description": "Karşıyaka sahilinde, geniş balkonlu, panoramik deniz manzaralı lüks daire.",
            "property_type": "sale",
            "category": "residential",
            "sub_category": "apartment",
            "price": 9800000,
            "city": "İzmir",
            "district": "Karşıyaka",
            "neighborhood": "Bostanlı",
            "address": "Cemal Gürsel Cad. No:120",
            "area_gross": 200,
            "area_net": 180,
            "rooms": "4+1",
            "bathrooms": 2,
            "floor": "10",
            "total_floors": 15,
            "age": 3,
            "heating": "merkezi",
            "furnished": "hayir",
            "parking": "kapali",
            "balcony": True,
            "elevator": True,
            "in_complex": True,
            "security": True,
            "pool": True,
            "gym": True,
            "credit_eligible": True,
            "featured": True,
            "images": ["https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800"],
            "franchise_id": franchise_ids[2],
            "created_by": "admin"
        },
        {
            "title": "Çeşme'de Satılık Yazlık Villa",
            "description": "Alaçatı yakınında, müstakil bahçeli, havuzlu yazlık villa. Denize 5 dk.",
            "property_type": "sale",
            "category": "residential",
            "sub_category": "villa",
            "price": 18500000,
            "city": "İzmir",
            "district": "Çeşme",
            "neighborhood": "Alaçatı",
            "address": "Port Alaçatı arkası",
            "area_gross": 280,
            "area_net": 240,
            "rooms": "4+2",
            "bathrooms": 3,
            "floor": "zemin",
            "total_floors": 2,
            "age": 5,
            "heating": "klima",
            "furnished": "evet",
            "parking": "acik",
            "balcony": True,
            "pool": True,
            "garden": True,
            "terrace": True,
            "credit_eligible": True,
            "featured": True,
            "images": ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800"],
            "franchise_id": franchise_ids[2],
            "created_by": "admin"
        },
        {
            "title": "Bornova'da Kiralık 1+1 Stüdyo",
            "description": "Ege Üniversitesi'ne yakın, öğrenciye uygun, eşyalı stüdyo daire.",
            "property_type": "rent",
            "category": "residential",
            "sub_category": "apartment",
            "price": 12000,
            "city": "İzmir",
            "district": "Bornova",
            "neighborhood": "Ege",
            "address": "Ege Üniversitesi karşısı",
            "area_gross": 55,
            "area_net": 45,
            "rooms": "1+1",
            "bathrooms": 1,
            "floor": "3",
            "total_floors": 5,
            "age": 15,
            "heating": "kombi",
            "furnished": "evet",
            "parking": "yok",
            "balcony": False,
            "elevator": False,
            "images": ["https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800"],
            "franchise_id": franchise_ids[2],
            "created_by": "admin"
        },
        # Ankara
        {
            "title": "Çankaya'da Satılık 3+1 Daire",
            "description": "Çankaya'nın merkezinde, yeşil manzaralı, yeni bina içinde modern daire.",
            "property_type": "sale",
            "category": "residential",
            "sub_category": "apartment",
            "price": 6500000,
            "city": "Ankara",
            "district": "Çankaya",
            "neighborhood": "Kavaklıdere",
            "address": "Tunalı Hilmi Cad. yakını",
            "area_gross": 150,
            "area_net": 135,
            "rooms": "3+1",
            "bathrooms": 2,
            "floor": "6",
            "total_floors": 12,
            "age": 1,
            "heating": "dogalgaz",
            "furnished": "hayir",
            "parking": "kapali",
            "balcony": True,
            "elevator": True,
            "in_complex": True,
            "security": True,
            "credit_eligible": True,
            "images": ["https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800"],
            "franchise_id": franchise_ids[0],
            "created_by": "admin"
        },
        # Antalya
        {
            "title": "Konyaaltı'nda Satılık 2+1 Yazlık",
            "description": "Konyaaltı plajına yakın, havuzlu site içinde, eşyalı yazlık daire.",
            "property_type": "sale",
            "category": "residential",
            "sub_category": "apartment",
            "price": 5800000,
            "city": "Antalya",
            "district": "Konyaaltı",
            "neighborhood": "Liman",
            "address": "Liman Mah. Akdeniz Bulvarı",
            "area_gross": 100,
            "area_net": 85,
            "rooms": "2+1",
            "bathrooms": 1,
            "floor": "2",
            "total_floors": 5,
            "age": 4,
            "heating": "klima",
            "furnished": "evet",
            "parking": "acik",
            "balcony": True,
            "elevator": True,
            "in_complex": True,
            "pool": True,
            "credit_eligible": True,
            "images": ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800"],
            "franchise_id": franchise_ids[0],
            "created_by": "admin"
        },
        # Bursa
        {
            "title": "Nilüfer'de Satılık 3+1 Site İçi Daire",
            "description": "Nilüfer'in en prestijli sitesinde, sosyal tesisli, güvenlikli daire.",
            "property_type": "sale",
            "category": "residential",
            "sub_category": "apartment",
            "price": 4200000,
            "city": "Bursa",
            "district": "Nilüfer",
            "neighborhood": "Görükle",
            "address": "FSM Bulvarı yakını",
            "area_gross": 140,
            "area_net": 125,
            "rooms": "3+1",
            "bathrooms": 2,
            "floor": "4",
            "total_floors": 8,
            "age": 2,
            "heating": "dogalgaz",
            "furnished": "hayir",
            "parking": "kapali",
            "balcony": True,
            "elevator": True,
            "in_complex": True,
            "security": True,
            "pool": True,
            "gym": True,
            "credit_eligible": True,
            "images": ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"],
            "franchise_id": franchise_ids[1],
            "created_by": "admin"
        },
        # Arsa
        {
            "title": "Silivri'de Satılık İmarlı Arsa",
            "description": "Silivri merkezde, konut imarlı, altyapısı hazır arsa. Emsal 1.50, yükseklik serbest.",
            "property_type": "sale",
            "category": "land",
            "sub_category": "residential_land",
            "price": 8500000,
            "city": "İstanbul",
            "district": "Silivri",
            "neighborhood": "Merkez",
            "address": "Silivri OSB yakını",
            "area_gross": 1200,
            "area_net": 1200,
            "credit_eligible": True,
            "exchange": True,
            "images": ["https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800"],
            "franchise_id": franchise_ids[0],
            "created_by": "admin"
        }
    ]
    
    for prop_data in demo_properties:
        prop = Property(**prop_data)
        prop_dict = prop.model_dump()
        prop_dict['created_at'] = prop_dict['created_at'].isoformat()
        prop_dict['updated_at'] = prop_dict['updated_at'].isoformat()
        await db.properties.insert_one(prop_dict)


# ============ TURKEY LOCATION ENDPOINTS ============

@api_router.get("/locations/cities")
async def get_cities():
    """Get all cities (81 provinces) of Turkey"""
    cities = await db.locations_cities.find({}, {"_id": 0}).sort("name", 1).to_list(100)
    
    if not cities:
        # Return static data if DB is empty
        return {
            "cities": [
                "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Aksaray", "Amasya", "Ankara", "Antalya", "Ardahan", "Artvin",
                "Aydın", "Balıkesir", "Bartın", "Batman", "Bayburt", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur",
                "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Düzce", "Edirne", "Elazığ", "Erzincan",
                "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari", "Hatay", "Iğdır", "Isparta", "İstanbul",
                "İzmir", "Kahramanmaraş", "Karabük", "Karaman", "Kars", "Kastamonu", "Kayseri", "Kırıkkale", "Kırklareli", "Kırşehir",
                "Kilis", "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Mardin", "Mersin", "Muğla", "Muş",
                "Nevşehir", "Niğde", "Ordu", "Osmaniye", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas",
                "Şanlıurfa", "Şırnak", "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Uşak", "Van", "Yalova", "Yozgat", "Zonguldak"
            ],
            "total": 81,
            "source": "static"
        }
    
    return {
        "cities": [c["name"] for c in cities],
        "total": len(cities),
        "source": "database"
    }


@api_router.get("/locations/districts")
async def get_districts(city: str):
    """Get all districts of a city"""
    # First try from database
    city_data = await db.locations_cities.find_one({"name": city}, {"_id": 0})
    
    if city_data and "districts" in city_data:
        districts = sorted([d["name"] for d in city_data["districts"]])
        return {
            "city": city,
            "districts": districts,
            "total": len(districts),
            "source": "database"
        }
    
    # Fallback to static data for major cities
    static_districts = {
        "İstanbul": ["Adalar", "Arnavutköy", "Ataşehir", "Avcılar", "Bağcılar", "Bahçelievler", "Bakırköy", "Başakşehir",
                     "Bayrampaşa", "Beşiktaş", "Beykoz", "Beylikdüzü", "Beyoğlu", "Büyükçekmece", "Çatalca", "Çekmeköy",
                     "Esenler", "Esenyurt", "Eyüpsultan", "Fatih", "Gaziosmanpaşa", "Güngören", "Kadıköy", "Kağıthane",
                     "Kartal", "Küçükçekmece", "Maltepe", "Pendik", "Sancaktepe", "Sarıyer", "Silivri", "Sultanbeyli",
                     "Sultangazi", "Şile", "Şişli", "Tuzla", "Ümraniye", "Üsküdar", "Zeytinburnu"],
        "Ankara": ["Akyurt", "Altındağ", "Ayaş", "Bala", "Beypazarı", "Çamlıdere", "Çankaya", "Çubuk", "Elmadağ",
                   "Etimesgut", "Evren", "Gölbaşı", "Güdül", "Haymana", "Kahramankazan", "Kalecik", "Keçiören", "Kızılcahamam",
                   "Mamak", "Nallıhan", "Polatlı", "Pursaklar", "Sincan", "Şereflikoçhisar", "Yenimahalle"],
        "İzmir": ["Aliağa", "Balçova", "Bayındır", "Bayraklı", "Bergama", "Beydağ", "Bornova", "Buca", "Çeşme", "Çiğli",
                  "Dikili", "Foça", "Gaziemir", "Güzelbahçe", "Karabağlar", "Karaburun", "Karşıyaka", "Kemalpaşa", "Kınık",
                  "Kiraz", "Konak", "Menderes", "Menemen", "Narlıdere", "Ödemiş", "Seferihisar", "Selçuk", "Tire", "Torbalı", "Urla"],
        "Antalya": ["Akseki", "Aksu", "Alanya", "Demre", "Döşemealtı", "Elmalı", "Finike", "Gazipaşa", "Gündoğmuş",
                    "İbradı", "Kaş", "Kemer", "Kepez", "Konyaaltı", "Korkuteli", "Kumluca", "Manavgat", "Muratpaşa", "Serik"],
        "Bursa": ["Büyükorhan", "Gemlik", "Gürsu", "Harmancık", "İnegöl", "İznik", "Karacabey", "Keles", "Kestel",
                  "Mudanya", "Mustafakemalpaşa", "Nilüfer", "Orhaneli", "Orhangazi", "Osmangazi", "Yenişehir", "Yıldırım"]
    }
    
    if city in static_districts:
        return {
            "city": city,
            "districts": static_districts[city],
            "total": len(static_districts[city]),
            "source": "static"
        }
    
    return {
        "city": city,
        "districts": [],
        "total": 0,
        "source": "not_found"
    }


@api_router.get("/locations/neighborhoods")
async def get_neighborhoods(city: str, district: str):
    """Get all neighborhoods of a district"""
    # Try from database
    neighborhoods = await db.locations_neighborhoods.find(
        {"province": city, "district": district},
        {"_id": 0}
    ).sort("name", 1).to_list(500)
    
    if neighborhoods:
        return {
            "city": city,
            "district": district,
            "neighborhoods": [n["name"] for n in neighborhoods],
            "total": len(neighborhoods),
            "source": "database"
        }
    
    # Fallback to static data for major districts
    static_neighborhoods = {
        "İstanbul": {
            "Beşiktaş": ["Abbasağa", "Arnavutköy", "Bebek", "Balmumcu", "Cihannüma", "Dikilitaş", "Etiler", "Gayrettepe", "Konaklar", "Kuruçeşme", "Levent", "Muradiye", "Nisbetiye", "Ortaköy", "Sinanpaşa", "Türkali", "Ulus", "Vişnezade", "Yıldız"],
            "Kadıköy": ["Acıbadem", "Bostancı", "Caferağa", "Caddebostan", "Erenköy", "Fenerbahçe", "Feneryolu", "Fikirtepe", "Göztepe", "Hasanpaşa", "Koşuyolu", "Kozyatağı", "Merdivenköy", "Moda", "Osmanağa", "Rasimpaşa", "Sahrayıcedit", "Suadiye", "Zühtüpaşa"],
            "Şişli": ["Bomonti", "Cumhuriyet", "Dikilitaş", "Esentepe", "Fulya", "Halaskargazi", "Harbiye", "İnönü", "Kuştepe", "Mecidiyeköy", "Merkez", "Meşrutiyet", "Nişantaşı", "Osmanbey", "Paşa", "Teşvikiye"],
            "Sarıyer": ["Bahçeköy", "Baltalimanı", "Büyükdere", "Çayırbaşı", "Darüşşafaka", "Emirgan", "Fatih Sultan Mehmet", "Ferahevler", "Garipçe", "İstinye", "Kanlıca", "Kilyos", "Kireçburnu", "Kumköy", "Maslak", "Maden", "Pınar", "Poligon", "Reşitpaşa", "Rumelifeneri", "Rumelihisarı", "Sarıyer Merkez", "Tarabya", "Uskumruköy", "Yeniköy", "Zekeriyaköy"],
            "Üsküdar": ["Acıbadem", "Ahmediye", "Altunizade", "Aziz Mahmut Hüdayi", "Bahçelievler", "Beylerbeyi", "Bulgurlu", "Burhaniye", "Çengelköy", "Ferah", "Güzeltepe", "İcadiye", "Kandilli", "Kirazlıtepe", "Kısıklı", "Kuzguncuk", "Mimar Sinan", "Murat Reis", "Salacak", "Selamiali", "Sultantepe", "Ünalan", "Validei Atik", "Yavuztürk", "Zeynep Kamil"],
            "Bakırköy": ["Ataköy", "Basınköy", "Cevizlik", "Kartaltepe", "Osmaniye", "Sakızağacı", "Şenlikköy", "Yeşilköy", "Yeşilyurt", "Zeytinlik", "Zuhuratbaba"],
            "Fatih": ["Aksaray", "Akşemsettin", "Ali Kuşçu", "Atikali", "Balat", "Beyazıt", "Binbirdirek", "Cankurtaran", "Cerrahpaşa", "Demirtaş", "Eminsinan", "Haseki Sultan", "Hirkai Şerif", "Hobyar", "İskenderpaşa", "Karagümrük", "Katip Kasım", "Küçük Ayasofya", "Mercan", "Mevlanakapı", "Molla Fenari", "Molla Hüsrev", "Nişanca", "Sarıdemir", "Seyyid Ömer", "Silivrikapı", "Sultanahmet", "Süleymaniye", "Şehremini", "Topkapı", "Unkapanı", "Vefa", "Yavuz Sinan", "Yedikule", "Zeyrek"],
        },
        "Ankara": {
            "Çankaya": ["Ayrancı", "Bahçelievler", "Balgat", "Beysukent", "Birlik", "Cebeci", "Çayyolu", "Çukurambar", "Dikmen", "Emek", "Esat", "Gaziosmanpaşa", "Gölbaşı", "Güvenevler", "İlker", "İncesu", "Kavaklidere", "Kızılay", "Kocatepe", "Kolej", "Korkutreis", "Korutürk", "Küçükesat", "Maltepe", "Mebuseviee", "Mebusevleri", "Mutlukent", "Oran", "Öveçler", "Seyranbağları", "Söğütözü", "Yaşamkent", "Yıldız", "Yıldızevler", "Yukarı Ayrancı"],
            "Keçiören": ["Aktepe", "Atapark", "Ayvalı", "Bademlik", "Bağlum", "Basınevler", "Çaldıran", "Etlik", "Esertepe", "Kalaba", "Kamil Ocak", "Kanuni", "Karşıyaka", "Kuşcağız", "Pınarbaşı", "Pursaklar", "Şefkat", "Şenlik", "Ufuktepe", "Yayla"],
        },
        "İzmir": {
            "Konak": ["Akdeniz", "Alsancak", "Basmane", "Çankaya", "Eşrefpaşa", "Göztepe", "Güzelyalı", "Hatay", "İnönü", "Kahramanlar", "Kemeraltı", "Konak", "Mimar Kemalettin", "Tepecik", "Umurbey", "Yenişehir"],
            "Karşıyaka": ["Aksoy", "Atakent", "Bahariye", "Bahçelievler", "Bostanlı", "Cumhuriyet", "Dedebaşı", "Demirköprü", "Donanmacı", "Fikri Altay", "Goncalar", "İmbat", "Latife Hanım", "Mavişehir", "Nergiz", "Örnekköy", "Tersane", "Yalı", "Yamanlar"],
            "Bornova": ["Altındağ", "Barbaros", "Birlik", "Çamdibi", "Doğanlar", "Ergene", "Erzene", "Evka", "Gürpınar", "İnönü", "Karacaoğlan", "Kazımdirik", "Kemalpaşa", "Laka", "Mevlana", "Naldöken", "Rafetpaşa", "Yeşilova"],
        }
    }
    
    if city in static_neighborhoods and district in static_neighborhoods[city]:
        return {
            "city": city,
            "district": district,
            "neighborhoods": static_neighborhoods[city][district],
            "total": len(static_neighborhoods[city][district]),
            "source": "static"
        }
    
    return {
        "city": city,
        "district": district,
        "neighborhoods": [],
        "total": 0,
        "source": "not_found"
    }


@api_router.post("/locations/seed-from-api")
async def seed_locations_from_api():
    """Seed location data from TurkiyeAPI - This fetches all 81 provinces with districts"""
    import httpx
    
    try:
        async with httpx.AsyncClient(timeout=60.0) as client_http:
            # Fetch all provinces with their districts
            response = await client_http.get("https://turkiyeapi.dev/api/v1/provinces?limit=100")
            data = response.json()
            
            if data["status"] != "OK":
                raise HTTPException(status_code=500, detail="Failed to fetch from TurkiyeAPI")
            
            provinces = data["data"]
            
            # Clear existing data
            await db.locations_cities.delete_many({})
            
            # Insert all provinces with districts
            cities_inserted = 0
            total_districts = 0
            
            for province in provinces:
                city_doc = {
                    "id": str(uuid.uuid4()),
                    "api_id": province["id"],
                    "name": province["name"],
                    "population": province.get("population"),
                    "area": province.get("area"),
                    "region": province.get("region", {}).get("tr"),
                    "is_metropolitan": province.get("isMetropolitan", False),
                    "is_coastal": province.get("isCoastal", False),
                    "coordinates": province.get("coordinates"),
                    "districts": province.get("districts", [])
                }
                
                await db.locations_cities.insert_one(city_doc)
                cities_inserted += 1
                total_districts += len(province.get("districts", []))
            
            # Create indexes
            await db.locations_cities.create_index("name")
            await db.locations_cities.create_index("api_id")
            
            return {
                "message": "Location data seeded successfully from TurkiyeAPI",
                "cities_inserted": cities_inserted,
                "total_districts": total_districts
            }
            
    except Exception as e:
        logger.error(f"Error seeding locations: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error seeding locations: {str(e)}")


@api_router.post("/locations/seed-neighborhoods")
async def seed_neighborhoods_from_api(city_name: Optional[str] = None, limit_per_request: int = 500):
    """Seed neighborhood data from TurkiyeAPI for a specific city or all cities"""
    import httpx
    
    try:
        # Get city from database
        query = {"name": city_name} if city_name else {}
        cities = await db.locations_cities.find(query, {"_id": 0}).to_list(100)
        
        if not cities:
            return {"message": "No cities found. Please run /locations/seed-from-api first"}
        
        total_neighborhoods = 0
        cities_processed = []
        
        async with httpx.AsyncClient(timeout=120.0) as client_http:
            for city in cities:
                if "districts" not in city or not city["districts"]:
                    continue
                
                city_neighborhoods = 0
                
                for district in city["districts"]:
                    district_id = district["id"]
                    
                    # Fetch neighborhoods for this district
                    try:
                        response = await client_http.get(
                            f"https://turkiyeapi.dev/api/v1/neighborhoods?districtId={district_id}&limit={limit_per_request}"
                        )
                        data = response.json()
                        
                        if data["status"] == "OK" and data["data"]:
                            # Delete existing neighborhoods for this district
                            await db.locations_neighborhoods.delete_many({
                                "province": city["name"],
                                "district": district["name"]
                            })
                            
                            # Insert new neighborhoods
                            for neighborhood in data["data"]:
                                neighborhood_doc = {
                                    "id": str(uuid.uuid4()),
                                    "api_id": neighborhood["id"],
                                    "province_id": neighborhood["provinceId"],
                                    "district_id": neighborhood["districtId"],
                                    "province": neighborhood["province"],
                                    "district": neighborhood["district"],
                                    "name": neighborhood["name"],
                                    "population": neighborhood.get("population")
                                }
                                await db.locations_neighborhoods.insert_one(neighborhood_doc)
                                city_neighborhoods += 1
                                total_neighborhoods += 1
                    except Exception as e:
                        logger.warning(f"Error fetching neighborhoods for {district['name']}: {str(e)}")
                        continue
                
                cities_processed.append({
                    "city": city["name"],
                    "neighborhoods_added": city_neighborhoods
                })
                
                # If processing single city, break after
                if city_name:
                    break
        
        # Create indexes
        await db.locations_neighborhoods.create_index([("province", 1), ("district", 1)])
        await db.locations_neighborhoods.create_index("name")
        
        return {
            "message": "Neighborhood data seeded successfully",
            "total_neighborhoods": total_neighborhoods,
            "cities_processed": cities_processed
        }
        
    except Exception as e:
        logger.error(f"Error seeding neighborhoods: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error seeding neighborhoods: {str(e)}")


@api_router.get("/locations/stats")
async def get_location_stats():
    """Get statistics about location data"""
    cities_count = await db.locations_cities.count_documents({})
    neighborhoods_count = await db.locations_neighborhoods.count_documents({})
    
    # Get sample cities
    sample_cities = await db.locations_cities.find({}, {"_id": 0, "name": 1, "districts": 1}).limit(5).to_list(5)
    sample_cities_summary = [
        {"name": c["name"], "district_count": len(c.get("districts", []))} 
        for c in sample_cities
    ]
    
    return {
        "total_cities": cities_count,
        "total_neighborhoods": neighborhoods_count,
        "sample_cities": sample_cities_summary,
        "data_ready": cities_count > 0
    }


# ============ CUSTOMER AUTHENTICATION ============

@api_router.post("/customer/register")
async def register_customer(customer_data: CustomerCreate):
    """Register a new customer"""
    # Check if email already exists
    existing = await db.customers.find_one({"email": customer_data.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="Bu e-posta adresi zaten kayıtlı")
    
    # Create customer
    customer = Customer(
        email=customer_data.email.lower(),
        password_hash=get_password_hash(customer_data.password),
        name=customer_data.name,
        phone=customer_data.phone
    )
    
    await db.customers.insert_one(customer.model_dump())
    
    # Create welcome notification
    notification = Notification(
        customer_id=customer.id,
        type="system",
        title="Hoş Geldiniz!",
        message=f"Merhaba {customer.name}, Legend Cities'e hoş geldiniz!"
    )
    await db.notifications.insert_one(notification.model_dump())
    
    # Generate token
    token = create_access_token({"sub": customer.id, "type": "customer"})
    
    return {
        "message": "Kayıt başarılı",
        "token": token,
        "customer": {
            "id": customer.id,
            "email": customer.email,
            "name": customer.name,
            "phone": customer.phone
        }
    }

@api_router.post("/customer/login")
async def login_customer(login_data: CustomerLogin):
    """Customer login"""
    customer = await db.customers.find_one({"email": login_data.email.lower()})
    
    if not customer or not verify_password(login_data.password, customer["password_hash"]):
        raise HTTPException(status_code=401, detail="Geçersiz e-posta veya şifre")
    
    if not customer.get("active", True):
        raise HTTPException(status_code=403, detail="Hesabınız devre dışı bırakılmış")
    
    # Update last login
    await db.customers.update_one(
        {"id": customer["id"]},
        {"$set": {"last_login": datetime.now(timezone.utc)}}
    )
    
    token = create_access_token({"sub": customer["id"], "type": "customer"})
    
    return {
        "token": token,
        "customer": {
            "id": customer["id"],
            "email": customer["email"],
            "name": customer["name"],
            "phone": customer.get("phone"),
            "profile_image": customer.get("profile_image"),
            "favorites": customer.get("favorites", [])
        }
    }

async def get_current_customer(token: str = Depends(lambda: None)):
    """Get current customer from token - will be implemented with proper auth"""
    from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
    from jose import jwt, JWTError
    
    security = HTTPBearer()
    
    async def verify(credentials: HTTPAuthorizationCredentials = Depends(security)):
        try:
            payload = jwt.decode(
                credentials.credentials,
                os.environ.get("JWT_SECRET_KEY", "secret"),
                algorithms=["HS256"]
            )
            customer_id = payload.get("sub")
            token_type = payload.get("type")
            
            if token_type != "customer":
                raise HTTPException(status_code=401, detail="Geçersiz token türü")
            
            customer = await db.customers.find_one({"id": customer_id})
            if not customer:
                raise HTTPException(status_code=401, detail="Müşteri bulunamadı")
            
            return customer
        except JWTError:
            raise HTTPException(status_code=401, detail="Geçersiz token")
    
    return verify

# Create actual dependency
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError

customer_security = HTTPBearer(auto_error=False)

async def get_optional_customer(credentials: HTTPAuthorizationCredentials = Depends(customer_security)):
    """Get current customer if token provided"""
    if not credentials:
        return None
    try:
        payload = jwt.decode(
            credentials.credentials,
            os.environ.get("JWT_SECRET_KEY", "secret"),
            algorithms=["HS256"]
        )
        customer_id = payload.get("sub")
        token_type = payload.get("type")
        
        if token_type != "customer":
            return None
        
        customer = await db.customers.find_one({"id": customer_id})
        return customer
    except:
        return None

async def require_customer(credentials: HTTPAuthorizationCredentials = Depends(customer_security)):
    """Require authenticated customer"""
    if not credentials:
        raise HTTPException(status_code=401, detail="Giriş yapmanız gerekiyor")
    try:
        payload = jwt.decode(
            credentials.credentials,
            os.environ.get("JWT_SECRET_KEY", "secret"),
            algorithms=["HS256"]
        )
        customer_id = payload.get("sub")
        token_type = payload.get("type")
        
        if token_type != "customer":
            raise HTTPException(status_code=401, detail="Geçersiz token türü")
        
        customer = await db.customers.find_one({"id": customer_id})
        if not customer:
            raise HTTPException(status_code=401, detail="Müşteri bulunamadı")
        
        return customer
    except JWTError:
        raise HTTPException(status_code=401, detail="Geçersiz token")

@api_router.get("/customer/profile")
async def get_customer_profile(customer: dict = Depends(require_customer)):
    """Get customer profile"""
    return {
        "id": customer["id"],
        "email": customer["email"],
        "name": customer["name"],
        "phone": customer.get("phone"),
        "profile_image": customer.get("profile_image"),
        "favorites": customer.get("favorites", []),
        "saved_searches": customer.get("saved_searches", []),
        "price_alerts": customer.get("price_alerts", []),
        "created_at": customer.get("created_at")
    }

@api_router.put("/customer/profile")
async def update_customer_profile(update_data: CustomerUpdate, customer: dict = Depends(require_customer)):
    """Update customer profile"""
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    
    if update_dict:
        await db.customers.update_one(
            {"id": customer["id"]},
            {"$set": update_dict}
        )
    
    updated = await db.customers.find_one({"id": customer["id"]})
    return {
        "message": "Profil güncellendi",
        "customer": {
            "id": updated["id"],
            "email": updated["email"],
            "name": updated["name"],
            "phone": updated.get("phone"),
            "profile_image": updated.get("profile_image")
        }
    }

# ============ CUSTOMER FAVORITES ============

@api_router.post("/customer/favorites/{property_id}")
async def add_to_favorites(property_id: str, customer: dict = Depends(require_customer)):
    """Add property to favorites"""
    # Check if property exists
    property = await db.properties.find_one({"id": property_id})
    if not property:
        raise HTTPException(status_code=404, detail="İlan bulunamadı")
    
    favorites = customer.get("favorites", [])
    if property_id not in favorites:
        favorites.append(property_id)
        await db.customers.update_one(
            {"id": customer["id"]},
            {"$set": {"favorites": favorites}}
        )
    
    return {"message": "Favorilere eklendi", "favorites": favorites}

@api_router.delete("/customer/favorites/{property_id}")
async def remove_from_favorites(property_id: str, customer: dict = Depends(require_customer)):
    """Remove property from favorites"""
    favorites = customer.get("favorites", [])
    if property_id in favorites:
        favorites.remove(property_id)
        await db.customers.update_one(
            {"id": customer["id"]},
            {"$set": {"favorites": favorites}}
        )
    
    return {"message": "Favorilerden çıkarıldı", "favorites": favorites}

@api_router.get("/customer/favorites")
async def get_favorites(customer: dict = Depends(require_customer)):
    """Get customer's favorite properties"""
    favorites = customer.get("favorites", [])
    if not favorites:
        return {"properties": [], "total": 0}
    
    properties = await db.properties.find(
        {"id": {"$in": favorites}, "active": True}
    ).to_list(100)
    
    # Remove MongoDB _id
    for p in properties:
        p.pop("_id", None)
    
    return {"properties": properties, "total": len(properties)}

# ============ NOTIFICATIONS ============

@api_router.get("/customer/notifications")
async def get_notifications(
    unread_only: bool = False,
    limit: int = 20,
    customer: dict = Depends(require_customer)
):
    """Get customer notifications"""
    query = {"customer_id": customer["id"]}
    if unread_only:
        query["read"] = False
    
    notifications = await db.notifications.find(query).sort("created_at", -1).limit(limit).to_list(limit)
    
    for n in notifications:
        n.pop("_id", None)
    
    unread_count = await db.notifications.count_documents({"customer_id": customer["id"], "read": False})
    
    return {
        "notifications": notifications,
        "unread_count": unread_count
    }

@api_router.put("/customer/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, customer: dict = Depends(require_customer)):
    """Mark notification as read"""
    result = await db.notifications.update_one(
        {"id": notification_id, "customer_id": customer["id"]},
        {"$set": {"read": True}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Bildirim bulunamadı")
    
    return {"message": "Bildirim okundu olarak işaretlendi"}

@api_router.put("/customer/notifications/read-all")
async def mark_all_notifications_read(customer: dict = Depends(require_customer)):
    """Mark all notifications as read"""
    await db.notifications.update_many(
        {"customer_id": customer["id"], "read": False},
        {"$set": {"read": True}}
    )
    
    return {"message": "Tüm bildirimler okundu olarak işaretlendi"}

# ============ SAVED SEARCHES ============

@api_router.post("/customer/saved-searches")
async def save_search(
    name: str,
    criteria: dict,
    email_alert: bool = False,
    customer: dict = Depends(require_customer)
):
    """Save a search"""
    saved_search = {
        "id": str(uuid.uuid4()),
        "name": name,
        "criteria": criteria,
        "email_alert": email_alert,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.customers.update_one(
        {"id": customer["id"]},
        {"$push": {"saved_searches": saved_search}}
    )
    
    return {"message": "Arama kaydedildi", "saved_search": saved_search}

@api_router.delete("/customer/saved-searches/{search_id}")
async def delete_saved_search(search_id: str, customer: dict = Depends(require_customer)):
    """Delete a saved search"""
    await db.customers.update_one(
        {"id": customer["id"]},
        {"$pull": {"saved_searches": {"id": search_id}}}
    )
    
    return {"message": "Kayıtlı arama silindi"}

# ============ PRICE ALERTS ============

@api_router.post("/customer/price-alerts")
async def create_price_alert(
    property_id: str,
    target_price: float,
    customer: dict = Depends(require_customer)
):
    """Create a price drop alert for a property"""
    # Check if property exists
    property = await db.properties.find_one({"id": property_id})
    if not property:
        raise HTTPException(status_code=404, detail="İlan bulunamadı")
    
    price_alert = {
        "id": str(uuid.uuid4()),
        "property_id": property_id,
        "property_title": property.get("title"),
        "original_price": property.get("price"),
        "target_price": target_price,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.customers.update_one(
        {"id": customer["id"]},
        {"$push": {"price_alerts": price_alert}}
    )
    
    return {"message": "Fiyat alarmı oluşturuldu", "price_alert": price_alert}

@api_router.delete("/customer/price-alerts/{alert_id}")
async def delete_price_alert(alert_id: str, customer: dict = Depends(require_customer)):
    """Delete a price alert"""
    await db.customers.update_one(
        {"id": customer["id"]},
        {"$pull": {"price_alerts": {"id": alert_id}}}
    )
    
    return {"message": "Fiyat alarmı silindi"}

@api_router.get("/customer/price-alerts")
async def get_price_alerts(customer: dict = Depends(require_customer)):
    """Get all price alerts"""
    alerts = customer.get("price_alerts", [])
    
    # Enrich with current property prices
    for alert in alerts:
        property = await db.properties.find_one({"id": alert.get("property_id")})
        if property:
            alert["current_price"] = property.get("price")
            alert["price_dropped"] = property.get("price", 0) <= alert.get("target_price", 0)
    
    return {"price_alerts": alerts}


# Include router and add CORS
app.include_router(api_router)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
):
    """
    Process Google OAuth session from Emergent Auth
    Exchange session_id for user data and create/update customer
    """
    try:
        # Exchange session_id for user data from Emergent Auth
        async with httpx.AsyncClient(timeout=30.0) as http_client:
            auth_response = await http_client.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": session_id}
            )
            
            if auth_response.status_code != 200:
                raise HTTPException(
                    status_code=401,
                    detail="Geçersiz oturum. Lütfen tekrar giriş yapın."
                )
            
            user_data = auth_response.json()
    except httpx.RequestError as e:
        logger.error(f"OAuth session exchange error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Kimlik doğrulama servisi ile bağlantı kurulamadı"
        )
    
    # Extract user info
    email = user_data.get("email", "").lower()
    name = user_data.get("name", "")
    picture = user_data.get("picture", "")
    session_token = user_data.get("session_token", "")
    
    if not email:
        raise HTTPException(status_code=400, detail="E-posta adresi alınamadı")
    
    # Check if customer exists
    existing_customer = await db.customers.find_one({"email": email}, {"_id": 0})
    
    if existing_customer:
        # Update existing customer
        update_data = {
            "last_login": datetime.now(timezone.utc),
            "profile_image": picture if picture else existing_customer.get("profile_image"),
            "google_id": user_data.get("id"),
            "auth_provider": "google"
        }
        if not existing_customer.get("name"):
            update_data["name"] = name
            
        await db.customers.update_one(
            {"email": email},
            {"$set": update_data}
        )
        customer_id = existing_customer["id"]
        customer_name = existing_customer.get("name") or name
    else:
        # Create new customer
        customer_id = str(uuid.uuid4())
        new_customer = {
            "id": customer_id,
            "email": email,
            "name": name,
            "password_hash": "",  # No password for OAuth users
            "profile_image": picture,
            "google_id": user_data.get("id"),
            "auth_provider": "google",
            "favorites": [],
            "saved_searches": [],
            "price_alerts": [],
            "created_at": datetime.now(timezone.utc),
            "last_login": datetime.now(timezone.utc),
            "active": True,
            "email_verified": True  # Google emails are already verified
        }
        await db.customers.insert_one(new_customer)
        customer_name = name
        
        # Create welcome notification
        notification = {
            "id": str(uuid.uuid4()),
            "customer_id": customer_id,
            "type": "system",
            "title": "Hoş Geldiniz!",
            "message": f"Merhaba {name}, Legend Cities'e hoş geldiniz!",
            "read": False,
            "created_at": datetime.now(timezone.utc)
        }
        await db.notifications.insert_one(notification)
    
    # Store session in database
    session_doc = {
        "id": str(uuid.uuid4()),
        "customer_id": customer_id,
        "session_token": session_token,
        "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
        "created_at": datetime.now(timezone.utc)
    }
    await db.customer_sessions.insert_one(session_doc)
    
    # Set httpOnly cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=7 * 24 * 60 * 60,  # 7 days
        path="/"
    )
    
    # Also return JWT token for API calls
    jwt_token = create_access_token({
        "sub": customer_id,
        "type": "customer",
        "email": email
    })
    
    return {
        "success": True,
        "token": jwt_token,
        "customer": {
            "id": customer_id,
            "email": email,
            "name": customer_name,
            "profile_image": picture,
            "auth_provider": "google"
        }
    }


@api_router.get("/customer/auth/me")
async def get_current_customer_from_session(
    session_token: str = Cookie(None),
    credentials: HTTPAuthorizationCredentials = Depends(customer_security)
):
    """
    Get current customer from session cookie or Authorization header
    """
    customer = None
    
    # First try cookie-based session
    if session_token:
        session = await db.customer_sessions.find_one(
            {"session_token": session_token},
            {"_id": 0}
        )
        
        if session:
            # Check expiry
            expires_at = session.get("expires_at")
            if isinstance(expires_at, str):
                expires_at = datetime.fromisoformat(expires_at.replace("Z", "+00:00"))
            if expires_at.tzinfo is None:
                expires_at = expires_at.replace(tzinfo=timezone.utc)
            
            if expires_at > datetime.now(timezone.utc):
                customer = await db.customers.find_one(
                    {"id": session["customer_id"]},
                    {"_id": 0}
                )
    
    # Fallback to JWT token
    if not customer and credentials:
        try:
            payload = jwt.decode(
                credentials.credentials,
                SECRET_KEY,
                algorithms=["HS256"]
            )
            if payload.get("type") == "customer":
                customer = await db.customers.find_one(
                    {"id": payload["sub"]},
                    {"_id": 0}
                )
        except:
            pass
    
    if not customer:
        raise HTTPException(status_code=401, detail="Oturum geçersiz veya süresi dolmuş")
    
    if not customer.get("active", True):
        raise HTTPException(status_code=403, detail="Hesap devre dışı")
    
    return {
        "id": customer["id"],
        "email": customer["email"],
        "name": customer.get("name"),
        "phone": customer.get("phone"),
        "profile_image": customer.get("profile_image"),
        "favorites": customer.get("favorites", []),
        "auth_provider": customer.get("auth_provider", "email")
    }


@api_router.post("/customer/auth/logout")
async def logout_customer(
    response: Response,
    session_token: str = Cookie(None)
):
    """Logout customer and clear session"""
    if session_token:
        # Delete session from database
        await db.customer_sessions.delete_one({"session_token": session_token})
    
    # Clear cookie
    response.delete_cookie(
        key="session_token",
        path="/",
        secure=True,
        samesite="none"
    )
    
    return {"message": "Çıkış yapıldı"}


# Include router and add CORS
app.include_router(api_router)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
