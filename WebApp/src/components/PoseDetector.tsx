import * as poseDetection from "@tensorflow-models/pose-detection";
// Register one of the TF.js backends.
import "@tensorflow/tfjs-backend-webgl";
import React from "react";
import { Camera } from "../lib/camera";
import { processPose } from "../lib/util";
import BluetoothController from "./BluetoothController";
// import '@tensorflow/tfjs-backend-wasm';

class PoseDetectorComp extends React.Component<
  {},
  {
    detector: poseDetection.PoseDetector | null;
    camera: Camera | null;
    timerId: number | null;
    acceleration: number;
    steering: number;
  }
> {
  state = {
    detector: null,
    camera: null,
    timerId: null,
    acceleration: 0,
    steering: 0,
  };

  async componentDidMount() {
    let detectorConfig = {
      // modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
    };
    let localdetector = await poseDetection.createDetector(
      poseDetection.SupportedModels.MoveNet,
      detectorConfig
    );

    let localCamera = await Camera.setupCamera();

    let localInterval = setInterval(async () => {
      if (localCamera.video.readyState < 2) {
        await new Promise((resolve) => {
          localCamera.video.onloadeddata = () => {
            // @ts-ignore
            resolve(video);
          };
        });
      }

      let poses = null;

      try {
        poses = await localdetector.estimatePoses(localCamera.video, {
          maxPoses: 1,
          flipHorizontal: false,
        });
      } catch (error) {
        localdetector.dispose();
        alert(error);
      }

      localCamera.drawCtx();

      if (poses && poses.length > 0) {
        let res = processPose(poses[0]);
        this.setState({
          acceleration: res.acceleration,
          steering: res.steering,
        });
        localCamera.drawResults(poses);
      }
    }, 50) as unknown as number;

    this.setState({
      detector: localdetector,
      camera: localCamera,
      timerId: localInterval,
    });
  }

  componentWillUnmount() {
    if (this.state !== null && this.state.timerId !== null) {
      clearInterval(this.state.timerId);
    }
  }

  render() {
    return (
      <div className="canvas-wrapper">
        <BluetoothController
          acceleration={this.state.acceleration}
          steering={this.state.steering}
        />
        <canvas id="output"></canvas>
        <video id="video" playsInline></video>
      </div>
    );
  }
}

export default PoseDetectorComp;
