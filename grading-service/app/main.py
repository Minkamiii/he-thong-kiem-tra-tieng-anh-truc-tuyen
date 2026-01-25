from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.routers import grading

app = FastAPI(title="IELTS Grading Service") #lifespan=lifespan

app.include_router(grading.router, prefix="/api/ai", tags=["Grading"])

@app.get("/api/ai")
def health_check():
    return {"status": "running"} # "db": "connected"