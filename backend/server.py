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
