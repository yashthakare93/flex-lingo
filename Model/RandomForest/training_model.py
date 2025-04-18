import os
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
import joblib

# Define the path to the dataset directory
DATA_DIR = r"C:\Users\DELL\OneDrive\Desktop\flex-lingo\data"

# Initialize lists to store features and labels
features = []
labels = []

# Define a consistent number of columns (adjust based on your CSV data)
consistent_num_columns = 11  # 5 Flex columns + 6 accelerometer/gyroscope columns

# Loop through each folder (01, 02, 03) in the dataset directory
for folder in os.listdir(DATA_DIR):
    folder_path = os.path.join(DATA_DIR, folder)
    
    if os.path.isdir(folder_path):
        for file in os.listdir(folder_path):
            file_path = os.path.join(folder_path, file)
            
            if file.endswith('.csv'):
                data = pd.read_csv(file_path)
                
                if data.shape[1] != consistent_num_columns:
                    print(f"Warning: {file} has {data.shape[1]} columns, expected {consistent_num_columns}.")
                    continue
                
                for index, row in data.iterrows():
                    features.append(row[:-1].values)
                
                if 'hi' in file:
                    label = 0
                elif 'ok' in file:
                    label = 1
                else:
                    label = -1 
                
                labels.extend([label] * len(data))

features = np.array(features)
labels = np.array(labels)

# Split the dataset into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(features, labels, test_size=0.2, random_state=42)

# Initialize the Random Forest model
rf_model = RandomForestClassifier(n_estimators=100,- random_state=42)
rf_model.fit(X_train, y_train)

# Evaluate the model
train_accuracy = rf_model.score(X_train, y_train)
test_accuracy = rf_model.score(X_test, y_test)

print(f"Train Accuracy: {train_accuracy}")
print(f"Test Accuracy: {test_accuracy}")

# Predictions
y_pred = rf_model.predict(X_test)

# Classification Report
report = classification_report(y_test, y_pred, output_dict=True)
print("\nClassification Report:")
print(classification_report(y_test, y_pred))

# Confusion Matrix
cm = confusion_matrix(y_test, y_pred)
print("\nConfusion Matrix:")
print(cm)

# Save the trained model
joblib.dump(rf_model, 'random_forest_model_11_features.pkl')
print("Random Forest model saved to random_forest_model_11_features.pkl")

# Visualization
plt.figure(figsize=(6,5))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=['hi', 'ok'], yticklabels=['hi', 'ok'])
plt.xlabel('Predicted Label')
plt.ylabel('True Label')
plt.title('Confusion Matrix')
plt.show()

# Classification Report Heatmap
plt.figure(figsize=(6,5))
sns.heatmap(pd.DataFrame(report).iloc[:-1, :].T, annot=True, cmap='coolwarm')
plt.title('Classification Report Heatmap')
plt.show()

# Feature Importance Plot
feature_importances = rf_model.feature_importances_
plt.figure(figsize=(10,5))
plt.bar(range(len(feature_importances)), feature_importances, color='skyblue')
plt.xlabel("Feature Index")
plt.ylabel("Importance")
plt.title("Feature Importance in Random Forest Model")
plt.show()
