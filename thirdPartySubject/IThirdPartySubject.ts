import { Sensor } from "../global/Sensor"
interface IThirdPartySubject {
    connect(connectionString: string, options: any): void;
    disconnect(): void;
    notifyListener(sensor: Sensor): void;
}

export default IThirdPartySubject