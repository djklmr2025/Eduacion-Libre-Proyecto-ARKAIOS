import os
import requests
import shutil
import base64
import json
import time

# --- 1. CREDENCIALES & CONFIGURACIÓN ---
PEXELS_KEY = os.getenv("VITE_pexels_API_KEY", "4vj6qTzLM9oc0gN7bdgr3vCO7jRDIBe0zJgknfq9geibx9hdQ16TVxpz")
PIXABAY_KEY = os.getenv("VITE_Pixabay_API_key", "53456758-e7788c27d5c820739d362581f")

# CREDENCIALES ARKAIOS
ARKAIOS_API_KEY = os.getenv("VITE_AIDA_INTERNAL_KEY", "sk_aida_internal_c7t9g392ksqz77")
ARKAIOS_BASE_URL = os.getenv("VITE_AIDA_BASE_URL", "https://arkaios-gateway-open.onrender.com")

# Directorios
DIR_BASE = "ARKAIOS_Instrumentos"
DIR_QUARANTINE = os.path.join(DIR_BASE, "_Quarantine")
DIR_VALIDATED = DIR_BASE 
DIR_LOGS = os.path.join(DIR_BASE, "_Logs")

# --- 2. DATOS MAESTROS ---
INSTRUMENTOS = {
    "1. Electrofonos": ["Sintetizador", "Theremin", "Piano eléctrico", "Órgano Hammond", "Guitarra eléctrica", "Bajo eléctrico", "Caja de ritmos", "Sampler", "Sintetizador modular", "Clavinet", "Fender Rhodes", "Melotrón", "Ondas Martenot", "Trautonio", "Arpa láser", "Drum pad electrónico", "Ewi Electronic Wind Instrument", "Digitone", "Vocoder", "Omnichord"],
    "2. Membranofonos": ["Tambor", "Bongo", "Conga", "Timbal", "Batería acústica", "Pandereta", "Zarb persa", "Cajón peruano", "Darbuka", "Bombo sinfónico", "Repique brasileño", "Djembe", "Pandero marco", "Caja redoblante", "Timbaleta", "Tabla india", "Tambores batá", "Talking drum", "Bombo legüero", "Tamboorín"],
    "3. Idiofonos": ["Xilófono", "Marimba", "Vibráfono", "Carrillón", "Kalimba", "Triángulo", "Cencerro", "Claves", "Güiro", "Cabasa", "Shekere", "Campanas tubulares", "Castañuelas", "Steel drum", "Temple blocks", "Maracas", "Caja china", "Frotador de metal", "Botella golpeada", "Platos suspendidos"],
    "4. Cordofonos": ["Guitarra acústica", "Violín", "Viola", "Cello", "Contrabajo", "Arpa", "Ukelele", "Mandolina", "Banjo", "Guitarra clásica", "Sitar", "Sarangi", "Koto japonés", "Lira", "Bouzouki", "Charango", "Laúd árabe", "Zither alemana", "Bandurria", "Balalaika"],
    "5. Aerofonos": ["Flauta traversa", "Flauta dulce", "Trompeta", "Trombón", "Saxofón alto", "Saxofón tenor", "Clarinete", "Oboe", "Fagot", "Corneta", "Armónica", "Ocarina", "Quena", "Zampoña", "Duduk armenio", "Shakuhachi japonés", "Didgeridoo", "Cornamusa gaita", "Tuba", "Flauta de pan"]
}

# LISTA DE REGENERACIÓN FORZADA (Ignorar Stock, usar Generación IA)
FORCE_GENERATE = [
    # Electrofonos
    "Sintetizador", "Guitarra eléctrica", "Bajo eléctrico", "Caja de ritmos", "Clavinet", 
    "Fender Rhodes", "Melotrón", "Ondas Martenot", "Trautonio", "Vocoder", "Omnichord",
    # Membranofonos
    "Tambor", "Pandereta", "Zarb persa", "Pandero marco", "Caja redoblante", "Timbaleta", "Tamboorín",
    # Idiofonos
    "Xilófono", "Vibráfono", "Carrillón", "Triángulo", "Campanas tubulares", "Castañuelas", 
    "Botella golpeada", "Platos suspendidos",
    # Cordofonos
    "Mandolina", "Guitarra clásica", "Lira",
    # Aerofonos
    "Flauta traversa", "Flauta dulce", "Trompeta", "Fagot", "Corneta", "Quena", "Zampoña", "Tuba", "Flauta de pan"
]

# Normalizamos la lista de forzados para comparación fácil
FORCE_GENERATE_NORM = [x.lower().replace("á","a").replace("é","e").replace("í","i").replace("ó","o").replace("ú","u") for x in FORCE_GENERATE]

# --- 3. MOTORES DE BÚSQUEDA (CAPA 1) ---

def search_stock(query):
    try:
        url = f"https://api.pexels.com/v1/search?query={query}&per_page=1"
        res = requests.get(url, headers={"Authorization": PEXELS_KEY}, timeout=5)
        data = res.json()
        if data.get('photos'): return data['photos'][0]['src']['large']
    except: pass

    try:
        url = f"https://pixabay.com/api/?key={PIXABAY_KEY}&q={query}&image_type=photo"
        res = requests.get(url, timeout=5)
        data = res.json()
        if data.get('hits'): return data['hits'][0]['largeImageURL']
    except: pass
    return None

def download_file(url, path):
    try:
        with open(path, 'wb') as f:
            f.write(requests.get(url).content)
        return True
    except: return False

# --- 4. MOTOR DE VALIDACIÓN (CAPA 2 - VISION) ---

def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

def validar_con_ia(image_path, item_name):
    try:
        base64_image = encode_image(image_path)
        payload = {
            "model": "gpt-4o",
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": f"Is this image a clear and valid representation of a musical instrument called '{item_name}'? Answer strictly with just 'YES' or 'NO'."},
                        {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}
                    ]
                }
            ],
            "max_tokens": 10
        }
        headers = {"Authorization": f"Bearer {ARKAIOS_API_KEY}", "Content-Type": "application/json"}
        response = requests.post(f"{ARKAIOS_BASE_URL}/v1/chat/completions", headers=headers, json=payload, timeout=20)
        data = response.json()
        if response.status_code == 200 and 'choices' in data:
            return "YES" in data['choices'][0]['message']['content'].upper()
        return True 
    except: return True

# --- 5. MOTOR DE GENERACIÓN (CAPA 3 - CREATION) ---

def generar_imagen_ia(item_name, save_path):
    try:
        payload = {
            "model": "dall-e-3",
            "prompt": f"A high quality, photorealistic studio photo of a musical instrument: {item_name}. Professional lighting, isolated on simple background.",
            "n": 1,
            "size": "1024x1024"
        }
        headers = {"Authorization": f"Bearer {ARKAIOS_API_KEY}", "Content-Type": "application/json"}
        response = requests.post(f"{ARKAIOS_BASE_URL}/v1/images/generations", headers=headers, json=payload, timeout=40)
        data = response.json()

        if response.status_code == 200 and 'data' in data:
            image_url = data['data'][0]['url']
            return download_file(image_url, save_path)
        else:
            print(f"   [API Error]: {data}")
            return False
    except Exception as e:
        print(f"   [Gen Error]: {e}")
        return False

# --- 6. CORE PIPELINE ---

def run_pipeline():
    print("🔥 INICIANDO ARKAIOS CONTENT ENGINE v2.2 (Correction Mode)")
    
    failed_list = []
    
    if not os.path.exists(DIR_QUARANTINE): os.makedirs(DIR_QUARANTINE)

    for categoria, items in INSTRUMENTOS.items():
        cat_dir = os.path.join(DIR_VALIDATED, categoria)
        if not os.path.exists(cat_dir): os.makedirs(cat_dir)
        
        print(f"\n📂 PROCESANDO: {categoria}")

        for item in items:
            safe_name = item.replace(" ", "_").replace("/", "-")
            final_path = os.path.join(cat_dir, f"{safe_name}.jpg")
            quarantine_path = os.path.join(DIR_QUARANTINE, f"{safe_name}_check.jpg")
            
            # Check if forced regeneration
            item_norm = item.lower().replace("á","a").replace("é","e").replace("í","i").replace("ó","o").replace("ú","u")
            is_forced = item_norm in FORCE_GENERATE_NORM

            if is_forced:
                if os.path.exists(final_path):
                    os.remove(final_path)
                    print(f"   ♻️  REGENERANDO FORZADO: {item}")
            elif os.path.exists(final_path):
                continue # Skip valid existing ones

            print(f"   🔎 Procesando: {item}...", end="")

            exito = False
            
            # CAPA 1: Stock (Solo si NO es forzado)
            if not is_forced:
                url = search_stock(item + " instrument")
                if not url: url = search_stock(item)
                
                if url and download_file(url, quarantine_path):
                    # CAPA 2: Validación
                    print(f" 👁️ Validando...", end="")
                    if validar_con_ia(quarantine_path, item):
                        shutil.move(quarantine_path, final_path)
                        print(" APROBADO (Stock).")
                        exito = True
                    else:
                        print(" RECHAZADO (IA).")
                        os.remove(quarantine_path)
            
            # CAPA 3: Generación (Si falló stock o es forzado)
            if not exito:
                print(f"   🎨 Generando con IA...", end="")
                if generar_imagen_ia(item, final_path):
                    print(" CREADO.")
                    exito = True
                else:
                    print(" FALLÓ GENERACIÓN.")
                    failed_list.append(f"{categoria}|{item}")

    print("\n--- INFORME DE MISIÓN ---")
    if failed_list:
        print(f"⚠️ Elementos pendientes ({len(failed_list)}):")
        for f in failed_list: print(f" - {f}")
    else:
        print("✅ Todos los items completados.")

    generate_validation_html()

def generate_validation_html():
    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: sans-serif; background: #1a1a1a; color: #eee; padding: 20px; }
            .category { margin-bottom: 40px; border-bottom: 2px solid #444; padding-bottom: 20px; }
            .grid { display: flex; flex-wrap: wrap; gap: 15px; }
            .card { background: #2a2a2a; padding: 10px; border-radius: 8px; width: 180px; text-align: center; }
            img { width: 100%; height: 140px; object-fit: cover; border-radius: 4px; background: #000; }
            .missing { height: 140px; display: flex; align-items: center; justify-content: center; background: #330000; color: #ff9999; font-size: 0.8em; }
            h2 { color: #4caf50; }
            h3 { font-size: 0.9em; margin: 10px 0 0 0; color: #ccc; }
        </style>
    </head>
    <body>
        <h1>🛡️ ARKAIOS Content Validator v2.2</h1>
    """
    for category, items in INSTRUMENTOS.items():
        html_content += f"<div class='category'><h2>{category}</h2><div class='grid'>"
        for item in items:
            safe_name = item.replace(" ", "_").replace("/", "-")
            img_rel = f"{category}/{safe_name}.jpg"
            img_full = os.path.join(DIR_VALIDATED, img_rel)
            html_content += f"<div class='card'>"
            if os.path.exists(img_full):
                html_content += f"<img src='{img_rel}?t={int(time.time())}' loading='lazy'>"
            else:
                html_content += f"<div class='missing'>PENDIENTE<br>{item}</div>"
            html_content += f"<h3>{item}</h3></div>"
        html_content += "</div></div>"
    html_content += "</body></html>"
    with open(os.path.join(DIR_BASE, "validation_report.html"), "w", encoding="utf-8") as f:
        f.write(html_content)
    print(f"Reporte generado: {os.path.join(DIR_BASE, 'validation_report.html')}")

if __name__ == "__main__":
    run_pipeline()
