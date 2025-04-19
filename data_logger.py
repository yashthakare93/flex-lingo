import serial
import csv
import time

SERIAL_PORT = 'COM7'
BAUD_RATE = 9600
MAX_RECORDS = 800

try:
    # Connect to Arduino
    print(f"Connecting to Arduino on {SERIAL_PORT}...")
    ser = serial.Serial(SERIAL_PORT, BAUD_RATE)
    time.sleep(2)  # Allow Arduino to reset
    print("Connected. Logging data...\n")

    # Open CSV file
    with open('hand_sensor_data.csv', 'w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow([
            "Flex1", "Flex2", "Flex3", "Flex4",
            "Accelerometer_X", "Accelerometer_Y", "Accelerometer_Z",
            "Gyroscope_X", "Gyroscope_Y", "Gyroscope_Z"
        ])

        count = 0
        while count < MAX_RECORDS:
            line = ser.readline().decode('utf-8').strip()
            if line and not line.startswith("Flex1"):  # Skip header
                data = line.split(',')
                if len(data) == 10:
                    writer.writerow(data)
                    count += 1
                    print(f"[{count}] {data}")

    print("\nData saved. Logger stopped.")

except KeyboardInterrupt:
    print("\n Logging interrupted. Closing the connection...")

except Exception as e:
    print(f"\n Error: {e}")

finally:
    # Ensure the serial connection is closed properly
    if ser.is_open:
        ser.close()
        print("Serial connection closed.")
