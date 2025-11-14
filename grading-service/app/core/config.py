import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "IELTS Grading Service"
    GOOGLE_API_KEY: str 
    DATABASE_URL: str  # <--- ADD THIS LINE

    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'
        # Optional: This tells Pydantic to ignore other random Docker variables
        extra = "ignore" 

settings = Settings()