import React from "react";
import "./App.css";
import PoseDetectorComp from "./components/PoseDetector";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1 className="font-bold">Welcome to Pose Racecarduino!</h1>
        <br />
        <p>
          Use "Start Bluetooth" to connect to the car using the Bluetooth Web
          API (supported in Google Chrome). <br /> In case of connection
          problems, restart the Car and Reset the Bluetooth stack using the
          second Button below.
        </p>
        <br />
        <br />
        <PoseDetectorComp />
      </header>
    </div>
  );
}

export default App;
