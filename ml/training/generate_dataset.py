import csv
import os
import random

# Ensure output directory exists
os.makedirs(os.path.join(os.path.dirname(__file__), "..", "data"), exist_ok=True)
output_path = os.path.join(os.path.dirname(__file__), "..", "data", "dataset.csv")

# 10 target departments
DEPARTMENTS = [
    "Cardiology", "Neurology", "Dermatology", "Orthopedics", "ENT",
    "Pediatrics", "Gynecology", "Psychiatry", "Dentistry", "General Medicine"
]

# Templates for combining symptoms
TEMPLATES = [
    "{prefix} {symptom} {suffix}",
    "I have {symptom} which is {modifier}",
    "{symptom} {suffix}",
    "Experiencing {symptom} {suffix}",
    "I feel {symptom} {suffix}",
    "Dealing with {modifier} {symptom} {suffix}",
    "My {symptom} has been {modifier} {suffix}",
    "{prefix} {symptom}",
]

PREFIXES = [
    "I've been having", "I am experiencing", "Lately I have", 
    "I have had", "Suddenly developed", "Suffering from", 
    "Dealing with", "Complaining of", "Troubled by"
]

SUFFIXES = [
    "for the past few days", "since this morning", "for over a week",
    "especially after meals", "when I wake up", "which is getting worse",
    "off and on", "with mild sweating", "causing discomfort",
    "especially during exercise", "and it makes me anxious", "at night"
]

MODIFIERS = [
    "severe", "mild", "persistent", "constant", "throbbing", 
    "dull", "sharp", "nagging", "intermittent", "unbearable"
]

# Specialty terms for each department
SYMPTOMS_BY_DEPT = {
    "Cardiology": [
        "chest pain", "shortness of breath", "irregular heartbeats", "racing heart",
        "palpitations", "pressure in my chest", "high blood pressure", "swelling in my feet",
        "left arm pain and chest tightness", "dizziness and rapid pulse", "fluttering chest sensation",
        "angina", "tightness in chest", "breathlessness during walking", "heart pounding",
        "lightheadedness and sweating", "swollen ankles", "cardiac fatigue"
    ],
    "Neurology": [
        "severe headaches", "migraines", "dizziness and loss of balance", "numbness in my fingers",
        "tingling sensation in legs", "double vision", "memory loss", "difficulty speaking clearly",
        "seizures", "tremor in my hands", "frequent fainting spells", "loss of coordination",
        "facial muscle weakness", "muscle spasms", "chronic nerve pain", "unexplained vertigo",
        "stiff neck and numbness", "shaking fingers"
    ],
    "Dermatology": [
        "red itchy skin rash", "acne breakouts", "dry scaly patches", "mole changes shape",
        "hives on my back", "eczema flare up", "psoriasis on my elbows", "sunburn blisters",
        "severe dandruff", "hair thinning", "fungal infection on toes", "skin peeling",
        "yellowing nails", "itchy bumps on arms", "cystic acne", "wart on my finger",
        "dark skin spots", "blistering rash"
    ],
    "Orthopedics": [
        "joint pain in my knee", "chronic backache", "stiff shoulder joint", "fractured wrist",
        "swollen ankle joint", "lower back pain", "hip discomfort when walking", "sore neck muscles",
        "sciatica pain down leg", "difficulty bending my knee", "cracking sound in joints",
        "ligament pull", "muscle tear", "sore elbow", "heel pain while standing", "arthritis discomfort",
        "spine stiffness", "bone ache"
    ],
    "ENT": [
        "sore throat", "blocked ears", "ringing in my ears", "sinus pressure",
        "runny nose", "difficulty swallowing", "hearing loss", "hoarse voice",
        "nosebleeds", "earache", "swollen glands in neck", "nasal congestion",
        "post-nasal drip", "loss of smell", "throat pain", "plugged ear canal",
        "sinusitis headache", "constant sneezing"
    ],
    "Pediatrics": [
        "baby has diaper rash", "child has high fever", "infant vomiting milk",
        "my toddler has colic", "child has chickenpox spots", "baby is crying constantly",
        "toddler refusing to eat", "child has ear infection", "vaccination reaction in baby",
        "child has asthma wheezing", "baby has congestion", "toddler has runny nose and cough",
        "child has stomach ache", "pediatric eczema", "bedwetting issues", "newborn jaundice",
        "growth milestone concerns", "kids sore throat"
    ],
    "Gynecology": [
        "irregular periods", "severe menstrual cramps", "excessive bleeding during cycle",
        "pelvic pain", "vaginal discharge and itching", "missed period", "hot flashes",
        "breast pain", "pregnancy morning sickness", "bloating and PMS", "postmenopausal bleeding",
        "ovarian cyst pain", "pain during intercourse", "vaginal dryness", "hormonal imbalance",
        "uterine cramping", "menstrual mood swings"
    ],
    "Psychiatry": [
        "feeling depressed and sad", "severe anxiety attacks", "panic attacks", "insomnia and lack of sleep",
        "extreme mood swings", "hallucinations", "suicidal thoughts", "paranoia",
        "racing thoughts and worry", "difficulty concentrating", "loss of interest in activities",
        "social anxiety", "chronic stress", "eating disorder behaviors", "obsession with cleanliness",
        "PTSD flashbacks", "uncontrollable fear", "manic episodes"
    ],
    "Dentistry": [
        "toothache", "bleeding gums", "sensitive teeth to cold", "swollen gums",
        "cavity in molar", "loose tooth", "bad breath", "jaw pain when chewing",
        "broken tooth", "mouth sores", "wisdom tooth pain", "gum recession",
        "gingivitis symptoms", "dental abscess", "dry mouth", "tooth discoloration",
        "plaque buildup", "sore under dentures"
    ],
    "General Medicine": [
        "mild fever", "cough and cold", "fatigue and body weakness", "stomach ache",
        "nausea and vomiting", "mild diarrhea", "food poisoning symptoms", "acid reflux",
        "headache and body pain", "muscle weakness", "dehydration", "loss of appetite",
        "viral fever", "chills and sweating", "bloating and gas", "general checkup request",
        "blood pressure screening", "unexplained weight loss"
    ]
}

def generate_symptom_descriptions():
    dataset = set() # Avoid duplicates
    
    # Target 110 unique records per department to easily cross 1000
    target_per_dept = 110
    
    for dept, symptoms in SYMPTOMS_BY_DEPT.items():
        dept_examples = set()
        
        # 1. Direct symptoms
        for s in symptoms:
            dept_examples.add((s, dept))
            
        # 2. Programmatic combinations using templates
        while len(dept_examples) < target_per_dept:
            template = random.choice(TEMPLATES)
            prefix = random.choice(PREFIXES)
            suffix = random.choice(SUFFIXES)
            modifier = random.choice(MODIFIERS)
            symptom = random.choice(symptoms)
            
            symptom_text = template.format(
                prefix=prefix,
                symptom=symptom,
                suffix=suffix,
                modifier=modifier
            )
            # Normalize casing and spacing
            symptom_text = " ".join(symptom_text.split()).strip()
            # Capitalize first letter
            symptom_text = symptom_text[0].upper() + symptom_text[1:]
            
            dept_examples.add((symptom_text, dept))
            
        dataset.update(dept_examples)

    # Convert to list and shuffle
    data_list = list(dataset)
    random.shuffle(data_list)
    return data_list

def main():
    print("Generating symptom dataset...")
    data = generate_symptom_descriptions()
    
    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["symptoms", "department"])
        for row in data:
            writer.writerow(row)
            
    print(f"Dataset generated successfully at {output_path} with {len(data)} examples.")

if __name__ == "__main__":
    main()
