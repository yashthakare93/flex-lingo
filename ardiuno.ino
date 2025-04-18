#include <Wire.h>
#include <MPU6050.h>

MPU6050 mpu;

void setup() {
  Serial.begin(9600);
  Wire.begin();
  mpu.initialize();

  if (!mpu.testConnection()) {
    Serial.println("MPU6050 connection failed");
    while (1);
  }

  delay(1000);
  Serial.println("Flex1,Flex2,Flex3,Flex4,Accelerometer_X,Accelerometer_Y,Accelerometer_Z,Gyroscope_X,Gyroscope_Y,Gyroscope_Z");
}

void loop() {
  // Flex sensor readings
  int flex1 = analogRead(A0);
  int flex2 = analogRead(A1);
  int flex3 = analogRead(A2);
  int flex4 = analogRead(A3);

  // MPU6050 data
  int16_t ax, ay, az;
  int16_t gx, gy, gz;
  
  // Convert raw values (optional: scale for better readability)
  gx /= 131;    
  gy /= 131;
  gz /= 131;


  mpu.getMotion6(&ax, &ay, &az, &gx, &gy, &gz);

  // Send data in CSV format
  Serial.print(flex1); Serial.print(",");
  Serial.print(flex2); Serial.print(",");
  Serial.print(flex3); Serial.print(",");
  Serial.print(flex4); Serial.print(",");
  Serial.print(ax); Serial.print(",");
  Serial.print(ay); Serial.print(",");
  Serial.print(az); Serial.print(",");
  Serial.print(gx); Serial.print(",");
  Serial.print(gy); Serial.print(",");
  Serial.println(gz);

  delay(200); // Adjust sampling rate if needed
}

