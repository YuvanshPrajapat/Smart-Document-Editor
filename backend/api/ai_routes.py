from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from core.dependencies import get_current_user
import io
from PIL import Image

# Import your teammate's AI engines
from image_processor import ImageProcessor
from ocrengine import OCREngine
from formula_engine import FormulaEngine
from handwriting_engine import HandwritingEngine

router = APIRouter(prefix="/ai", tags=["AI Features"])

# Initialize the modules once when the server starts
processor = ImageProcessor()
ocr = OCREngine()
formula = FormulaEngine()
handwriting = HandwritingEngine()

# 1. TEXT OCR ENDPOINT
@router.post("/ocr")
async def extract_content(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    try:
        file_bytes = await file.read()
        processor.validate_image(file_bytes, file.filename)
        clean_image = processor.preprocess_for_ocr(file_bytes)
        extracted_text = ocr.extract_text(clean_image)
        
        return {
            "status": "success",
            "message": "Content extracted successfully.",
            "data": {
                "text": extracted_text,
                "formula_latex": None
            }
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

# 2. MATH/LATEX ENDPOINT
@router.post("/formula")
async def extract_math_content(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    try:
        file_bytes = await file.read()
        processor.validate_image(file_bytes, file.filename)
        
        raw_image = Image.open(io.BytesIO(file_bytes))
        extracted_latex = formula.extract_latex(raw_image)
        
        return {
            "status": "success",
            "data": { "type": "latex", "content": extracted_latex }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 3. HANDWRITING ENDPOINT
@router.post("/handwriting")
async def extract_handwriting_content(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    try:
        file_bytes = await file.read()
        processor.validate_image(file_bytes, file.filename)
        
        raw_image = Image.open(io.BytesIO(file_bytes))
        extracted_text = handwriting.extract_handwriting(raw_image)
        
        return {
            "status": "success",
            "data": { "type": "handwriting", "content": extracted_text }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
