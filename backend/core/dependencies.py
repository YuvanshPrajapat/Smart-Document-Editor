from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt
from core.security import SECRET_KEY, ALGORITHM
from database import users_collection

# This tells FastAPI where to look for the token (the /auth/login route)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # 1. Decode the JWT token using your secret key
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
        # 2. Extract the USERNAME (which we saved as the "sub" in auth_routes.py)
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
            
    except jwt.PyJWTError: # Catches expired or invalid tokens
        raise credentials_exception
        
    # 3. Look up the user in MongoDB by their USERNAME
    user = await users_collection.find_one({"username": username})
    if user is None:
        raise credentials_exception
        
    # 4. Return the user dictionary so your routes know who is logged in!
    return user