import joblib
import numpy as np

# Load the trained model
model = joblib.load('random_forest_model_11_features.pkl')

# Function to predict based on passed data
def predict_from_values(data_values):
    # Ensure the data has the correct number of columns (10 values, instead of 11)
    consistent_num_columns = model.n_features_in_  # Get expected feature size
    if len(data_values) != consistent_num_columns:
        print(f"Error: Expected {consistent_num_columns} values, but received {len(data_values)} values.")
        return
    
    # Convert the data into a numpy array and make predictions
    data_array = np.array(data_values).reshape(1, -1)  # Reshape to (1, number of features)
    prediction = model.predict(data_array)  # Predict using the trained model

    # Output the prediction
    print(f"Prediction: {prediction[0]}")

    # Optionally, handle the prediction output (e.g., display or log it)
    if prediction[0] == 0:
        print("Predicted: 'Hi' class")
    elif prediction[0] == 1:
        print("Predicted: 'Ok' class")
    else:
        print("Predicted: Unknown class")

# Direct data sets
data_values1 = [321,292,287,279,0,0,0,0,0,0] 
data_values2 = [321,293,286,279,0,0,0,0,-21,-5]
data_values3 = [319, 308, 301, 294, 0, 0, 0, 0, -15, -16]  
data_values4 = [320, 308, 302, 294, 0, 0, 0, 0, 23, -30]   
data_values5 = [326,292,283,277,0,0,0,0,0,2] 


# Call the prediction function with the above values
print("Prediction for first set:") #ok
predict_from_values(data_values1)

print("\nPrediction for second set:") #ok
predict_from_values(data_values2)

print("\nPrediction for third set:") #hi
predict_from_values(data_values3)

print("\nPrediction for fourth set:") #hi
predict_from_values(data_values4)

print("\nPrediction for fifth set:") #ok
predict_from_values(data_values5)

