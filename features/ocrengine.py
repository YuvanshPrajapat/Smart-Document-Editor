import pytesseract
from PIL import Image

class OCREngine:
    def __init__(self):
        # For Windows 
        pytesseract.pytesseract.tesseract_cmd = r'C:\Users\risha\AppData\Local\Programs\Tesseract-OCR\tesseract.exe'
        

    def extract_text(self, image: Image.Image) -> str:
        try:
            # '--psm 3' tells Tesseract to automatically segment the page and look for blocks of text.
            extracted_text = pytesseract.image_to_string(image, config='--psm 3')
            
            # Clean up the leading or trailing whitespace
            return extracted_text.strip()
            
        except Exception as e:
            raise RuntimeError(f"OCR Engine failed to extract text: {str(e)}")