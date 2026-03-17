# core/security.py
from passlib.context import CryptContext
import jwt
from datetime import datetime, timedelta, timezone
import os
from dotenv import load_dotenv

# Load your secret variables from .env
load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

# Set up the Bcrypt password hasher
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Checks if a plain password matches the hashed one in the database."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Converts a plain password into a secure hash."""
    return pwd_context.hash(password)

def create_access_token(data: dict) -> str:
    """Generates the JWT Token."""
    to_encode = data.copy()
    
    # Set expiration time for the token
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    
    # Create the actual encoded token string
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt