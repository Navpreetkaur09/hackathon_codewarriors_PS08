from fastapi import FastAPI
from app.routes import router

app = FastAPI(title="Media Analysis Backend")

app.include_router(router)