import os
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
import joblib

# ─── 1) Configuration ───────────────────────────────
DATA_DIR = r"C:\Users\DELL\OneDrive\Desktop\flex-lingo\data"
NUM_FEATURES = 10  # Only 10 features (no label column in CSV)
gesture_map = {
    "hi": 0,
    "yes": 1,
    "no": 2,
    "rest": 3
}
labels_list = ["hi", "yes", "no", "rest"]

# ─── 2) Load dataset ────────────────────────────────
features = []
labels = []

for folder in os.listdir(DATA_DIR):
    folder_path = os.path.join(DATA_DIR, folder)
    
    if os.path.isdir(folder_path):
        for file in os.listdir(folder_path):
            file_path = os.path.join(folder_path, file)
            
            if file.endswith('.csv'):
                data = pd.read_csv(file_path)

                if data.shape[1] != NUM_FEATURES:
                    print(f" Skipping {file}: Expected {NUM_FEATURES} columns, got {data.shape[1]}")
                    continue

                matched = False
                for gesture, label in gesture_map.items():
                    if gesture in file.lower():
                        features.extend(data.values)
                        labels.extend([label] * len(data))
                        matched = True
                        break

                if not matched:
                    print(f" Unknown gesture in file name: {file}")

print(f" Total samples loaded: {len(features)}")

# ─── 3) Preprocessing ───────────────────────────────
features = np.array(features)
labels = np.array(labels)

if len(features) == 0:
    raise ValueError(" No data loaded. Please check your dataset structure and file names.")

# ─── 4) Train/Test Split ────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(
    features, labels, test_size=0.2, random_state=42)

# ─── 5) Train Model ─────────────────────────────────
rf_model = RandomForestClassifier(n_estimators=100, random_state=42)
rf_model.fit(X_train, y_train)

# ─── 6) Evaluation ──────────────────────────────────
train_accuracy = rf_model.score(X_train, y_train)
test_accuracy = rf_model.score(X_test, y_test)

print(f"\nTrain Accuracy: {train_accuracy:.4f}")
print(f" Test Accuracy: {test_accuracy:.4f}")

# ─── 7) Report ──────────────────────────────────────
y_pred = rf_model.predict(X_test)
report = classification_report(y_test, y_pred, target_names=labels_list)
print("\n Classification Report:")
print(report)

# ─── 8) Save model ──────────────────────────────────
joblib.dump(rf_model, 'random_forest_model_10_features.pkl')
print(" Random Forest model saved as 'random_forest_model_10_features.pkl'")

# ─── 9) Visualizations ──────────────────────────────

# Confusion Matrix
cm = confusion_matrix(y_test, y_pred)
plt.figure(figsize=(6, 5))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
            xticklabels=labels_list, yticklabels=labels_list)
plt.xlabel("Predicted")
plt.ylabel("True")
plt.title("Confusion Matrix")
plt.tight_layout()
plt.show()

# Classification Report Heatmap
plt.figure(figsize=(6, 5))
sns.heatmap(pd.DataFrame(classification_report(
    y_test, y_pred, target_names=labels_list, output_dict=True)).iloc[:-1, :].T,
    annot=True, cmap='coolwarm')
plt.title("Classification Report Heatmap")
plt.tight_layout()
plt.show()

# Feature Importance
feature_importances = rf_model.feature_importances_
plt.figure(figsize=(10, 5))
plt.bar(range(len(feature_importances)), feature_importances, color='skyblue')
plt.xlabel("Feature Index")
plt.ylabel("Importance")
plt.title("Feature Importance in Random Forest Model")
plt.tight_layout()
plt.show()
