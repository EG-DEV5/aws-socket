import type {Sensor} from "../global/Sensor";

interface IListener {
  update(sensor: Partial<Sensor>): void;
}

export  { type IListener};
