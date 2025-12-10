import os

BASE_DIR = "ARKAIOS_Instrumentos"

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

missing = []
for category, instruments in DATA.items():
    for inst in instruments:
        safe_name = inst.replace(" ", "_").replace("/", "-")
        img_path = os.path.join(BASE_DIR, category, f"{safe_name}.jpg")
        if not os.path.exists(img_path):
            missing.append(f"{category}|{inst}|MISSING")
        elif os.path.getsize(img_path) < 1000: # Less than 1KB is suspicious
            missing.append(f"{category}|{inst}|SMALL_FILE")

print("MISSING_FILES_START")
for m in missing:
    print(m)
print("MISSING_FILES_END")
