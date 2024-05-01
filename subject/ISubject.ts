import IListener from "../listener/IListener";

interface ISubject {
  addListener(listener: IListener): void;
  removeListener(listener: IListener): void;
}

export default ISubject;
