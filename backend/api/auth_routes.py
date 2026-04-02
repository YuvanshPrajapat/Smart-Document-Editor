# api/auth_routes.py
from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordRequestForm
from database import users_collection
from models.user import UserCreate, UserResponse, Token
from core.security import get_password_hash, verify_password, create_access_token
from datetime import datetime, timezone

# Create a router specifically for authentication
router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(user: UserCreate):
    # 1. Check if the user already exists in the database
    existing_user = await users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # 2. Hash the password
    hashed_password = get_password_hash(user.password)
    
    # 3. Create the user dictionary to store in MongoDB
    user_dict = {
        "username": user.username,
        "email": user.email,
        "hashed_password": hashed_password,
        "created_at": datetime.now(timezone.utc)
    }
    
    # 4. Insert into MongoDB
    await users_collection.insert_one(user_dict)
    
    # 5. Return the created user (FastAPI uses UserResponse to hide the password)
    return user_dict


@router.post("/login", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    # 1. Find the user by USERNAME
    user = await users_collection.find_one({"username": form_data.username})
    
    # 2. Check if user exists AND password is correct
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password", # Updated the error message!
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 3. Create the JWT Token
    access_token = create_access_token(data={"sub": user["username"]})
    
    # 4. Return the token to the user
    return {"access_token": access_token, "token_type": "bearer"}