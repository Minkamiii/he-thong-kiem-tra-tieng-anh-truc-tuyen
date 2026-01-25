FROM python:3.12-slim

WORKDIR /app

# Copy file requirements và cài thư viện
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy toàn bộ code
COPY . .

# Chạy Gateway ở port 8888
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8888"]