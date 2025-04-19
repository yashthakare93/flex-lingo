#!/usr/bin/env python
import sys
import os
import datetime
import numpy as np
import joblib
import serial

def main():
    # 1) COM‑port argument
    if len(sys.argv) < 2:
        print("No COM port specified. Usage: python predict_rf.py COM7")
        sys.exit(1)
    port = sys.argv[1]

    # 2) Model path
    base = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(base, "random_forest_model_10_features.pkl")

    # 3) Load RF model
    try:
        rf = joblib.load(model_path)
    except Exception as e:
        print(f"Failed to load RF model: {e}")
        sys.exit(1)

    # 4) Mapping back to gesture names
    mapping = {
        0: "hi",
        1: "yes",
        2: "no",
        3: "rest"
    }

    # 5) Open serial port
    try:
        ser = serial.Serial(port, 9600, timeout=2)
    except Exception as e:
        print(f"Serial open error ({port}): {e}")
        sys.exit(1)

    # 6) Read one valid line, predict, exit
    while True:
        raw = ser.readline().decode("utf-8", errors="ignore").strip()
        # skip blank or header
        if not raw or raw.startswith("Flex1"):
            continue

        parts = raw.split(",")
        if len(parts) != 10:
            continue

        # parse floats
        try:
            data = np.array([float(x) for x in parts], dtype=np.float32).reshape(1, -1)
        except ValueError:
            continue

        # predict
        label_idx = rf.predict(data)[0]
        label = mapping.get(label_idx, "unknown")
        ts = datetime.datetime.now().strftime("%H:%M:%S")
        print(f"{label} {ts}")
        break

if __name__ == "__main__":
    main()
