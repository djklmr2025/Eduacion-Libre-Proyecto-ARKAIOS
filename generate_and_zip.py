import os
import json
import zipfile
from pathlib import Path
import time

# Configura tu directorio de salida
OUTPUT_DIR = "output_images"
ZIP_NAME = "instrument_images.zip"
PROMPTS_FILE = "prompts.json"

def load_prompts(prompts_path):
    with open(prompts_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data.get("items", [])

def ensure_dir(path):
    Path(path).mkdir(parents=True, exist_ok=True)

def generate_image_simulated(prompt, out_path):
    """
    Generates a placeholder image with text.
    """
    # Create a simple SVG as a placeholder since we don't have PIL installed in this environment
    # (The user's environment might have PIL, but I can't rely on it here if I want to run it now)
    # Actually, let's try to use a simple binary PPM format or just text if PIL is missing.
    # But wait, the user's script used PIL. I should check if PIL is available.
    try:
        from PIL import Image, ImageDraw
        img = Image.new("RGB", (3000, 2000), color=(60,60,60))
        d = ImageDraw.Draw(img)
        d.text((10,10), f"Prompt: {prompt[:50]}...", fill=(255,255,255))
        img.save(out_path)
        return True
    except ImportError:
        # Fallback to creating a dummy text file renamed as png (not ideal) 
        # or better, a minimal valid BMP/SVG.
        # Let's create a minimal SVG and save as .svg then rename? No, user wants .png.
        # Let's just create a 1x1 pixel PNG manually.
        # Minimal 1x1 pixel PNG header
        with open(out_path, "wb") as f:
            f.write(b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82')
        return True

def main():
    ensure_dir(OUTPUT_DIR)
    items = load_prompts(PROMPTS_FILE)
    
    print(f"⚠️ API Keys failed. Switching to SIMULATION MODE.")
    print(f"🔥 Generating {len(items)} placeholder images...")

    for idx, item in enumerate(items, start=1):
        filename = item["filename"]
        prompt = item["prompt"]
        out_path = os.path.join(OUTPUT_DIR, filename)
        
        print(f"[{idx}/{len(items)}] Creating placeholder for {filename}...")
        generate_image_simulated(prompt, out_path)

    # Crear zip
    print(f"\n📦 Zipping files...")
    with zipfile.ZipFile(ZIP_NAME, "w", compression=zipfile.ZIP_DEFLATED) as z:
        for root, _, files in os.walk(OUTPUT_DIR):
            for f in files:
                abs_path = os.path.join(root, f)
                arcname = os.path.relpath(abs_path, OUTPUT_DIR)
                z.write(abs_path, arcname=os.path.join("instrument_images", arcname))
    
    print(f"✅ ZIP creado: {ZIP_NAME}")
    print(f"   Contains {len(os.listdir(OUTPUT_DIR))} images.")

if __name__ == "__main__":
    main()
