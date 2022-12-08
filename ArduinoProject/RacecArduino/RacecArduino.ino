#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEServer.h>

#include <TFT_eSPI.h>


// See the following for generating UUIDs:
// https://www.uuidgenerator.net/

#define SERVICE_UUID         "deadbeef-23e2-11ed-861d-0242ac12efa3"
#define CHARACTERISTIC0_UUID "deadbeef-36e1-4688-b7f5-ea07361b0000"
#define CHARACTERISTIC1_UUID "deadbeef-36e1-4688-b7f5-ea07361b0001"

#define BUTTON1PIN 35
#define BUTTON2PIN 0

BLECharacteristic *pCharacteristic0 = nullptr;
BLECharacteristic *pCharacteristic1 = nullptr;
TFT_eSPI tft = TFT_eSPI(135, 240);

// 21
// 32
// 33
// 25
// 26
// 27
// 39 NO
// 36 NO
// 37 NO
// 38 NO
// the number of the LED pin
#define motorPinEna 21 // pwm
#define motorPin1 32
#define motorPin2 33

#define motorPin3 25
#define motorPin4 26
#define motorPinEnb 27 // pwm

// setting PWM properties
const int freq = 5000;
const int resolution = 8;
const int pwmChannelA = 0;
const int pwmChannelB = 1;

bool on = true;

void IRAM_ATTR toggleButton1() {
  Serial.println("Button 1 Pressed!");
}

void IRAM_ATTR toggleButton2() {
  Serial.println("Button 2 Pressed!");
  on = !on;
  Serial.println(on);
}

void setup() {
  Serial.begin(115200);
  Serial.println("Starting BLE!");

  tft.init();
  tft.setRotation(1);
  tft.fillScreen(TFT_BLACK);
  tft.setTextColor(TFT_RED);
  tft.drawString("Starting", tft.width() / 2, tft.height() / 4 * 3);

  // enable button interupts
  pinMode(BUTTON1PIN, INPUT);
  pinMode(BUTTON2PIN, INPUT);
  attachInterrupt(BUTTON1PIN, toggleButton1, FALLING);
  attachInterrupt(BUTTON2PIN, toggleButton2, FALLING);

  // set other pins to output
  pinMode(motorPinEna, OUTPUT);
  pinMode(motorPin1, OUTPUT);
  pinMode(motorPin2, OUTPUT);
  pinMode(motorPin3, OUTPUT);
  pinMode(motorPin4, OUTPUT);
  pinMode(motorPinEnb, OUTPUT);

  // configure LED PWM functionalitites
  ledcSetup(pwmChannelA, freq, resolution);
  ledcSetup(pwmChannelB, freq, resolution);

  // attach the channel to the pin to be controlled
  ledcAttachPin(motorPinEna, pwmChannelA);
  ledcAttachPin(motorPinEnb, pwmChannelB);

  // name of the bluetooth device
  BLEDevice::init("RacecArduino");
  BLEServer *pServer = BLEDevice::createServer();
  BLEService *pService = pServer->createService(SERVICE_UUID);
  pCharacteristic0 = pService->createCharacteristic(
                                         CHARACTERISTIC0_UUID,
                                         BLECharacteristic::PROPERTY_READ |
                                         BLECharacteristic::PROPERTY_WRITE
                                       );

  pCharacteristic1 = pService->createCharacteristic(
                                         CHARACTERISTIC1_UUID,
                                         BLECharacteristic::PROPERTY_READ |
                                         BLECharacteristic::PROPERTY_WRITE
                                       );

  pCharacteristic0->setValue("0.0");
  pCharacteristic1->setValue("0.0");

  pService->start();
  // BLEAdvertising *pAdvertising = pServer->getAdvertising();  // this still is working for backward compatibility
  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(true);
  pAdvertising->setMinPreferred(0x06);  // functions that help with iPhone connections issue
  pAdvertising->setMinPreferred(0x12);
  BLEDevice::startAdvertising();
  Serial.println("Characteristic defined! Now you can read and write it!");
}

float accelSmooth = 0.0f;
float steeringSmooth = 0.0f;
float smoothing = 0.8f;

void loop() {
  delay(40);
  if (!on) {
    tft.fillScreen(TFT_BLACK);
    tft.setTextColor(TFT_RED);
    tft.drawString("PAUSED", 10, 10);

    digitalWrite(motorPin1, LOW);
	  digitalWrite(motorPin2, LOW);
    digitalWrite(motorPin3, LOW);
	  digitalWrite(motorPin4, LOW);

    return;
  }
  
  float acceleration = String(pCharacteristic0->getValue().c_str()).toFloat();
  float steering = String(pCharacteristic1->getValue().c_str()).toFloat();
  
  acceleration = acceleration < 0.3f && acceleration > -0.3f ? 0.0f : acceleration;
  steering = steering < 0.3f && steering > -0.3f ? 0.0f : steering;

  accelSmooth = accelSmooth * (1.0f-smoothing) + acceleration * smoothing;
  steeringSmooth = steeringSmooth * (1.0f-smoothing) + steering * smoothing;
  
  tft.fillScreen(TFT_BLACK);
  tft.setTextColor(TFT_RED);
  tft.drawString(String(acceleration, 3), 10, 10);
  tft.drawString(String(accelSmooth, 3), 10, 30);
  tft.drawString(String(steering, 3), 10, 50);
  tft.drawString(String(steeringSmooth, 3), 10, 70);

  //accel influences both
  //steer adds to one and subtracts from the other

  float speedA = accelSmooth; // range -1.5 to 1.5
  float speedB = steeringSmooth;

  // float speedA = accelSmooth - 0.5 * steeringSmooth; // range -1.5 to 1.5
  // float speedB = accelSmooth + 0.5 * steeringSmooth;
  // speedA *= 0.75f;
  // speedB *= 0.75f;


  tft.drawString(String(speedA, 4), 120, 20);
  tft.drawString(String(speedB, 4), 120, 40);

  // set motor direction depending on direction of resulting speed and make speed positive
  if(speedA < 0) {
    digitalWrite(motorPin1, LOW);
	  digitalWrite(motorPin2, HIGH);
    speedA = -speedA;
  } else {
    digitalWrite(motorPin1, HIGH);
	  digitalWrite(motorPin2, LOW);
  }

  if(speedB < 0) {
    digitalWrite(motorPin3, LOW);
	  digitalWrite(motorPin4, HIGH);
    speedB = -speedB;
  } else {
    digitalWrite(motorPin3, HIGH);
	  digitalWrite(motorPin4, LOW);
  }

  // speed ranges in 0 to 1
  speedA = constrain(speedA, 0.0f, 1.0f);
  speedB = constrain(speedB, 0.0f, 1.0f);


  // send PWM speed signal from 0 to MAXSPEED
  // scaling 0 to 1 into 0 to 1000 and then mapping from 0 to maxspeed
  #define maxSpeed 250
  int pwmA = map((speedA) * 1000, 0, 1000, 170, maxSpeed);
  int pwmB = map((speedB) * 1000, 0, 1000, 170, maxSpeed);

  // 175 - 255 is actual speed variance
  pwmA = pwmA > 173 ? pwmA : 0;
  pwmB = pwmB > 173 ? pwmB : 0;

  tft.drawString(String(pwmA), tft.width() / 2, 80);
  tft.drawString(String(pwmB), tft.width() / 2, 100);

  ledcWrite(pwmChannelA, pwmA);
  ledcWrite(pwmChannelB, pwmB);
}