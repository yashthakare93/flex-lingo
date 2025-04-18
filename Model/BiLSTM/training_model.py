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

# Set data directory
DATA_DIR = r"C:\Users\DELL\OneDrive\Desktop\flex-lingo\data"

# Function to load CSV files
def load_data():
    features_list = []
    labels_list = []

    for folder in sorted(os.listdir(DATA_DIR)):
        folder_path = os.path.join(DATA_DIR, folder)

        if os.path.isdir(folder_path):
            for file in ["yes.csv", "hi.csv"]:
                file_path = os.path.join(folder_path, file)

                if os.path.exists(file_path):
                    df = pd.read_csv(file_path)

                    # Add labels manually if missing
                    if "labels" not in df.columns:
                        df["labels"] = 1 if "hi.csv" in file else 0
                    
                    # Extract features and labels
                    features_list.append(df.drop(columns=["labels"]))  # Drop labels column
                    labels_list.append(df["labels"])

                    print(f"Processed {file}")

    if not features_list:
        raise ValueError("Error: No valid data found!")

    # Combine all data
    X = pd.concat(features_list, axis=0).to_numpy()
    y = pd.concat(labels_list, axis=0).to_numpy()

    return X, y

# Load dataset
X, y = load_data()

# Encode labels
label_encoder = LabelEncoder()
y = label_encoder.fit_transform(y)

# Normalize the features using StandardScaler
scaler = StandardScaler()
X = scaler.fit_transform(X)

# Save the scaler for use in prediction script
joblib.dump(scaler, 'scaler.pkl')
print("Scaler saved as 'scaler.pkl'")

# Reshape X for LSTM input (samples, timesteps, features)
X = X.reshape((X.shape[0], X.shape[1], 1))

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Define BiLSTM model
model = Sequential([
    Bidirectional(LSTM(64, return_sequences=True), input_shape=(X_train.shape[1], 1)),
    Bidirectional(LSTM(32)),
    Dense(16, activation="relu"),
    Dense(len(np.unique(y)), activation="softmax")
])

# Compile model
model.compile(optimizer="adam", loss="sparse_categorical_crossentropy", metrics=["accuracy"])

# Train model
history = model.fit(X_train, y_train, epochs=10, batch_size=32, validation_split=0.2)

# Save the trained model
model.save('bilstm_sign_model.keras')
print("Model saved as 'bilstm_sign_model.keras'")

# Evaluate model on training and test sets
train_loss, train_acc = model.evaluate(X_train, y_train, verbose=0)
test_loss, test_acc = model.evaluate(X_test, y_test, verbose=0)

print(f"Training Accuracy: {train_acc:.4f}")
print(f"Testing Accuracy: {test_acc:.4f}")

# Predict on test set
y_pred = np.argmax(model.predict(X_test), axis=1)  # Convert softmax output to class index

# Confusion Matrix
cm = confusion_matrix(y_test, y_pred)
plt.figure(figsize=(6,5))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=['yes', 'hi'], yticklabels=['yes', 'hi'])
plt.xlabel('Predicted Label')
plt.ylabel('True Label')
plt.title('Confusion Matrix')
plt.show()

# Classification Report Heatmap
report = classification_report(y_test, y_pred, output_dict=True)
plt.figure(figsize=(6,5))
sns.heatmap(pd.DataFrame(report).iloc[:-1, :].T, annot=True, cmap='coolwarm')
plt.title('Classification Report Heatmap')
plt.show()
