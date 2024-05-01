import IListener from "./IListener";
import Subject from "../subject/Subject";
import Sensor from "../global/Sensor";

class Listener implements IListener {
  subject: Subject;
  sessionId: string;

  constructor(_sessionId: string, _subject: Subject) {
    this.sessionId = _sessionId;
    this.subject = _subject;
  }

  update(sensor: Partial<Sensor>): void {
    this.subject.socket.of("/consumer").to(this.sessionId).emit("update", sensor);
  }
}

export default Listener;
