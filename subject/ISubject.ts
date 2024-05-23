import { Sensor } from "../global/Sensor";
import type {IListener} from "../listener/IListener";

interface ISubject {
  addListener(listener: IListener): void;
  removeListener(listener: IListener): void;
  notifyListeners(sensor: Partial<Sensor>): void;
}

export { type ISubject};
