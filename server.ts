import dotenv from 'dotenv'
dotenv.config()
import http from "http";
import { Server } from "socket.io";
import Subject from "./subject/Subject";
// import MqttSubject from './thirdPartySubject/MqttSubject';
import Listener from "./listener/Listener";
import type {IListener} from "./listener/IListener";
import allowedAttrs from "./global/attrs";
// import {
//   isAuthenticatedConsumer,
// } from "./middleware/auth";

const port = process.env.PORT || 2000;
const app = http.createServer();
const io = new Server(app, { cors: { origin: "*" } });

const consumerNamespace = io.of("/consumer");
const producerNamespace = io.of("/producer");

const subject = Subject.getSubject();
subject.setSocket(io);
// const mqttSubject = new MqttSubject(process.env.THIRDPARTY_HOST, { protocol: 'mqtt', port: Number(process.env.THIRDPARTY_PORT), username: process.env.THIRDPARTY_USER, password: process.env.THIRDPARTY_PASS });
// mqttSubject.setListener(subject);

// consumerNamespace.use((socket, next) => {
//   if (!isAuthenticatedConsumer(socket.handshake.auth.token)) return;
//   next();
// });

consumerNamespace.on("connection", (socket) => {
  console.log("consumer connected", socket.id);

  const listener: IListener = new Listener(socket.id, subject);
  subject.addListener(listener);

  socket.on("track", ({ serial, attrs }) => {
    if (serial == undefined || typeof serial != "string" || serial.length == 0) return;
    if (attrs == undefined) { subject.addSerialToListener(serial, listener, Array.from(allowedAttrs.keys())); return}
    if (!Array.isArray(attrs) || attrs.length == 0) return;
    for (let attr of attrs) {
      if (!allowedAttrs.has(attr)) return;
    }
    subject.addSerialToListener(serial, listener, attrs);
  });

  socket.on("stopTracking", (serial: string) => {
    subject.removeSerialFromListener(serial, listener);
  });

  socket.on("disconnect", (socket) => {
    subject.removeListener(listener);
  });
});

producerNamespace.on('connection', (socket) => {
  console.log('producer connected', socket.id)
  socket.on('device_update', (packet) => {
    console.log('🚀 ~ socket.on ~ paacket:', packet)
    subject.notifyListeners(packet)
  })
})

app.on('request', (request, res) => {
  if (request.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    return res.end('OK');
  }
})
app.listen(port, () => console.log("server started", port));
