from fastapi import FastAPI, HTTPException, Request, Response, Header, APIRouter
from fastapi.middleware.cors import CORSMiddleware
import httpx
import os
from starlette.responses import StreamingResponse
from starlette.background import BackgroundTask

app = FastAPI(title="IELTS System Gateway")

# 1. CORS settings
# Allow requests from frontend (ViteJS on port 5173 and 5174)
origins = [
    "http://localhost:5173",
    "http://localhost:5174",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Microservices address settings
SERVICES = {
    "test": os.getenv("TEST_SERVICE_URL", "http://localhost:8000"),       # NestJS
    "comment": os.getenv("COMMENT_SERVICE_URL", "http://localhost:8001"), # NestJS
    "grading": os.getenv("GRADING_SERVICE_URL", "http://localhost:8003"), # Python
    "submit": os.getenv("SUBMIT_SERVICE_URL", "http://localhost:8080"), # Spring Boot
    "user": os.getenv("USER_SERVICE_URL", "http://localhost:8081"), # Spring Boot
}

# 3. Proxy functions (request forwarding)
async def forward_request(service_name: str, path: str, request: Request, prefix: str = ""):
    service_url = SERVICES.get(service_name)
    if not service_url:
        raise HTTPException(status_code=404, detail="Service not found")

    target_url = f"{service_url}{prefix}/{path}"
    print(f"Forwarding to: {target_url}")

    body = await request.body()
    params = dict(request.query_params)

    # Copy headers from request, remove 'host' and 'content-length' to avoid issues
    headers = dict(request.headers)
    headers.pop("host", None)
    headers.pop("content-length", None) 

    async with httpx.AsyncClient() as client:
        try:
            proxy_req = client.build_request(
                method=request.method,
                url=target_url,
                content=body,
                params=params,
                headers=headers, 
                timeout=60.0 
            )
            
            # No stream=True here, we want the full response content
            response = await client.send(proxy_req) 
            
            return response.content, response.status_code, response.headers
            
        except httpx.RequestError as e:
            print(f"Error forwarding to {service_name}: {e}")
            raise HTTPException(status_code=503, detail=f"{service_name} is down")

# Helper function to return FastAPI response from proxy results
async def proxy_response(service_name: str, path: str, request: Request, prefix: str = ""):
    content, status, headers = await forward_request(service_name, path, request, prefix)

    # ... đoạn code lấy base_url ...
    base_url = SERVICES.get(service_name)
    
    if not base_url:
        raise HTTPException(status_code=404, detail="Service not found")

    # --- THÊM ĐOẠN NÀY ĐỂ DEBUG ---
    final_url = f"{base_url}/{path}"
    if request.url.query:
        final_url += f"?{request.url.query}"
        
    print(f"DEBUG: Service={service_name}")
    print(f"DEBUG: Base URL={base_url}")
    print(f"DEBUG: Path received={path}")
    print(f"DEBUG: Calling Target URL -> {final_url}")
    # ------------------------------
    
    # Loại bỏ các header hop-by-hop
    excluded_headers = ['content-encoding', 'content-length', 'transfer-encoding', 'connection']
    filtered_headers = {k: v for k, v in headers.items() if k.lower() not in excluded_headers}
    
    from fastapi.responses import Response
    # Trả về Response thường (không phải StreamingResponse)
    return Response(content=content, status_code=status, headers=filtered_headers)

# ================= DEFINE ROUTES =================

# 1. TEST SERVICE (NestJS)
# Maps: /api/test/* -> http://localhost:8000/api/test/*
@app.api_route("/api/test/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def test_proxy(path: str, request: Request):
    return await proxy_response("test", f"api/test/{path}", request)

# 2. COMMENT SERVICE (NestJS)
# Maps: /api/comment/* -> http://localhost:8001/api/comment/*
@app.api_route("/api/comment/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def comment_proxy(path: str, request: Request):
    return await proxy_response("comment", f"api/comment/{path}", request)

# 3. SUBMIT SERVICE (Spring Boot)
# Maps: /api/submit/* -> http://localhost:8080/api/submit/*
@app.api_route("/api/submit/{path:path}", methods=["GET", "POST", "DELETE"])
async def submit_proxy(path: str, request: Request):
    return await proxy_response("submit", f"api/submit/{path}", request)

# Submit service also contains ANSWER CONTROLLER (/api/answer)
@app.api_route("/api/answer/{path:path}", methods=["GET", "DELETE"])
async def answer_proxy(path: str, request: Request):
    return await proxy_response("submit", f"api/answer/{path}", request)

@app.api_route("/api/answers/{path:path}", methods=["GET", "PUT"])
async def answers_proxy(path: str, request: Request):
    return await proxy_response("submit", f"api/answers/{path}", request)

# 4. GRADING SERVICE (Python AI)
# Maps: /api/ai/* -> http://localhost:8003/api/ai/*
@app.api_route("/api/ai/{path:path}", methods=["GET", "POST"])
async def grading_proxy(path: str, request: Request):
    return await proxy_response("grading", f"api/ai/{path}", request)

# 5. USER SERVICE - AUTH (Spring Boot)
# Maps: /api/auth/* -> http://localhost:8081/userservice/api/auth/*
# Notice: Added prefix "/userservice" 
@app.api_route("/api/auth/{path:path}", methods=["POST"])
async def auth_proxy(path: str, request: Request):
    return await proxy_response("user", f"api/auth/{path}", request, prefix="/userservice")

# 6. USER SERVICE - USER MANAGEMENT (Spring Boot)
# Maps: /api/user/* -> http://localhost:8081/userservice/api/user/*
# Notice: Added prefix "/userservice" into here
@app.api_route("/api/user/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def user_proxy(path: str, request: Request):
    return await proxy_response("user", f"api/user/{path}", request, prefix="/userservice")

# Health Check for Gateway
@app.get("/")
def health_check():
    return {"status": "Gateway is running", "services": SERVICES}

router = APIRouter()

# Khởi tạo client dùng chung để tối ưu connection pool
client = httpx.AsyncClient()

@router.on_event("shutdown")
async def shutdown_event():
    await client.aclose()

@app.get("/uploads/{path_name:path}")
async def proxy_file_access(
    path_name: str, 
    request: Request,
    range_header: str = Header(None, alias="Range") # Bắt header Range nếu client muốn tua
):
    """
    Proxy chung cho: Ảnh (view), Excel (download), Audio/Video (stream/seek)
    """
    target_url = f"{SERVICES.get('test')}/uploads/{path_name}"

    req_headers = {}
    if range_header:
        req_headers['Range'] = range_header

    req = client.build_request("GET", target_url, headers=req_headers)
 
    r = await client.send(req, stream=True)
    response_headers = {
        "Content-Type": r.headers.get("Content-Type"),           
        "Content-Disposition": r.headers.get("Content-Disposition"), 
        "Content-Length": r.headers.get("Content-Length"),          
        "Content-Range": r.headers.get("Content-Range"),             
        "Accept-Ranges": r.headers.get("Accept-Ranges"),         
    }
    
    response_headers = {k: v for k, v in response_headers.items() if v is not None}

    return StreamingResponse(
        content=r.aiter_bytes(),     
        status_code=r.status_code,   
        media_type=r.headers.get("content-type"),
        headers=response_headers,
        background=BackgroundTask(r.aclose) 
    )

@app.post("/image")
async def proxy_upload(request: Request):
    async with httpx.AsyncClient() as client:
        body = await request.body()
        headers = dict(request.headers)
        res = await client.post(
            f"{SERVICES.get('test')}/image",
            content=body,
            headers=headers
        )
        return res.json()

@app.post("/audio")
async def proxy_upload_audio(request: Request):
    async with httpx.AsyncClient() as client:
        body = await request.body()
        headers = dict(request.headers)
        res = await client.post(
            f"{SERVICES.get('test')}/audio",
            content=body,
            headers=headers
        )
        return res.json()

@app.post("/excel")
async def proxy_upload_excel(request: Request):
    async with httpx.AsyncClient() as client:
        body = await request.body()
        headers = dict(request.headers)
        res = await client.post(
            f"{SERVICES.get('test')}/excel",
            content=body,
            headers=headers
        )
        return res.json()
