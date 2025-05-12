#!/usr/bin/env python
import os
# ─── Silence TF and oneDNN logs ───────────────────────────────────
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"    # hide INFO/WARNING
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"   # disable oneDNN optimizations

import sys
import datetime
import numpy as np
import joblib
import tensorflow as tf
import serial

def main():
    if len(sys.argv) < 2:
        print("No COM port specified")
        sys.exit(1)
    port = sys.argv[1]

    base = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(base, "bilstm_sign_model.keras")
    scaler_path = os.path.join(base, "scaler.pkl")
    le_path    = os.path.join(base, "label_encoder.pkl")

    # load your artifacts
    try:
        model = tf.keras.models.load_model(model_path)
        scaler = joblib.load(scaler_path)
        label_encoder = joblib.load(le_path)
    except Exception as e:
        print(f"Failed to load model/tools: {e}")
        sys.exit(1)

    # open serial
    try:
        ser = serial.Serial(port, 9600, timeout=2)
    except Exception as e:
        print(f"Serial open error: {e}")
        sys.exit(1)

    # read one valid line, predict, and exit
    while True:
        raw = ser.readline().decode("utf-8", errors="ignore").strip()
        if not raw or raw.startswith("Flex1"):
            continue
        parts = raw.split(",")
        if len(parts) != 10:
            continue
        try:
            data = np.array([float(x) for x in parts], dtype=np.float32)
        except ValueError:
            continue

        arr = data.reshape(1, -1)                           # (1,10)
        scaled = scaler.transform(arr).reshape(1, 10, 1)    # (1,10,1)

        pred = model.predict(scaled, verbose=0)
        idx  = int(np.argmax(pred))
        label = label_encoder.inverse_transform([idx])[0]
        ts = datetime.datetime.now().strftime("%H:%M:%S")
        print(f"{label} {ts}")
        break

if __name__ == "__main__":
    main()