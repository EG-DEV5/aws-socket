import dotenv from 'dotenv'
dotenv.config()
import http from "http";
import { Server } from "socket.io";
import Subject from "./subject/Subject";
import Listener from "./listener/Listener";
import type {IListener} from "./listener/IListener";
import allowedAttrs from "./global/attrs";
import type  {Sensor} from "./global/Sensor";
import {
  isAuthenticatedConsumer,
  isAuthenticatedPublisher,
} from "./middleware/auth";

const port = process.env.PORT || 2000;
const app = http.createServer();
const io = new Server(app, { cors: { origin: "*" } });

const publisherNamespace = io.of("/publisher");
const consumerNamespace = io.of("/consumer");

const subject = Subject.getSubject();
subject.setSocket(io);

// consumerNamespace.use((socket, next) => {
//   if (!isAuthenticatedConsumer(socket.handshake.auth.token)) return;
//   console.log('🚀 ~ consumerNamespace.use ~ isAuthenticatedConsumer', isAuthenticatedConsumer(socket.handshake.auth.token))
//   next();
// });

// publisherNamespace.use((socket, next) => {
//   if (!isAuthenticatedPublisher(socket.handshake.auth.token)) return;
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

publisherNamespace.on("connection", (socket) => {
  console.log("publisher connected", socket.id);

  socket.on("publish", (data: Partial<Sensor>[]) => {
    for (let sensor of data) subject.setState(sensor);
  });
});

app.listen(port, () => console.log("server started"));
