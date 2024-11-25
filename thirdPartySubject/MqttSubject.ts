// import IThirdPartySubject from "./IThirdPartySubject"
// import { ISubject } from "../subject/ISubject"
// import { Sensor } from "../global/Sensor"
// import mqtt, { MqttClient, IClientOptions } from 'mqtt'

// class MqttSubject implements IThirdPartySubject {
//     private listener: ISubject;
//     private mqttClient: MqttClient;

//     constructor(_connectionString: string, _options: IClientOptions) {
//         this.connect(_connectionString, _options)
//     }

//     connect(connectionString: string, options: IClientOptions): void {
//         this.mqttClient = mqtt.connect(connectionString, options);

//         this.mqttClient.on('connect', () => {
//             console.log('connected to mqtt broker');
//             this.mqttClient.subscribe('livelocstopic');
//         })

//         this.mqttClient.on('message', (topic, message) => {
//             if(topic === 'livelocstopic') {
//                 const sensors = JSON.parse(message.toString()) as Partial<Sensor>[];
//                 for(let sensor of sensors) {
//                     if(sensor == null) continue;
//                     this.notifyListener(sensor);
//                 }
//             }
//         })

//         this.mqttClient.on('disconnect', () => {
//             console.log('disconnected from mqtt broker');
//         })
//     }

//     disconnect(): void {
//         this.mqttClient?.end();
//     }

//     notifyListener(sensor: Partial<Sensor>): void {
//         this.listener?.notifyListeners(sensor);
//     }

//     setListener(_listener: ISubject) {
//         this.listener = _listener;
//     }
// }

// export default MqttSubject