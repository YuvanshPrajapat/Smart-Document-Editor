# models/user.py
from pydantic import BaseModel, EmailStr

# Schema for when a user registers
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

# Schema for sending user data back (without the password!)
class UserResponse(BaseModel):
    username: str
    email: EmailStr

# Schema for your JWT Token response
class Token(BaseModel):
    access_token: str
    token_type: str