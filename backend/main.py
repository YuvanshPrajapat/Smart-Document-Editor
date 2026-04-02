from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.auth_routes import router as auth_router
from api.doc_routes import router as doc_router
from api.ai_routes import router as ai_router
from api.ws_routes import router as ws_router

app = FastAPI(title="Smart Document Editor API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(doc_router)
app.include_router(ai_router)
app.include_router(ws_router)

@app.get("/")
async def root():
    return {"status": "success", "message": "Smart Document API is up and running!"}