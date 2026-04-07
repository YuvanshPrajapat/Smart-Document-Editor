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
