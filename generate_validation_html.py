import os

BASE_DIR = "ARKAIOS_Instrumentos"
HTML_FILE = "validate_images.html"

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

html_content = """
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: sans-serif; background: #222; color: #fff; }
        .category { margin-bottom: 40px; }
        .grid { display: flex; flex-wrap: wrap; gap: 20px; }
        .card { background: #333; padding: 10px; border-radius: 8px; width: 200px; text-align: center; }
        img { width: 100%; height: 150px; object-fit: cover; border-radius: 4px; }
        .missing { height: 150px; display: flex; align-items: center; justify-content: center; background: #440000; color: #ffaaaa; }
        h2 { border-bottom: 1px solid #555; padding-bottom: 10px; }
    </style>
</head>
<body>
    <h1>Validación de Instrumentos</h1>
"""

for category, instruments in DATA.items():
    html_content += f"<div class='category'><h2>{category}</h2><div class='grid'>"
    for inst in instruments:
        safe_name = inst.replace(" ", "_").replace("/", "-")
        img_rel_path = f"{category}/{safe_name}.jpg"
        img_full_path = os.path.join(BASE_DIR, img_rel_path)
        
        html_content += f"<div class='card'><h3>{inst}</h3>"
        if os.path.exists(img_full_path):
            # Use relative path for browser
            html_content += f"<img src='{BASE_DIR}/{img_rel_path}' alt='{inst}'>"
        else:
            html_content += f"<div class='missing'>NO ENCONTRADO</div>"
        html_content += "</div>"
    html_content += "</div></div>"

html_content += "</body></html>"

with open(HTML_FILE, "w", encoding="utf-8") as f:
    f.write(html_content)

print(f"Archivo de validación creado: {HTML_FILE}")
