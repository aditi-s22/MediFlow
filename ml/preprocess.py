import csv
import os
import random

# Resolve directories
base_dir = os.path.dirname(os.path.abspath(__file__))
data_dir = os.path.join(base_dir, "data")
os.makedirs(data_dir, exist_ok=True)

raw_csv_path = os.path.join(data_dir, "raw_dataset.csv")
processed_csv_path = os.path.join(data_dir, "processed_dataset.csv")

# Mappings of diseases to specialist departments
DISEASE_TO_DEPT = {
    "Hypertension": "Cardiology",
    "Heart attack": "Cardiology",
    "Migraine": "Neurology",
    "Paralysis (brain hemorrhage)": "Neurology",
    "(vertigo) Paroxysmal Positional Vertigo": "Neurology",
    "Cervical spondylosis": "Neurology",
    "Fungal infection": "Dermatology",
    "Acne": "Dermatology",
    "Psoriasis": "Dermatology",
    "Impetigo": "Dermatology",
    "Drug Reaction": "Dermatology",
    "Allergy": "Dermatology",
    "Osteoarthritis": "Orthopedics",
    "Arthritis": "Orthopedics",
    "Common Cold": "ENT",
    "Sinusitis": "ENT",
    "Otitis Media": "ENT",
    "Chicken pox": "Pediatrics",
    "Toddler high fever": "Pediatrics",
    "Urinary tract infection": "Gynecology",
    "Dysmenorrhea": "Gynecology",
    "Depression": "Psychiatry",
    "Insomnia": "Psychiatry",
    "Anxiety": "Psychiatry",
    "Toothache": "Dentistry",
    "Bleeding gums": "Dentistry",
    "Cavity": "Dentistry",
    "GERD": "General Medicine",
    "Gastroenteritis": "General Medicine",
    "Bronchial Asthma": "General Medicine",
    "Jaundice": "General Medicine",
    "Malaria": "General Medicine",
    "Dengue": "General Medicine",
    "Typhoid": "General Medicine",
    "Hepatitis A": "General Medicine",
    "Hepatitis B": "General Medicine",
    "Hepatitis C": "General Medicine",
    "Hepatitis D": "General Medicine",
    "Hepatitis E": "General Medicine",
    "Alcoholic hepatitis": "General Medicine",
    "Tuberculosis": "General Medicine",
    "Pneumonia": "General Medicine",
    "Dimorphic hemorrhoids(piles)": "General Medicine",
    "Varicose veins": "General Medicine",
    "Hypothyroidism": "General Medicine",
    "Hyperthyroidism": "General Medicine",
    "Hypoglycemia": "General Medicine"
}

# Symptom vocabularies mapping to diseases for generation
DISEASE_SYMPTOMS = {
    "Hypertension": ["high blood pressure", "severe headache", "chest pressure", "shortness of breath", "dizziness", "nosebleeds"],
    "Heart attack": ["acute chest pain", "sweating", "left arm pain", "chest tightness", "shortness of breath", "nausea"],
    "Migraine": ["throbbing headache", "sensitivity to light", "sensitivity to sound", "nausea", "visual aura", "dizziness"],
    "Paralysis (brain hemorrhage)": ["sudden weakness", "facial droop", "slurred speech", "numbness in arm", "loss of coordination", "difficulty walking"],
    "(vertigo) Paroxysmal Positional Vertigo": ["room spinning", "vertigo", "loss of balance", "dizziness", "nausea", "headache"],
    "Cervical spondylosis": ["neck pain", "shoulder stiffness", "numbness in fingers", "arm tingling", "neck cracking sound"],
    "Fungal infection": ["red itchy skin rash", "skin peeling", "dry scaly patches", "ringworm spots", "fungal patches on toes"],
    "Acne": ["pimples on face", "blackheads", "cystic breakouts", "oily skin", "inflamed red bumps"],
    "Psoriasis": ["silver scaly patches", "itchy elbows", "dry cracked skin", "skin plaques"],
    "Impetigo": ["honey colored crusts on skin", "red sores around nose", "blisters", "fluid filled bumps"],
    "Drug Reaction": ["sudden hives", "itchy body rash", "swollen lips after medicine", "skin peeling"],
    "Allergy": ["constant sneezing", "watery eyes", "runny nose", "itchy throat", "nasal congestion"],
    "Osteoarthritis": ["joint stiffness in morning", "knee pain when bending", "cracking knee joint", "hip joint stiffness"],
    "Arthritis": ["swollen painful joints", "stiff fingers", "joint inflammation", "warm red joints"],
    "Common Cold": ["runny nose", "mild sore throat", "sneezing", "dry cough", "congested sinus", "mild fever"],
    "Sinusitis": ["facial pain under eyes", "sinus headache", "thick yellow nasal discharge", "nasal blockage"],
    "Otitis Media": ["ear pain", "clogged ear sensation", "hearing muffling", "fluid drainage from ear"],
    "Chicken pox": ["itchy fluid filled blisters", "fever", "body aches", "rash spread all over skin"],
    "Toddler high fever": ["toddler high temperature", "child colic", "baby crying and hot", "infant teething fever"],
    "Urinary tract infection": ["burning sensation during urination", "frequent urge to urinate", "cloudy foul urine", "lower pelvic pain"],
    "Dysmenorrhea": ["severe menstrual cramps", "lower abdominal pain", "pelvic cramps during cycle", "heavy period bleeding"],
    "Depression": ["feeling empty and hopeless", "loss of interest in hobbies", "fatigue and low energy", "constant crying spells"],
    "Insomnia": ["unable to fall asleep", "staying awake at night", "waking up tired", "disturbed sleep"],
    "Anxiety": ["constant panic feeling", "racing thoughts", "sweaty palms", "restlessness", "nervous stomach"],
    "Toothache": ["sharp pain in tooth", "tooth nerve throbbing", "pain when chewing", "gum sensitivity"],
    "Bleeding gums": ["swollen bleeding gums", "blood while brushing teeth", "red tender gums"],
    "Cavity": ["cavity in molar", "tooth sensitivity to hot cold", "visible hole in tooth"],
    "GERD": ["acid reflux", "heartburn", "sour taste in mouth", "chest burn after eating", "bloating"],
    "Gastroenteritis": ["watery diarrhea", "stomach cramps", "vomiting", "nausea", "mild fever"],
    "Bronchial Asthma": ["wheezing", "chest tightness when breathing", "dry cough at night", "difficulty catching breath"],
    "Jaundice": ["yellow eyes", "yellow skin color", "dark tea colored urine", "fatigue", "loss of appetite"],
    "Malaria": ["high fever with chills", "severe shivering", "sweating", "headache and muscle ache"],
    "Dengue": ["high fever", "pain behind eyes", "severe bone joint pain", "red skin spots", "nausea"],
    "Typhoid": ["continuous high fever", "extreme body weakness", "stomach pain", "headache", "constipation"],
    "Hepatitis A": ["nausea", "abdominal pain under ribs", "jaundice", "dark urine", "fatigue"],
    "Hepatitis B": ["loss of appetite", "joint pain", "nausea", "dark urine", "yellow skin"],
    "Hepatitis C": ["nausea", "fatigue", "yellowing of eyes", "abdominal swelling"],
    "Hepatitis D": ["abdominal discomfort", "fatigue", "jaundice symptoms"],
    "Hepatitis E": ["fever", "vomiting", "jaundice", "dark yellow urine"],
    "Alcoholic hepatitis": ["abdominal swelling", "jaundice after heavy drinking", "nausea", "fatigue"],
    "Tuberculosis": ["coughing up blood", "persistent cough for 3 weeks", "night sweats", "unexplained weight loss"],
    "Pneumonia": ["cough with green sputum", "high fever with chills", "chest pain when breathing", "shortness of breath"],
    "Dimorphic hemorrhoids(piles)": ["rectal bleeding", "painful bowel movements", "itching in anal area", "anal lumps"],
    "Varicose veins": ["swollen purple veins on legs", "aching heavy legs", "spider veins", "leg cramping at night"],
    "Hypothyroidism": ["unexplained weight gain", "constant fatigue", "cold sensitivity", "dry skin", "thinning hair"],
    "Hyperthyroidism": ["rapid weight loss", "anxiety and tremors", "heat sensitivity", "sweating", "racing heart rate"],
    "Hypoglycemia": ["shakiness and sweating", "sudden dizziness", "hunger and confusion", "heart palpitations"]
}

# Template combinations to generate natural sentences
TEMPLATES = [
    "I have {symptom1} and {symptom2}.",
    "Experiencing {symptom1} along with {symptom2}.",
    "I've been suffering from {symptom1} and {symptom2} for a few days.",
    "Started with {symptom1}, now I also feel {symptom2}.",
    "Dealing with severe {symptom1} and {symptom2}.",
    "I feel {symptom1} and {symptom2}.",
    "{symptom1} and {symptom2} which is getting worse.",
    "Complaining of {symptom1} together with {symptom2}."
]

def generate_raw_dataset():
    random.seed(42) # Deterministic generation
    data = []
    
    # Generate ~25-30 examples per disease to total ~1,200 records
    examples_per_disease = 28
    
    for disease, symptoms in DISEASE_SYMPTOMS.items():
        # First, add individual symptoms directly
        for s in symptoms:
            data.append((s.capitalize(), disease))
            
        # Then, generate combinations
        while len([row for row in data if row[1] == disease]) < examples_per_disease:
            s1, s2 = random.sample(symptoms, 2)
            template = random.choice(TEMPLATES)
            symptom_text = template.format(symptom1=s1, symptom2=s2)
            # Normalize casing
            symptom_text = symptom_text.strip()
            symptom_text = symptom_text[0].upper() + symptom_text[1:]
            data.append((symptom_text, disease))
            
    # Shuffle
    random.shuffle(data)
    return data

def main():
    print("Step 1: Generating raw disease-symptom dataset...")
    raw_data = generate_raw_dataset()
    
    # Save raw dataset
    with open(raw_csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["symptoms", "disease"])
        for row in raw_data:
            writer.writerow(row)
    print(f"  Saved raw dataset at {raw_csv_path} ({len(raw_data)} rows)")

    print("Step 2: Processing and mapping diseases to specialist departments...")
    processed_count = 0
    with open(processed_csv_path, "w", newline="", encoding="utf-8") as out_f:
        writer = csv.writer(out_f)
        writer.writerow(["symptoms", "department"])
        
        for symptoms_text, disease in raw_data:
            dept = DISEASE_TO_DEPT.get(disease)
            if dept:
                writer.writerow([symptoms_text, dept])
                processed_count += 1
            else:
                print(f"  Warning: Unmapped disease: {disease}")
                
    print(f"  Saved processed dataset at {processed_csv_path} ({processed_count} rows)")

if __name__ == "__main__":
    main()
