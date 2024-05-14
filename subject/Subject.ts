import type {IListener} from "../listener/IListener";
import type {ISubject} from "./ISubject";
import { Server } from "socket.io";
import type {Sensor} from "../global/Sensor";
import { initializeApp } from "firebase/app";
import { getDatabase, onValue, ref, off } from "firebase/database";
import axios from "axios";

class Subject implements ISubject {
  socket: Server = new Server();
  private static subject: Subject;
  private listenersMapper: Map<IListener, Set<string>> = new Map();
  private stateMapper: Map<string, Map<IListener, string[]>> = new Map();

  private constructor() {
    // setInterval(() => {
    //   if (this.stateMapper.size == 0) return;
    //   try {
    //     const allSerials = Array.from(this.stateMapper.keys());
    //     for (let i = 0; i < 10; i++) {
    //       let start = Math.floor((i * 10 * allSerials.length) / 100)
    //       let end = Math.ceil(((i + 1) * 10 * allSerials.length) / 100)
    //       let segment = allSerials.slice(start, end)
    //       axios.post("http://api.saferoad.net:1002/last_fms/location",{ keys: segment, lite: 0 }, {headers: {Authorization:process.env.redis_token}})
    //       .then(({ data: { data } }) => {
    //         for (let sensor of data) this.setState(sensor)
    //       })
    //       .catch((err) => {
    //         console.log(err)
    //       })
    //       if (end >= allSerials.length) break
    //     }
    //   } catch (err) {
    //     console.log(err)
    //   }
    // }, 1000);
  }

  static getSubject(): Subject {
    if (this.subject == null) this.subject = new Subject();
    return this.subject;
  }

  setSocket(_socket: Server): void {
    this.socket = _socket;
  }

  setState(sensor: Partial<Sensor>): void {
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
      // start listening to firebase
      const app = initializeApp({ databaseURL: 'https://saferoad-srialfb.firebaseio.com' }, 'updatefb')
      const db = getDatabase(app)
      onValue(ref(db, serial), (snapshot) => {
          if (!snapshot.hasChildren()) return
          const value = snapshot.val() as Sensor
          this.setState(value)
      })
    }
  }

  UnRegister(serial: string): void {
    this.stateMapper.delete(serial);
    // stop listening to firebase
    const app = initializeApp({ databaseURL: 'https://saferoad-srialfb.firebaseio.com' }, 'updatefb')
    const db = getDatabase(app)
    off(ref(db, serial))
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