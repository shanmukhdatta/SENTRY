# 🥬 VeggieVerify - Produce Details QR Generator

**VeggieVerify** is a modern, high-performance web application built with **FastAPI**, **Uvicorn**, and **Pydantic V2** that generates digital passports and scannable QR codes for fresh produce (vegetables and fruits). 

Enter produce attributes (name, harvest age, condition rating, farm origin), generate a QR code, and scan it with any smartphone camera to view a verified produce digital pass.

---

## ✨ Features

- **📱 Scannable QR Passport**: Generates high-error-correction (`ERROR_CORRECT_H`) QR codes formatted specifically for clear legibility on all mobile camera apps (iOS Camera, Android Google Lens, WhatsApp).
- **🔒 Security & Input Validation**: 
  - Strict Pydantic V2 schema validation (`@field_validator`) for produce attributes.
  - Regex filename sanitization to protect against path traversal attacks.
  - Automatic 24-hour cleanup for expired QR code images.
- **📥 One-Click Download**: Save generated QR codes directly as high-resolution PNG images with sanitized product filenames.
- **🎨 Glassmorphism & Responsive UI**: Clean, mobile-friendly green design system built with CSS variables, smooth micro-animations, and Inter typography.
- **⚡ Fast & Lightweight**: Zero external JavaScript framework overhead; pure FastAPI + Vanilla JS.

---

## 🛠️ Technology Stack

- **Backend**: Python 3.11+, [FastAPI](https://fastapi.tiangolo.com/), [Uvicorn](https://www.uvicorn.org/), [Pydantic V2](https://docs.pydantic.dev/)
- **QR Generation**: [qrcode](https://pypi.org/project/qrcode/), [Pillow](https://python-pillow.org/)
- **Frontend**: HTML5, Vanilla JavaScript, CSS3
- **Template Engine**: [Jinja2](https://jinja.palletsprojects.com/)
- **Icons & Fonts**: Font Awesome 6, Google Inter Font

---

## 📁 Project Structure

```
IAM_Project/
├── main.py              # FastAPI server, REST routes & QR code engine
├── requirements.txt     # Python package dependencies
├── README.md            # Project documentation
├── templates/
│   └── index.html       # Single-page web dashboard
├── static/
│   ├── css/
│   │   └── style.css    # Responsive CSS styling & animations
│   └── js/
│       └── script.js    # Client-side form handling & AJAX API calls
└── generated_qr/        # Auto-created directory for storing QR PNGs
```

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure Python 3.11 or higher is installed on your system:
```bash
python --version
```

### 2. Clone Repository & Install Dependencies
```bash
git clone https://github.com/shanmukhdatta/SENTRY.git
cd SENTRY
pip install -r requirements.txt
```

### 3. Run Application Server
```bash
python main.py
```
*Or using Uvicorn directly:*
```bash
uvicorn main:app --reload --port 8000
```

### 4. Access Web Interface
Open your browser and visit:
👉 **`http://127.0.0.1:8000`**

---

## 📡 API Reference

### 1. Serve Web UI
`GET /`
- **Response**: `HTMLResponse` (Renders `index.html`)

### 2. Generate Produce QR Code
`POST /generate-qr`

**Request Body (`application/json`):**
```json
{
  "product": "Organic Honeycrisp Apple",
  "age_days": 12,
  "condition": "Excellent",
  "origin": "Valley Organic Orchard, WA"
}
```

**Response (`application/json`):**
```json
{
  "success": true,
  "qr_url": "/generated_qr/Organic_Honeycrisp_Apple_20260818_231357_QR_Code.png",
  "data": {
    "product": "Organic Honeycrisp Apple",
    "age_days": 12,
    "condition": "Excellent",
    "origin": "Valley Organic Orchard, WA"
  }
}
```

---

## 📱 Scanned QR Code Output Format

When scanned by a smartphone camera or barcode scanner app, the QR code displays:

```text
=== VEGGIEVERIFY PRODUCE DETAILS ===

* Product Name : Organic Honeycrisp Apple
* Harvest Age  : 12 Days
* Condition    : Excellent
* Origin / Farm: Valley Organic Orchard, WA

* Verified At  : 2026-08-18 23:13:57
=====================================
```

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
