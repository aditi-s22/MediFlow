# Clinical Routing Classifier - Machine Learning System

This directory manages the machine learning classification service used to route patient symptoms to appropriate medical specialties.

## Pipeline Architecture

```
Raw Disease Dataset (raw_dataset.csv)
          ↓
Preprocessing & Mapping (preprocess.py)
          ↓
Processed Specialty Dataset (processed_dataset.csv)
          ↓
Model Benchmarking & Training (train.py)
          ↓
Model Validation & Metrics (evaluate.py)
          ↓
Serialized Classifier (model.joblib + vectorizer.joblib)
          ↓
FastAPI Web Application (api/app.py)
```

---

## Technical Specifications

### 1. Dataset Generation & Preprocessing
* **Source**: Synthesized to mimic the structure and vocabulary of public medical symptom datasets (such as the Kaggle **Disease-Symptom Prediction** dataset).
* **Disease to Department Mapping**: Maps specific diagnoses (e.g. *Hypertension* or *Heart attack*) into broad clinical departments (*Cardiology*), ensuring the classification model operates on a specialist-routing level rather than a diagnostic level, which is safer and clinically sound.

### 2. Feature Extraction (TF-IDF)
We use a **TF-IDF Vectorizer** (Term Frequency-Inverse Document Frequency) with n-gram ranges `(1, 2)`.
* **Rationale**: Clinical text descriptions contain key multi-word phrases (e.g. "chest pain", "shortness of breath") that carry high clinical weight. N-grams capture these phrase pairings, and TF-IDF scales down common stop words while emphasizing specific symptomatic indicators.

### 3. Model Benchmark & Selection
We evaluated three classification models on a stratified 80-20 train-test split:
1. **Logistic Regression** (Accuracy: ~96.2%)
2. **Linear SVM** (Accuracy: ~98.1%)
3. **Multinomial Naive Bayes** (Accuracy: ~94.7%)

* **Why SVM Performed Best**: Text vectorization results in high-dimensional sparse representations. Support Vector Machines (specifically Linear SVC) excel at finding the optimal separating hyperplane with maximum margin in high-dimensional spaces, resulting in superior classification boundaries.

---

## Gateway Communication (Express to FastAPI)

```
[ Patient Client ]
       ↓ (HTTP POST /api/ml/recommend)
[ Express Gateway (Port 5000) ]
       ↓ (HTTP POST http://localhost:8000/predict)
[ FastAPI microservice (Port 8000) ]
```

1. The Express server calls the FastAPI `/predict` microservice using the global `fetch()` API.
2. FastAPI processes the symptom string, runs the SVM classifier, and outputs the department and confidence values.
3. Express logs the request in `PredictionLog` and returns the matching specialties and doctors to the patient.

---

## Limitations & Future Improvements
* **Disclaimer**: This is a routing recommendation system, not a diagnostic engine. It does not replace medical advice.
* **Limitations**: Relies on written English descriptions. Typing typos might slightly degrade predictions.
* **Future Work**: Add support for spelling autocorrect in the preprocessing pipeline, and implement multilingual support for regional patient languages.
