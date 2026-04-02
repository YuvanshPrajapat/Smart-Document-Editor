from transformers import TrOCRProcessor, VisionEncoderDecoderModel
from PIL import Image
import cv2
import numpy as np

class HandwritingEngine:
    def __init__(self):
        self.processor = TrOCRProcessor.from_pretrained('microsoft/trocr-base-handwritten')
        self.model = VisionEncoderDecoderModel.from_pretrained('microsoft/trocr-base-handwritten')

    def extract_handwriting(self, image: Image.Image) -> str:
        try:
            # 1. Convert PIL Image to an OpenCV format (numpy array)
            open_cv_image = np.array(image.convert('RGB'))
            # Convert RGB to BGR (which is what OpenCV uses natively)
            open_cv_image = open_cv_image[:, :, ::-1].copy()

            # 2. Image Processing to find lines
            gray = cv2.cvtColor(open_cv_image, cv2.COLOR_BGR2GRAY)
            # Create an inverted binary image (text becomes white, background becomes black)
            _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
            
            # Dilate horizontally: This stretches the white pixels left and right. 
            # It causes letters in the same line to bleed together into one solid block.
            kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (50, 5))
            dilated = cv2.dilate(thresh, kernel, iterations=1)

            # 3. Find the contours (outlines) of those solid blocks
            contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            # 4. Filter and sort the lines from Top to Bottom
            bounding_boxes = [cv2.boundingRect(c) for c in contours]
            # Ignore tiny specs of dust (boxes that are too small)
            bounding_boxes = [b for b in bounding_boxes if b[2] > 20 and b[3] > 15]
            # Sort by the Y coordinate so we read top-to-bottom
            bounding_boxes.sort(key=lambda b: b[1]) 

            extracted_lines = []

            # 5. Crop each line and pass it to the TrOCR AI
            for (x, y, w, h) in bounding_boxes:
                # Add a 10-pixel padding around the cropped line so the AI doesn't suffocate
                pad = 15
                y1 = max(0, y - pad)
                y2 = min(open_cv_image.shape[0], y + h + pad)
                x1 = max(0, x - pad)
                x2 = min(open_cv_image.shape[1], x + w + pad)

                # Slice the image array
                line_crop_cv = open_cv_image[y1:y2, x1:x2]
                
                # Convert back to PIL Image for the Hugging Face AI
                line_crop_pil = Image.fromarray(line_crop_cv[:, :, ::-1])
                
                # Generate text for this specific line
                pixel_values = self.processor(images=line_crop_pil, return_tensors="pt").pixel_values
                generated_ids = self.model.generate(pixel_values)
                text = self.processor.batch_decode(generated_ids, skip_special_tokens=True)[0]
                
                extracted_lines.append(text)

            # 6. Join all the lines together with a line break
            return "\n".join(extracted_lines)
            
        except Exception as e:
            raise RuntimeError(f"Handwriting Engine failed: {str(e)}")