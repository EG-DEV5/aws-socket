import type {IListener} from "../listener/IListener";
import type {ISubject} from "./ISubject";
import { Server } from "socket.io";
import type {Sensor} from "../global/Sensor";

class Subject implements ISubject {
  socket: Server = new Server();
  private static subject: Subject;
  private listenersMapper: Map<IListener, Set<string>> = new Map();
  private stateMapper: Map<string, Map<IListener, string[]>> = new Map();

  private constructor() {
  }

  static getSubject(): Subject {
    if (this.subject == null) this.subject = new Subject();
    return this.subject;
  }

  setSocket(_socket: Server): void {
    this.socket = _socket;
  }

  notifyListeners(sensor: Partial<Sensor>): void {
    const listenersToAttrs = this.stateMapper.get(sensor.SerialNumber) as Map<IListener,string[]>;
    if (!listenersToAttrs) return;
    for (let listener of listenersToAttrs.keys()) {
      const attributes = listenersToAttrs.get(listener) as string[];
      let attrsToSend: Partial<Sensor> = new Object();
      for (let attr of attributes) attrsToSend[attr] = sensor[attr];
      listener.update(attrsToSend);
    }
  }

  addListener(listener: IListener): void {
    this.listenersMapper.set(listener, new Set<string>());
  }

  removeListener(listener: IListener): void {
    const listenerSerials = this.listenersMapper.get(listener);
    this.listenersMapper.delete(listener);
    if (listenerSerials.size == 0) return;

    for (let serial of listenerSerials.keys()) {
      this.stateMapper.get(serial)?.delete(listener);
      if (this.stateMapper.get(serial)?.size == 0) this.UnRegister(serial);
    }
  }

  register(serial: string): void {
    if (!this.stateMapper.has(serial)) {
      this.stateMapper.set(serial, new Map());
    }
  }

  UnRegister(serial: string): void {
    this.stateMapper.delete(serial);
  }

  addSerialToListener(serial: string, listener: IListener, attrs: string[]): void {
    this.register(serial);
    attrs = Array.from(new Set(attrs));
    if (attrs.length == 0) return;

    this.stateMapper.get(serial)?.set(listener, attrs);
    const listenerSerials = this.listenersMapper.get(listener);
    if (!listenerSerials.has(serial)) this.listenersMapper.get(listener).add(serial);
  }

  removeSerialFromListener(serial: string, listener: IListener): void {
    this.listenersMapper.get(listener)?.delete(serial);
    const listenersMaps = this.stateMapper.get(serial);
    listenersMaps?.delete(listener);
    if (listenersMaps?.size == 0) this.UnRegister(serial);
  }
}

export default Subject;