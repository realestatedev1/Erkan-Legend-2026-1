from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime, timezone
import uuid

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    password_hash: str
    role: str  # "super_admin" or "franchise_admin"
    franchise_id: Optional[str] = None
    name: str
    email: str
    phone: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    active: bool = True

class UserCreate(BaseModel):
    username: str
    password: str
    role: str
    franchise_id: Optional[str] = None
    name: str
    email: str
    phone: str

class UserLogin(BaseModel):
    username: str
    password: str

class Franchise(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    office_name: str
    address: str
    city: str
    district: str
    phone: str
    email: str
    manager_name: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    logo_url: Optional[str] = None
    active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class FranchiseCreate(BaseModel):
    office_name: str
    address: str
    city: str
    district: str
    phone: str
    email: str
    manager_name: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class Property(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    property_type: str  # "sale" or "rent"
    category: str  # "residential", "commercial", "land", "tourism"
    sub_category: Optional[str] = None  # "apartment", "villa", "office", etc.
    price: float
    currency: str = "TRY"
    city: str
    district: str
    neighborhood: Optional[str] = None
    address: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    
    # Alan bilgileri
    area_gross: Optional[float] = None  # Brüt m²
    area_net: Optional[float] = None  # Net m²
    area_sqm: Optional[float] = None  # Eski alan (geriye uyumluluk)
    
    # Oda bilgileri
    rooms: Optional[str] = None  # "2+1", "3+1", etc.
    bathrooms: Optional[int] = None
    
    # Kat bilgileri
    floor: Optional[str] = None  # Bulunduğu kat
    total_floors: Optional[int] = None  # Toplam kat sayısı
    
    # Bina bilgileri
    age: Optional[int] = None  # Bina yaşı
    building_type: Optional[str] = None  # "apartment", "residence", "villa", etc.
    
    # Isınma ve özellikler
    heating: Optional[str] = None  # "dogalgaz", "merkezi", "kombi", "soba", "klima"
    furnished: Optional[str] = None  # "evet", "hayir", "kismen"
    usage_status: Optional[str] = None  # "bos", "kiracili", "mulk_sahibi"
    
    # Ek özellikler
    parking: Optional[str] = None  # "yok", "acik", "kapali"
    balcony: Optional[bool] = None
    elevator: Optional[bool] = None
    in_complex: Optional[bool] = None  # Site içinde
    smart_home: Optional[bool] = None  # Akıllı ev
    security: Optional[bool] = None  # Güvenlik
    pool: Optional[bool] = None  # Havuz
    gym: Optional[bool] = None  # Spor salonu
    garden: Optional[bool] = None  # Bahçe
    terrace: Optional[bool] = None  # Teras
    
    # Finansal bilgiler
    dues: Optional[float] = None  # Aidat
    credit_eligible: Optional[bool] = None  # Krediye uygun
    exchange: Optional[bool] = None  # Takas
    
    # Cephe bilgisi
    facade: Optional[str] = None  # "kuzey", "guney", "dogu", "bati", "kuzey-guney", etc.
    
    images: List[str] = []
    features: List[str] = []
    franchise_id: str
    created_by: str
    active: bool = True
    featured: bool = False
    view_count: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PropertyCreate(BaseModel):
    title: str
    description: str
    property_type: str
    category: str
    sub_category: Optional[str] = None
    price: float
    currency: str = "TRY"
    city: str
    district: str
    neighborhood: Optional[str] = None
    address: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    
    # Alan bilgileri
    area_gross: Optional[float] = None
    area_net: Optional[float] = None
    area_sqm: Optional[float] = None
    
    # Oda bilgileri
    rooms: Optional[str] = None
    bathrooms: Optional[int] = None
    
    # Kat bilgileri
    floor: Optional[str] = None
    total_floors: Optional[int] = None
    
    # Bina bilgileri
    age: Optional[int] = None
    building_type: Optional[str] = None
    
    # Isınma ve özellikler
    heating: Optional[str] = None
    furnished: Optional[str] = None
    usage_status: Optional[str] = None
    
    # Ek özellikler
    parking: Optional[str] = None
    balcony: Optional[bool] = None
    elevator: Optional[bool] = None
    in_complex: Optional[bool] = None
    smart_home: Optional[bool] = None
    security: Optional[bool] = None
    pool: Optional[bool] = None
    gym: Optional[bool] = None
    garden: Optional[bool] = None
    terrace: Optional[bool] = None
    
    # Finansal bilgiler
    dues: Optional[float] = None
    credit_eligible: Optional[bool] = None
    exchange: Optional[bool] = None
    
    # Cephe bilgisi
    facade: Optional[str] = None
    
    features: List[str] = []
    featured: bool = False

class ContactMessage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: str
    message: str
    property_id: Optional[str] = None
    franchise_id: Optional[str] = None
    read: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ContactMessageCreate(BaseModel):
    name: str
    email: str
    phone: str
    message: str
    property_id: Optional[str] = None
    franchise_id: Optional[str] = None

class CareerApplication(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: str
    position: str
    experience: Optional[str] = None
    education: Optional[str] = None
    cv_url: Optional[str] = None
    cover_letter: Optional[str] = None
    read: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CareerApplicationCreate(BaseModel):
    name: str
    email: str
    phone: str
    position: str
    experience: Optional[str] = None
    education: Optional[str] = None
    cover_letter: Optional[str] = None

class FranchiseApplication(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: str
    city: str
    experience: Optional[str] = None
    investment_amount: Optional[str] = None
    message: Optional[str] = None
    read: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class FranchiseApplicationCreate(BaseModel):
    name: str
    email: str
    phone: str
    city: str
    experience: Optional[str] = None
    investment_amount: Optional[str] = None
    message: Optional[str] = None


# ============ CUSTOMER MODELS ============

class Customer(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    password_hash: str
    name: str
    phone: Optional[str] = None
    profile_image: Optional[str] = None
    favorites: List[str] = []  # Property IDs
    saved_searches: List[dict] = []  # Saved search criteria
    price_alerts: List[dict] = []  # Price alert subscriptions
    email_subscriptions: List[dict] = []  # Email subscription preferences
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_login: Optional[datetime] = None
    active: bool = True
    email_verified: bool = False

class CustomerCreate(BaseModel):
    email: str
    password: str
    name: str
    phone: Optional[str] = None

class CustomerLogin(BaseModel):
    email: str
    password: str

class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    profile_image: Optional[str] = None

# ============ NOTIFICATION MODELS ============

class Notification(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_id: str
    type: str  # "price_drop", "new_listing", "favorite_update", "system"
    title: str
    message: str
    data: Optional[dict] = None  # Additional data (property_id, etc.)
    read: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SavedSearch(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    criteria: dict  # Search filters
    email_alert: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PriceAlert(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    property_id: str
    target_price: float
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ============ CONSULTANT MODELS ============

class Consultant(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    franchise_id: str  # Bağlı olduğu ofis
    name: str
    title: str = "Gayrimenkul Danışmanı"  # Ünvan
    phone: str
    email: str
    photo_url: Optional[str] = None
    bio: Optional[str] = None  # Kısa biyografi
    specialization: Optional[List[str]] = None  # Uzmanlık alanları: ["konut", "ticari", "arsa"]
    languages: Optional[List[str]] = None  # Bilinen diller
    experience_years: Optional[int] = None  # Deneyim yılı
    social_media: Optional[dict] = None  # {"linkedin": "...", "instagram": "..."}
    active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ConsultantCreate(BaseModel):
    franchise_id: str
    name: str
    title: str = "Gayrimenkul Danışmanı"
    phone: str
    email: str
    photo_url: Optional[str] = None
    bio: Optional[str] = None
    specialization: Optional[List[str]] = None
    languages: Optional[List[str]] = None
    experience_years: Optional[int] = None
    social_media: Optional[dict] = None

class ConsultantUpdate(BaseModel):
    name: Optional[str] = None
    title: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    photo_url: Optional[str] = None
    bio: Optional[str] = None
    specialization: Optional[List[str]] = None
    languages: Optional[List[str]] = None
    experience_years: Optional[int] = None
    social_media: Optional[dict] = None
    active: Optional[bool] = None

