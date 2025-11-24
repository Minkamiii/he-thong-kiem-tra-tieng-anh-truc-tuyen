# 1. Base Image: Use official lightweight Python
FROM python:3.12-slim

# 2. Set Environment Variables
# Prevents Python from writing pyc files to disc
ENV PYTHONDONTWRITEBYTECODE=1 
# Prevents Python from buffering stdout and stderr
ENV PYTHONUNBUFFERED=1 

# 3. Set Work Directory
WORKDIR /app

# 4. Install Dependencies
# Copy just requirements first to leverage Docker cache
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copy Project Code
COPY . .

# 6. Expose Port (Documentation only, practically handled by Compose)
EXPOSE 8003

# 7. Run Command
# Uses uvicorn to run the app
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8003", "--reload"]