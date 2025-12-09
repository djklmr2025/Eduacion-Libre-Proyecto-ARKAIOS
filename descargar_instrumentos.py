import os
import requests
import json

# --- CONFIGURACIÓN ARKAIOS ---
# Credenciales suministradas
PEXELS_API_KEY = "4vj6qTzLM9oc0gN7bdgr3vCO7jRDIBe0zJgknfq9geibx9hdQ16TVxpz"
PIXABAY_API_KEY = "53456758-e7788c27d5c820739d362581f"

# Directorio base
BASE_DIR = "ARKAIOS_Instrumentos"

# --- DATOS (Listas Limpias) ---
DATA = {
    "1. Electrofonos": [
        "Sintetizador", "Theremin", "Piano eléctrico", "Órgano Hammond", "Guitarra eléctrica",
        "Bajo eléctrico", "Caja de ritmos", "Sampler", "Sintetizador modular", "Clavinet",
        "Fender Rhodes", "Melotrón", "Ondas Martenot", "Trautonio", "Arpa láser",
        "Drum pad electrónico", "Ewi Electronic Wind Instrument", "Digitone", "Vocoder", "Omnichord"
    ],
    "2. Membranofonos": [
        "Tambor", "Bongo", "Conga", "Timbal", "Batería acústica", "Pandereta", "Zarb persa",
        "Cajón peruano", "Darbuka", "Bombo sinfónico", "Repique brasileño", "Djembe",
        "Pandero marco", "Caja redoblante", "Timbaleta", "Tabla india", "Tambores batá",
        "Talking drum", "Bombo legüero", "Tamboorín"
    ],
    "3. Idiofonos": [
        "Xilófono", "Marimba", "Vibráfono", "Carrillón", "Kalimba", "Triángulo", "Cencerro",
        "Claves", "Güiro", "Cabasa", "Shekere", "Campanas tubulares", "Castañuelas",
        "Steel drum", "Temple blocks", "Maracas", "Caja china", "Frotador de metal",
        "Botella golpeada", "Platos suspendidos"
    ],
    "4. Cordofonos": [
        "Guitarra acústica", "Violín", "Viola", "Cello", "Contrabajo", "Arpa", "Ukelele",
        "Mandolina", "Banjo", "Guitarra clásica", "Sitar", "Sarangi", "Koto japonés",
        "Lira", "Bouzouki", "Charango", "Laúd árabe", "Zither alemana", "Bandurria", "Balalaika"
    ],
    "5. Aerofonos": [
        "Flauta traversa", "Flauta dulce", "Trompeta", "Trombón", "Saxofón alto",
        "Saxofón tenor", "Clarinete", "Oboe", "Fagot", "Corneta", "Armónica", "Ocarina",
        "Quena", "Zampoña", "Duduk armenio", "Shakuhachi japonés", "Didgeridoo",
        "Cornamusa gaita", "Tuba", "Flauta de pan"
    ]
}

# --- FUNCIONES DE BÚSQUEDA ---

def search_pexels(query):
    url = f"https://api.pexels.com/v1/search?query={query}&per_page=1"
    headers = {"Authorization": PEXELS_API_KEY}
    try:
        response = requests.get(url, headers=headers, timeout=10)
        data = response.json()
        if data.get('photos'):
            return data['photos'][0]['src']['large'] # URL de la imagen
    except Exception as e:
        print(f"   [!] Error Pexels con {query}: {e}")
    return None

def search_pixabay(query):
    # Pixabay requiere query en inglés a veces, pero probaremos directo
    url = f"https://pixabay.com/api/?key={PIXABAY_API_KEY}&q={query}&image_type=photo&per_page=3"
    try:
        response = requests.get(url, timeout=10)
        data = response.json()
        if data.get('hits'):
            return data['hits'][0]['largeImageURL']
    except Exception as e:
        print(f"   [!] Error Pixabay con {query}: {e}")
    return None

def download_image(url, filepath):
    try:
        img_data = requests.get(url).content
        with open(filepath, 'wb') as handler:
            handler.write(img_data)
        return True
    except Exception as e:
        print(f"   [X] Falló descarga: {e}")
        return False

# --- EJECUCIÓN PRINCIPAL ---
if __name__ == "__main__":
    if not os.path.exists(BASE_DIR):
        os.makedirs(BASE_DIR)
    
    print(f"INICIANDO PROTOCOLO ARKAIOS-HUNTER...")
    
    for category, instruments in DATA.items():
        # 1. Crear carpeta de categoría
        cat_path = os.path.join(BASE_DIR, category)
        if not os.path.exists(cat_path):
            os.makedirs(cat_path)
            
        # 2. Crear archivo .txt de la lista
        txt_path = os.path.join(BASE_DIR, f"{category}.txt")
        with open(txt_path, "w", encoding="utf-8") as f:
            f.write("\n".join(instruments))
        print(f"\n Procesando: {category} (Lista guardada)")

        # 3. Buscar y descargar imágenes
        for inst in instruments:
            safe_name = inst.replace(" ", "_").replace("/", "-")
            img_path = os.path.join(cat_path, f"{safe_name}.jpg")
            
            if os.path.exists(img_path):
                print(f"   [SKIP] {inst} ya existe.")
                continue

            print(f"   Buscando: {inst}...", end="")
            
            # Intento 1: Pexels
            img_url = search_pexels(inst + " instrument")
            
            # Intento 2: Pixabay (si falla Pexels)
            if not img_url:
                img_url = search_pixabay(inst)
            
            if img_url:
                if download_image(img_url, img_path):
                    print(" DESCARGADO")
                else:
                    print(" ERROR AL GUARDAR")
            else:
                print(" NO ENCONTRADO (Requiere búsqueda manual)")

    print("\n EJECUCIÓN COMPLETADA. REVISA LA CARPETA 'ARKAIOS_Instrumentos'.")
