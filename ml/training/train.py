import os
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.svm import LinearSVC
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics import accuracy_score, precision_recall_fscore_support

# Ensure models output directory exists
os.makedirs(os.path.join(os.path.dirname(__file__), "..", "models"), exist_ok=True)
models_dir = os.path.join(os.path.dirname(__file__), "..", "models")
dataset_path = os.path.join(os.path.dirname(__file__), "..", "data", "processed_dataset.csv")

def main():
    print("Loading dataset...")
    if not os.path.exists(dataset_path):
        print(f"Error: processed_dataset.csv not found at {dataset_path}. Please run preprocess.py first.")
        return

    df = pd.read_csv(dataset_path)
    X = df["symptoms"]
    y = df["department"]

    print(f"Dataset loaded. Total records: {len(df)}")

    # Split into train and test sets (80/20)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    # Vectorize symptoms using TF-IDF (unigrams & bigrams)
    vectorizer = TfidfVectorizer(ngram_range=(1, 2), stop_words="english", min_df=2)
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)

    # Define candidate models
    models = {
        "Logistic Regression": LogisticRegression(max_iter=1000, random_state=42),
        "Linear SVM": LinearSVC(random_state=42, dual="auto"),
        "Multinomial Naive Bayes": MultinomialNB()
    }

    best_model_name = None
    best_f1 = -1
    best_model_obj = None
    results = {}

    print("\nBenchmarking models...")
    print("-" * 70)
    print(f"{'Model':<25} | {'Accuracy':<8} | {'Precision':<9} | {'Recall':<8} | {'F1-Score':<8}")
    print("-" * 70)

    for name, clf in models.items():
        # Fit candidate model
        clf.fit(X_train_vec, y_train)
        preds = clf.predict(X_test_vec)

        # Compute metrics
        acc = accuracy_score(y_test, preds)
        precision, recall, f1, _ = precision_recall_fscore_support(y_test, preds, average="macro")

        results[name] = {"accuracy": acc, "f1": f1, "model": clf}
        print(f"{name:<25} | {acc:.4f}   | {precision:.4f}    | {recall:.4f} | {f1:.4f}")

        # Track the best model based on F1 Score
        if f1 > best_f1:
            best_f1 = f1
            best_model_name = name
            best_model_obj = clf

    print("-" * 70)
    print(f"\nBest Model Selected: {best_model_name} (F1-Score: {best_f1:.4f})")

    # Retrain best model on the ENTIRE dataset for maximum generalization
    print("\nRetraining chosen model on the full dataset...")
    X_full_vec = vectorizer.fit_transform(X)
    
    # Instantiate a fresh instance of the best model to fit full data
    if best_model_name == "Logistic Regression":
        final_model = LogisticRegression(max_iter=1000, random_state=42)
    elif best_model_name == "Linear SVM":
        final_model = LinearSVC(random_state=42, dual="auto")
    else:
        final_model = MultinomialNB()

    final_model.fit(X_full_vec, y)

    # Save artifacts
    model_path = os.path.join(models_dir, "model.joblib")
    vectorizer_path = os.path.join(models_dir, "vectorizer.joblib")

    joblib.dump(final_model, model_path)
    joblib.dump(vectorizer, vectorizer_path)

    print("Model serialized and saved successfully:")
    print(f"  - Model: {model_path}")
    print(f"  - Vectorizer: {vectorizer_path}")

if __name__ == "__main__":
    main()
