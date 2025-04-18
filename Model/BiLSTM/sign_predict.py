import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model
import joblib

# Load the trained BiLSTM model
model = load_model('bilstm_sign_model.keras')

# Load the scaler used during training
scaler = joblib.load('scaler.pkl')

# Function to predict based on passed data
def predict_from_values(data_values):
    # Ensure the data has the correct number of features
    consistent_num_columns = model.input_shape[1]  # Get expected feature size (11 features)
    if len(data_values) != consistent_num_columns:
        print(f"Error: Expected {consistent_num_columns} values, but received {len(data_values)} values.")
        return
    
    # Convert the data into a numpy array and reshape
    data_array = np.array(data_values).reshape(1, -1)
    
    # Normalize the data using the trained scaler
    data_array = scaler.transform(data_array)
    
    # Reshape the data for LSTM input (batch_size, timesteps, features)
    data_array = data_array.reshape(1, data_array.shape[1], 1)
    
    # Make a prediction
    prediction = model.predict(data_array)
    predicted_class = np.argmax(prediction, axis=1)[0]
    
    # Output the prediction
    print(f"Prediction: {predicted_class}")
    
    if predicted_class == 0:
        print("Predicted: 'Hi' class")
    elif predicted_class == 1:
        print("Predicted: 'Ok' class")
    else:
        print("Predicted: Unknown class")

# Direct data sets
data_values1 = [321,292,287,279,0,0,0,0,0,0,0] 
data_values2 = [321,293,286,279,0,0,0,0,-21,-5,0]
data_values3 = [319, 308, 301, 294, 0, 0, 0, 0, -15, -16, 0]  
data_values4 = [320, 308, 302, 294, 0, 0, 0, 0, 23, -30, 0]   
data_values5 = [326,292,283,277,0,0,0,0,0,2,0] 

# Call the prediction function with the above values
print("Prediction for first set:")
predict_from_values(data_values1)

print("\nPrediction for second set:")
predict_from_values(data_values2)

print("\nPrediction for third set:")
predict_from_values(data_values3)

print("\nPrediction for fourth set:")
predict_from_values(data_values4)

print("\nPrediction for fifth set:")
predict_from_values(data_values5)
