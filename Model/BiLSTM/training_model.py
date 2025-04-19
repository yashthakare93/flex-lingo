import os
import pandas as pd
import numpy as np
import tensorflow as tf
import matplotlib.pyplot as plt
import seaborn as sns
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Bidirectional
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import confusion_matrix, classification_report
import joblib  # For saving the scaler

# ─── 1. Set data directory ────────────────────────────────
DATA_DIR = r"C:\Users\DELL\OneDrive\Desktop\flex-lingo\data"

gesture_labels = {
    "hi.csv": "hi",
    "yes.csv": "yes",
    "no.csv": "no",
    "rest.csv": "rest"
}

# ─── 2. Load CSVs and extract features/labels ─────────────
def load_data():
    features_list = []
    labels_list = []

    for folder in sorted(os.listdir(DATA_DIR)):
        folder_path = os.path.join(DATA_DIR, folder)

        if os.path.isdir(folder_path):
            for file_name in gesture_labels.keys():
                file_path = os.path.join(folder_path, file_name)

                if os.path.exists(file_path):
                    df = pd.read_csv(file_path)

                    # Add labels if not present
                    if "labels" not in df.columns:
                        df["labels"] = gesture_labels[file_name]

                    features_list.append(df.drop(columns=["labels"]))
                    labels_list.append(df["labels"])
                    print(f"✅ Processed: {file_name}")

    if not features_list:
        raise ValueError("❌ No valid data found!")

    X = pd.concat(features_list, axis=0).to_numpy()
    y = pd.concat(labels_list, axis=0).to_numpy()
    return X, y

# ─── 3. Load and preprocess data ──────────────────────────
X, y = load_data()

label_encoder = LabelEncoder()
y = label_encoder.fit_transform(y)  # Encode 'hi', 'yes', 'no', 'rest' as 0–3

# Save label encoder
joblib.dump(label_encoder, "label_encoder.pkl")
print("✅ LabelEncoder saved as 'label_encoder.pkl'")

scaler = StandardScaler()
X = scaler.fit_transform(X)

# Save scaler for prediction
joblib.dump(scaler, 'scaler.pkl')
print("✅ Scaler saved as 'scaler.pkl'")

# ─── 4. Reshape for LSTM (samples, timesteps, features) ───
X = X.reshape((X.shape[0], X.shape[1], 1))

# ─── 5. Split the dataset ─────────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42)

# ─── 6. Define BiLSTM Model ───────────────────────────────
model = Sequential([
    Bidirectional(LSTM(64, return_sequences=True), input_shape=(X_train.shape[1], 1)),
    Bidirectional(LSTM(32)),
    Dense(16, activation="relu"),
    Dense(len(np.unique(y)), activation="softmax")  # 4 output classes
])

model.compile(optimizer="adam", loss="sparse_categorical_crossentropy", metrics=["accuracy"])

# ─── 7. Train the Model ───────────────────────────────────
history = model.fit(X_train, y_train, epochs=10, batch_size=32, validation_split=0.2)

# ─── 8. Save the trained model ────────────────────────────
model.save('bilstm_sign_model.keras')
print("✅ Model saved as 'bilstm_sign_model.keras'")

# ─── 9. Evaluate ──────────────────────────────────────────
train_loss, train_acc = model.evaluate(X_train, y_train, verbose=0)
test_loss, test_acc = model.evaluate(X_test, y_test, verbose=0)

print(f"🎯 Training Accuracy: {train_acc:.4f}")
print(f"🧪 Testing Accuracy: {test_acc:.4f}")

# ─── 10. Classification Report & Confusion Matrix ─────────
y_pred = np.argmax(model.predict(X_test), axis=1)

gesture_names = label_encoder.classes_

# Confusion Matrix
cm = confusion_matrix(y_test, y_pred)
plt.figure(figsize=(6, 5))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
            xticklabels=gesture_names, yticklabels=gesture_names)
plt.xlabel('Predicted Label')
plt.ylabel('True Label')
plt.title('Confusion Matrix')
plt.tight_layout()
plt.show()

# Classification Report Heatmap
report = classification_report(y_test, y_pred, output_dict=True)
plt.figure(figsize=(6, 5))
sns.heatmap(pd.DataFrame(report).iloc[:-1, :].T, annot=True, cmap='coolwarm')
plt.title('Classification Report Heatmap')
plt.tight_layout()
plt.show()
