# from PIL import Image, ImageOps
# from pix2tex.cli import LatexOCR

# class FormulaEngine:
#     def __init__(self):
#         self.model = LatexOCR()

#     def extract_latex(self, image: Image.Image) -> str:
#         """
#         Cleans the image (strips color/boldness) and returns a LaTeX string.
#         """
#         try:
#             # 1. Convert to grayscale to strip out the purple color
#             gray_image = image.convert('L')
            
#             # 2. Binarization (Thresholding): Make it pure black and white. 
#             # If a pixel is lighter than 150, make it pure white (255), else pure black (0).
#             # This removes fuzzy edges and makes thick fonts look sharper to the AI.
#             bw_image = gray_image.point(lambda p: 255 if p > 150 else 0)
            
#             # 3. Convert back to RGB because the AI model strictly expects 3 color channels
#             clean_rgb_image = bw_image.convert('RGB')
            
#             # 4. Feed the cleaned image to the AI
#             latex_string = self.model(clean_rgb_image)
            
#             return latex_string
            
#         except Exception as e:
#             raise RuntimeError(f"Formula Engine failed to extract LaTeX: {str(e)}")

# from PIL import Image, ImageOps
# from pix2tex.cli import LatexOCR

# class FormulaEngine:
#     def __init__(self):
#         self.model = LatexOCR()

#     def extract_latex(self, image: Image.Image) -> str:
#         """
#         Pads the image with white space and extracts the LaTeX string.
#         """
#         try:
#             # 1. Convert to RGB (required by the AI model)
#             if image.mode != 'RGB':
#                 image = image.convert('RGB')
                
#             # 2. Add a 50-pixel white border around the entire image.
#             # This prevents the AI from getting confused by text touching the edges.
#             padded_image = ImageOps.expand(image, border=50, fill='white')
            
#             # 3. Feed the padded image to the AI
#             latex_string = self.model(padded_image)
            
#             return latex_string
            
#         except Exception as e:
#             raise RuntimeError(f"Formula Engine failed to extract LaTeX: {str(e)}")

# from PIL import Image, ImageOps
# from pix2tex.cli import LatexOCR
# import cv2
# import numpy as np

# class FormulaEngine:
#     def __init__(self):
#         self.model = LatexOCR()

#     def extract_latex(self, image: Image.Image) -> str:
#         try:
#             # 1. Convert PIL Image to OpenCV Grayscale array to strip all color (e.g., purple)
#             open_cv_image = np.array(image.convert('L'))
            
#             # 2. Binarization: Force the image to be purely black and pure white.
#             # Otsu's method automatically calculates the best threshold for shadows/colors.
#             _, binary_image = cv2.threshold(open_cv_image, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            
#             # 3. FONT THINNING (Morphological Erosion)
#             # We want to make thick/bold black text thinner. 
#             # In OpenCV, 'erode' shrinks white areas. So we invert the image first (text becomes white),
#             # erode it to make the text thinner, and then invert it back to black text.
#             inverted = cv2.bitwise_not(binary_image)
#             kernel = np.ones((2, 2), np.uint8) # A small 2x2 brush to shave the edges
#             thinned_inverted = cv2.erode(inverted, kernel, iterations=1)
#             final_cv_image = cv2.bitwise_not(thinned_inverted)
            
#             # 4. Convert back to PIL Image and ensure it is RGB (required by AI)
#             clean_pil_image = Image.fromarray(final_cv_image).convert('RGB')
            
#             # 5. Add our trusty 50-pixel white border so the AI doesn't suffocate
#             padded_image = ImageOps.expand(clean_pil_image, border=50, fill='white')
            
#             # 6. Feed the highly-cleaned, thinned image to the AI
#             latex_string = self.model(padded_image)
            
#             return latex_string
            
#         except Exception as e:
#             raise RuntimeError(f"Formula Engine failed to extract LaTeX: {str(e)}")

from PIL import Image, ImageOps
from pix2tex.cli import LatexOCR

class FormulaEngine:
    def __init__(self):
        self.model = LatexOCR()

    def extract_latex(self, image: Image.Image) -> str:
        """
        Pads the image with white space and extracts the LaTeX string.
        (Removed OpenCV thinning to prevent destroying standard fonts).
        """
        try:
            # 1. Convert to RGB (required by the AI model)
            if image.mode != 'RGB':
                image = image.convert('RGB')
                
            # 2. Add a 50-pixel white border around the entire image
            padded_image = ImageOps.expand(image, border=50, fill='white')
            
            # 3. Feed the padded image directly to the AI
            latex_string = self.model(padded_image)
            
            return latex_string
            
        except Exception as e:
            raise RuntimeError(f"Formula Engine failed to extract LaTeX: {str(e)}")