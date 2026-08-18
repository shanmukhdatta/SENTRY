// ==========================================
// VeggieVerify - Main JavaScript
// ==========================================

// DOM Elements
const qrForm = document.getElementById('qrForm');
const formCard = document.getElementById('formCard');
const resultCard = document.getElementById('resultCard');
const generateBtn = document.getElementById('generateBtn');
const downloadBtn = document.getElementById('downloadBtn');
const resetBtn = document.getElementById('resetBtn');
const errorMessage = document.getElementById('errorMessage');
const qrCodeImage = document.getElementById('qrCodeImage');

// Form inputs
const productInput = document.getElementById('product');
const ageInput = document.getElementById('age_days');
const conditionSelect = document.getElementById('condition');
const originInput = document.getElementById('origin');

// Result details
const detailProduct = document.getElementById('detailProduct');
const detailAge = document.getElementById('detailAge');
const detailCondition = document.getElementById('detailCondition');
const detailOrigin = document.getElementById('detailOrigin');

// State
let currentQRUrl = '';
let currentProductName = '';

// Validation functions
function validateForm() {
    const errors = [];
    
    // Validate product name
    const product = productInput.value.trim();
    if (!product) {
        errors.push('Product name is required');
    } else if (product.length > 100) {
        errors.push('Product name must be less than 100 characters');
    }
    
    // Validate age
    const age = parseInt(ageInput.value);
    if (!ageInput.value.trim()) {
        errors.push('Age is required');
    } else if (isNaN(age) || age < 0) {
        errors.push('Age must be a positive number');
    } else if (age > 3650) {
        errors.push('Age is too large');
    }
    
    // Validate condition
    if (!conditionSelect.value) {
        errors.push('Please select a condition');
    }
    
    // Validate origin
    const origin = originInput.value.trim();
    if (!origin) {
        errors.push('Origin is required');
    } else if (origin.length > 200) {
        errors.push('Origin must be less than 200 characters');
    }
    
    return errors;
}

// Show error message
function showError(errors) {
    if (errors.length > 0) {
        errorMessage.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${errors[0]}`;
        errorMessage.style.display = 'flex';
    } else {
        errorMessage.style.display = 'none';
    }
}

// Clear error message
function clearError() {
    errorMessage.style.display = 'none';
    errorMessage.innerHTML = '';
}

// Show loading state
function showLoading() {
    generateBtn.disabled = true;
    generateBtn.innerHTML = `
        <span class="spinner"></span>
        <span class="btn-text">Generating...</span>
    `;
}

// Hide loading state
function hideLoading() {
    generateBtn.disabled = false;
    generateBtn.innerHTML = `
        <i class="fas fa-qrcode"></i>
        <span class="btn-text">Generate QR Code</span>
    `;
}

// Generate QR code
async function generateQRCode(event) {
    event.preventDefault();
    
    clearError();
    
    const errors = validateForm();
    if (errors.length > 0) {
        showError(errors);
        return;
    }
    
    showLoading();
    
    const data = {
        product: productInput.value.trim(),
        age_days: parseInt(ageInput.value),
        condition: conditionSelect.value,
        origin: originInput.value.trim()
    };
    
    try {
        const response = await fetch('/generate-qr', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to generate QR code');
        }
        
        const result = await response.json();
        
        if (result.success) {
            currentQRUrl = result.qr_url;
            currentProductName = result.data.product;
            
            qrCodeImage.src = result.qr_url;
            
            detailProduct.textContent = result.data.product;
            detailAge.textContent = `${result.data.age_days} days`;
            detailCondition.textContent = result.data.condition;
            detailOrigin.textContent = result.data.origin;
            
            formCard.style.display = 'none';
            resultCard.style.display = 'block';
            
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    } catch (error) {
        console.error('Error:', error);
        showError([error.message || 'An error occurred while generating QR code']);
    } finally {
        hideLoading();
    }
}

// Download QR code
async function downloadQRCode() {
    if (!currentQRUrl) {
        return;
    }
    
    try {
        const response = await fetch(currentQRUrl);
        const blob = await response.blob();
        
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        const sanitizedName = currentProductName.replace(/[^\w\-_]/g, '_').slice(0, 100);
        link.download = `${sanitizedName}_QR_Code.png`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error downloading QR code:', error);
        alert('Failed to download QR code. Please try again.');
    }
}

// Reset form
function resetForm() {
    qrForm.reset();
    clearError();
    
    currentQRUrl = '';
    currentProductName = '';
    
    formCard.style.display = 'block';
    resultCard.style.display = 'none';
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
    productInput.focus();
}

// Event listeners
if (qrForm) qrForm.addEventListener('submit', generateQRCode);
if (downloadBtn) downloadBtn.addEventListener('click', downloadQRCode);
if (resetBtn) resetBtn.addEventListener('click', resetForm);

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    clearError();
});
