import React from "react";
import { Button } from "react-daisyui";

class BluetoothController extends React.Component<
  { acceleration: number; steering: number },
  {
    device: BluetoothDevice | null;
    server: BluetoothRemoteGATTServer | null;
    service: BluetoothRemoteGATTService | null;
    char0: BluetoothRemoteGATTCharacteristic | null;
    char1: BluetoothRemoteGATTCharacteristic | null;
    enc: TextEncoder;
    dec: TextDecoder;
    timerId: number | null;
    timeout: number;
  }
> {
  state = {
    device: null as BluetoothDevice | null,
    server: null as BluetoothRemoteGATTServer | null,
    service: null as BluetoothRemoteGATTService | null,
    char0: null as BluetoothRemoteGATTCharacteristic | null,
    char1: null as BluetoothRemoteGATTCharacteristic | null,
    enc: new TextEncoder(),
    dec: new TextDecoder("utf-8"),
    timerId: null as number | null,
    timeout: 2,
  };

  reset = async () => {
    this.setState({
      device: null as BluetoothDevice | null,
      server: null as BluetoothRemoteGATTServer | null,
      service: null as BluetoothRemoteGATTService | null,
      char0: null as BluetoothRemoteGATTCharacteristic | null,
      char1: null as BluetoothRemoteGATTCharacteristic | null,
    });
  };

  // need to use arrow functions in order to access this, is undefined otherwise
  connect = async () => {
    const serviceUuid = "deadbeef-23e2-11ed-861d-0242ac12efa3";
    const characteristic0Uuid = "deadbeef-36e1-4688-b7f5-ea07361b0000";
    const characteristic1Uuid = "deadbeef-36e1-4688-b7f5-ea07361b0001";

    console.log("Requesting any Bluetooth Device...");
    let device: BluetoothDevice | null = this.state.device;
    if (device === null) {
      device = await navigator.bluetooth.requestDevice({
        // filters: [...] <- Prefer filters to save energy & show relevant devices.
        acceptAllDevices: true,
        optionalServices: [serviceUuid],
      });
    }

    if (device.gatt === undefined) {
      console.error("Bluetooth ERROR: device has not gatt");
      return;
    }

    console.log("Connecting to GATT Server...");
    const server = await device.gatt.connect();

    console.log("Getting Service...");
    const service = await server.getPrimaryService(serviceUuid);

    console.log("Getting Characteristic 0 and 1...");
    const characteristic0 = await service.getCharacteristic(
      characteristic0Uuid
    );
    const characteristic1 = await service.getCharacteristic(
      characteristic1Uuid
    );

    console.log("Initial values: ");
    console.log(await characteristic0.readValue());
    console.log(await characteristic1.readValue());

    let localInterval = setInterval(this.writeToBLE, 80) as unknown as number;

    this.setState({
      device: device,
      server: server,
      service: service,
      char0: characteristic0,
      char1: characteristic1,
      timerId: localInterval,
    });
  };

  componentWillUnmount() {
    if (this.state !== null && this.state.timerId !== null) {
      clearInterval(this.state.timerId);
    }
  }

  writeToBLE = async () => {
    if (this.state.timeout > 0)
      this.setState({ timeout: this.state.timeout - 1 });
    else {
      try {
        if (this.state.char0 !== null && this.state.char1 !== null) {
          await this.state.char0.writeValue(
            this.state.enc.encode(this.props.acceleration.toFixed(6))
          );
          await this.state.char1.writeValue(
            this.state.enc.encode(this.props.steering.toFixed(6))
          );
        }
      } catch (error) {
        if (this.state.server !== null && !this.state.server.connected) {
          clearInterval(this.state.timerId as number);
          this.connect();
        }
        console.warn(error);
        this.setState({ timeout: 3 });
      }
    }
  };

  render(): React.ReactNode {
    return (
      <div>
        <p>
          Accel: {this.props.acceleration.toFixed(4)}, Steering:{" "}
          {this.props.steering.toFixed(4)}
        </p>
        <Button onClick={this.connect}>Start Bluetooth</Button>
        <Button onClick={this.reset}>Reset Bluetooth</Button>
      </div>
    );
  }
}

export default BluetoothController;
