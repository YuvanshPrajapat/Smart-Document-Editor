# class ImageProcessor():

#     def get_format():
#         pass

#     def validate_image():
#         pass
    
#     def image_preprocess():
#         pass

import io
# pyright: ignore[reportMissingImports]
from PIL import Image

class ImageProcessor:
    def __init__(self):
        # Set a maximum file size (e.g., 5MB)
        self.max_file_size = 5 * 1024 * 1024 
        self.allowed_formats = ["JPEG", "PNG", "WEBP"]

    def validate_image(self, file_bytes: bytes, filename: str) -> bool:
        """
        Validates the image size and format.
        """
        # 1. Check file size
        if len(file_bytes) > self.max_file_size:
            raise ValueError(f"File {filename} exceeds the 5MB limit.")

        # 2. Check format
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
        (e.g., converting to Grayscale to make text pop).
        """
        image = Image.open(io.BytesIO(file_bytes))
        
        # Convert to grayscale to improve OCR accuracy
        gray_image = image.convert('L')
        
        # You can add more complex OpenCV logic here later (like thresholding)
        return gray_image