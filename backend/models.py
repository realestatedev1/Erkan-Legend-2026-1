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
    area_sqm: Optional[float] = None
    rooms: Optional[str] = None  # "2+1", "3+1", etc.
    bathrooms: Optional[int] = None
    floor: Optional[str] = None
    total_floors: Optional[int] = None
    age: Optional[int] = None
    heating: Optional[str] = None
    furnished: Optional[bool] = None
    parking: Optional[bool] = None
    balcony: Optional[bool] = None
    elevator: Optional[bool] = None
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
    area_sqm: Optional[float] = None
    rooms: Optional[str] = None
    bathrooms: Optional[int] = None
    floor: Optional[str] = None
    total_floors: Optional[int] = None
    age: Optional[int] = None
    heating: Optional[str] = None
    furnished: Optional[bool] = None
    parking: Optional[bool] = None
    balcony: Optional[bool] = None
    elevator: Optional[bool] = None
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
