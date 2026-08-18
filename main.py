from fastapi import FastAPI, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from pydantic import BaseModel, field_validator
import qrcode
from qrcode.constants import ERROR_CORRECT_H
import os
import re
import time
import tempfile
from datetime import datetime
from pathlib import Path

# Initialize FastAPI app
app = FastAPI(title="VeggieVerify - Vegetable Details QR Generator")

# Create necessary directories (Compatible with Vercel serverless read-only filesystem)
BASE_DIR = Path(__file__).resolve().parent
GENERATED_QR_DIR = Path(tempfile.gettempdir()) / "veggie_qr_codes"
GENERATED_QR_DIR.mkdir(exist_ok=True)

# Mount static files and templates
app.mount("/static", StaticFiles(directory=str(BASE_DIR / "static")), name="static")
app.mount("/generated_qr", StaticFiles(directory=str(GENERATED_QR_DIR)), name="generated_qr")
templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))

# Pydantic model for input validation (Pydantic V2 compatible)
class QRCodeRequest(BaseModel):
    product: str
    age_days: int
    condition: str
    origin: str

    @field_validator('product')
    @classmethod
    def validate_product(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError('Product name cannot be empty')
        if len(v) > 100:
            raise ValueError('Product name is too long')
        return v

    @field_validator('age_days')
    @classmethod
    def validate_age(cls, v: int) -> int:
        if v < 0:
            raise ValueError('Age must be a positive integer')
        if v > 3650:  # Max 10 years
            raise ValueError('Age is too large')
        return v

    @field_validator('condition')
    @classmethod
    def validate_condition(cls, v: str) -> str:
        allowed_conditions = ['Excellent', 'Good', 'Average', 'Poor']
        if v not in allowed_conditions:
            raise ValueError('Invalid condition')
        return v

    @field_validator('origin')
    @classmethod
    def validate_origin(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError('Origin cannot be empty')
        if len(v) > 200:
            raise ValueError('Origin is too long')
        return v

# Response model
class QRCodeResponse(BaseModel):
    success: bool
    qr_url: str
    data: dict

def sanitize_filename(filename: str) -> str:
    """Sanitize filename to prevent path traversal and invalid characters."""
    filename = os.path.basename(filename)
    filename = re.sub(r'[^\w\-_]', '_', filename)
    return filename[:100]

def generate_qr_code(data: dict, filename: str) -> str:
    """Generate QR code with clean, high-legibility formatting for all scanners."""
    qr_content = f"""=== VEGGIEVERIFY PRODUCE DETAILS ===

* Product Name : {data['product']}
* Harvest Age  : {data['age_days']} Days
* Condition    : {data['condition']}
* Origin / Farm: {data['origin']}

* Verified At  : {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
====================================="""
    
    # QR code configuration
    qr = qrcode.QRCode(
        version=1,
        error_correction=ERROR_CORRECT_H,  # High error correction
        box_size=10,
        border=4,
    )
    
    # Add data
    qr.add_data(qr_content)
    qr.make(fit=True)
    
    # Create QR code image
    qr_image = qr.make_image(fill_color="black", back_color="white")
    
    # Save image
    file_path = GENERATED_QR_DIR / filename
    qr_image.save(file_path)
    
    return str(file_path)

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    """Serve the frontend."""
    return templates.TemplateResponse(request=request, name="index.html")

@app.post("/generate-qr", response_model=QRCodeResponse)
async def generate_qr(request: QRCodeRequest):
    """Generate QR code from vegetable/fruit details."""
    try:
        data = {
            "product": request.product,
            "age_days": request.age_days,
            "condition": request.condition,
            "origin": request.origin
        }
        
        base_filename = sanitize_filename(request.product)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{base_filename}_{timestamp}_QR_Code.png"
        
        generate_qr_code(data, filename)
        
        return QRCodeResponse(
            success=True,
            qr_url=f"/generated_qr/{filename}",
            data=data
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate QR code: {str(e)}") from e

def cleanup_old_files():
    """Remove QR files older than 24 hours."""
    try:
        current_time = time.time()
        for file in GENERATED_QR_DIR.glob("*.png"):
            if current_time - file.stat().st_mtime > 86400:
                file.unlink()
    except Exception:
        pass

cleanup_old_files()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
