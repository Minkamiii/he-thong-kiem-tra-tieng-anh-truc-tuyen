# from fastapi import FastAPI
# from app.routers import grading

# app = FastAPI(title="IELTS Grading Service")

# # Include the router we defined above
# app.include_router(grading.router, prefix="/api/v1", tags=["Grading"])

# @app.get("/")
# def health_check():
#     return {"status": "running", "message": "Microservice is active"}

from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.routers import grading
from app.core.db import create_db_and_tables

# This runs strictly once when the server starts
@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    print("✅ Database tables created.")
    yield

app = FastAPI(title="IELTS Grading Service", lifespan=lifespan)

app.include_router(grading.router, prefix="/api/v1", tags=["Grading"])

@app.get("/")
def health_check():
    return {"status": "running", "db": "connected"}