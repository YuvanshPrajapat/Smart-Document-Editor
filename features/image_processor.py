import io
from PIL import Image

class ImageProcessor:
    def __init__(self):
        #Max Size that can be uploaded
        self.max_file_size = 5 * 1024 * 1024 
        self.allowed_formats = ["JPEG", "PNG", "WEBP"]

    def validate_image(self, file_bytes: bytes, filename: str) -> bool:
        """
        Validates the image size and format.
        """
        # File Size Check
        if len(file_bytes) > self.max_file_size:
            raise ValueError(f"File {filename} exceeds the 5MB limit.")

        # Check if valid format is Uploaded
        try:
            image = Image.open(io.BytesIO(file_bytes))
            if image.format not in self.allowed_formats:
                raise ValueError(f"Unsupported format: {image.format}. Allowed: {self.allowed_formats}")
            return True
        except Exception as e:
            raise ValueError("Invalid image file.") from e

    def preprocess_for_ocr(self, file_bytes: bytes) -> Image.Image:
        """
        Prepares the image for the OCR/Formula engine.
        """
        image = Image.open(io.BytesIO(file_bytes))
        
        gray_image = image.convert('L')
        
        return gray_image