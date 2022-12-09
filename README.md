# Pose-RaceCARduino

Control a Bluetooth enabled ESP32 Robot using your arms!

This project uses a React webinterface and the Web Bluetooth API to control an ESP32 based microcontroller that is part of a simple twin-motor RC car. Specifically, this project used a LILYGO® TTGO T-Display ESP32 WiFi and Bluetooth Module that includes an ESP32, a TFT display and lots of IO ports although it can also run on a generic ESP32 when removing the TFT specific Code.

The controls are designed to work like followed: Your two hands corespond to one wheel speed each. The speed is 0 when the hands are at the height of your shoulders. The car moves forward when you lower your hands and backwards when you lift you hands above your shoulders. You can steer by creating a differential between the height of your two hands and thus making the wheels spin at different speeds. The controls are very slighly delayed and a bit finicky since the motors have a very nonlinear speedcurve and a high lowest speed. Better quality motors and some optimizations would greatly improve the handling.

## Setup

Construct an ESP32 robot that supports BLE and has two PWM controlled motors. The used motor controller is the excellent and cheap L298N Motor Driver attached to two cheap DC motors. Adjust the sketch to your likings and upload the code to your device. Follow the setup instructions of the web app and run it. Connect the web app to the ESP32 and have fun!

## Used Projects

This project uses a modified example and a model of the TensorFlow JS Pose Detection project: https://github.com/tensorflow/tfjs-models/tree/master/pose-detection
