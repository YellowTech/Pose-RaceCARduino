/**
 * @license
 * Copyright 2021 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 *
 *
 * Code was severly modified to work with TS and suit own needs
 * see original at
 * https://github.com/tensorflow/tfjs-models/tree/master/pose-detection/demos/live_video/src
 */

import * as poseDetection from "@tensorflow-models/pose-detection";

export function isiOS() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export function isAndroid() {
  return /Android/i.test(navigator.userAgent);
}

export function isMobile() {
  return isAndroid() || isiOS();
}

export function processPose(
  pose: poseDetection.Pose
): // steering: -1 to 1 for right and left, acceleration -1 to 1 for backwards to forwards
{ steering: number; acceleration: number } {
  // numbers are from the COCO keypoints model: https://github.com/tensorflow/tfjs-models/tree/master/pose-detection
  const BShoulderR = pose.keypoints[6];
  const BHandR = pose.keypoints[10];
  const BShoulderL = pose.keypoints[5];
  const BHandL = pose.keypoints[9];
  const BHip = pose.keypoints[12];

  const BArray = [BShoulderR, BHandR, BShoulderL, BHandL, BHip];

  // if any of them is has a confidence of under 0.3 or undefined confidence
  if (
    BArray.filter((x) => x.score === undefined || x.score < 0.35).length > 0
  ) {
    return {
      acceleration: 0,
      steering: 0,
    };
  }

  // find relative height of upper body
  const height = BShoulderR.y - BHip.y;

  const clamp = (x: number) => {
    return Math.max(-1, Math.min(1, x));
  };

  // calculate height of hands compared to shoulders and scale by body height, clamp from -1 to 1
  const accel = clamp((BHandL.y - BShoulderL.y) / height);
  const steer = clamp((BHandR.y - BShoulderR.y) / height);

  return {
    acceleration: accel,
    steering: steer,
  };
}
