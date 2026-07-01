import os
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

# Resolve paths
base_dir = os.path.dirname(os.path.abspath(__file__))
dataset_path = os.path.join(base_dir, "..", "data", "processed_dataset.csv")
model_path = os.path.join(base_dir, "..", "models", "model.joblib")
vectorizer_path = os.path.join(base_dir, "..", "models", "vectorizer.joblib")

def main():
    print("Loading test dataset and model artifacts...")
    if not os.path.exists(dataset_path):
        print(f"Error: processed_dataset.csv not found. Please run preprocess.py first.")
        return
    if not os.path.exists(model_path) or not os.path.exists(vectorizer_path):
        print("Error: Serialized model artifacts not found. Please run train.py first.")
        return

    # Load dataset
    df = pd.read_csv(dataset_path)
    X = df["symptoms"]
    y = df["department"]

    # Recreate the train/test split to isolate test samples (80/20 split)
    _, X_test, _, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    # Load model and vectorizer
    model = joblib.load(model_path)
    vectorizer = joblib.load(vectorizer_path)

    # Vectorize test features
    X_test_vec = vectorizer.transform(X_test)

    # Predict
    y_pred = model.predict(X_test_vec)

    # Calculate metrics
    accuracy = accuracy_score(y_test, y_pred)
    report = classification_report(y_test, y_pred)
    cm = confusion_matrix(y_test, y_pred, labels=list(model.classes_))

    print("\n" + "=" * 60)
    print("MODEL EVALUATION SUMMARY")
    print("=" * 60)
    print(f"Test Accuracy: {accuracy:.4%}")
    print("\nDetailed Classification Report:")
    print("-" * 60)
    print(report)
    print("-" * 60)

    # Format Confusion Matrix
    print("\nConfusion Matrix:")
    print("-" * 60)
    classes = list(model.classes_)
    
    # Print header
    header = f"{'True \\ Pred':<20}" + " ".join([f"{c[:4]:>5}" for c in classes])
    print(header)
    print("-" * 60)
    
    for i, row in enumerate(cm):
        row_str = f"{classes[i]:<20}" + " ".join([f"{val:>5}" for val in row])
        print(row_str)
    print("-" * 60)

if __name__ == "__main__":
    main()
