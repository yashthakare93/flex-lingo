import sys, os, datetime
import numpy as np
import joblib
import tensorflow as tf
import serial

# ─── 0) Quiet TF logs ───────────────────────────────
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

# ─── 1) Load model & scaler ────────────────────────
try:
    model = tf.keras.models.load_model("server/bilstm_sign_model.keras")
    scaler = joblib.load("server/scaler.pkl")
except Exception as e:
    print(f"Failed to load model/scaler: {e}")
    sys.exit(1)

# ─── 2) Read COM port from argv ─────────────────────
if len(sys.argv) < 2:
    print("No COM port specified.")
    sys.exit(1)
port_name = sys.argv[1]

# ─── 3) Open serial ────────────────────────────────
try:
    ser = serial.Serial(port_name, 9600, timeout=5)
except Exception as e:
    print(f"Error opening {port_name}: {e}")
    sys.exit(1)

# ─── 4) Single‑step prediction ──────────────────────
while True:
    try:
        if ser.in_waiting:
            line = ser.readline().decode('utf-8', errors='ignore').strip()
            if not line or line.startswith("Flex1"):
                continue

            parts = line.split(",")
            if len(parts) != 10:
                continue

            try:
                data = np.array([float(p) for p in parts], dtype=np.float32)
            except ValueError:
                continue

            # reshape to (1,10), scale, then (1,10,1) for LSTM
            arr = data.reshape(1, -1)
            scaled = scaler.transform(arr).reshape((1, arr.shape[1], 1))

            pred = model.predict(scaled, verbose=0)
            label = int(np.argmax(pred))
            word = "hi" if label == 1 else "yes"
            timestamp = datetime.datetime.now().strftime("%H:%M:%S")

            # print exactly one line for the Node backend to parse
            print(f"{word} {timestamp}")
            sys.exit(0)
    except Exception:
        # swallow any errors, keep looping
        continue
