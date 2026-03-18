from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from image_processor import ImageProcessor
from ocrengine import OCREngine
from handwriting_engine import HandwritingEngine
import io
from PIL import Image

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

# Initialize your modules
processor = ImageProcessor()
ocr = OCREngine()
handwriting = HandwritingEngine()

@app.post("/api/v1/extract")
async def extract_content(file: UploadFile = File(...)):
    try:
        # Read the file
        file_bytes = await file.read()
        
        # 1. Validate the image
        processor.validate_image(file_bytes, file.filename)
        
        # 2. Preprocess (returns a clean Grayscale PIL Image)
        clean_image = processor.preprocess_for_ocr(file_bytes)
        
        # 3. Extract Text via OCR
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


@app.post("/api/v1/extract/handwriting")
async def extract_handwriting_content(file: UploadFile = File(...)):
    try:
        file_bytes = await file.read()
        processor.validate_image(file_bytes, file.filename)
        
        # Open the raw image
        raw_image = Image.open(io.BytesIO(file_bytes))
        
        # Extract using the new TrOCR model
        extracted_text = handwriting.extract_handwriting(raw_image)
        
        return {
            "status": "success",
            "data": { "type": "handwriting", "content": extracted_text }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)