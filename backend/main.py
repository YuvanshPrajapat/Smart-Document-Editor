# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# IMPORT your new auth router
from api.auth_routes import router as auth_router

app = FastAPI(title="Smart Document Editor API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# INCLUDE the router in the app
app.include_router(auth_router)

@app.get("/")
async def root():
    return {"status": "success", "message": "Smart Document API is up and running!"}

