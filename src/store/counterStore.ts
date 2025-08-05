import { makeAutoObservable } from 'mobx';

class CounterStore {
  counter: number = 12;
  name: string = '';
  list: string[] = [];
  
  private color: string = 'red';

  constructor() {
    makeAutoObservable(this);
  }

  setCounter(value: number) {
    this.counter = value;
  }

  setName(value: string) {
    this.name = value;
  }

  setList(value: string[]) {
    this.list = value;
  }

  setColor(value: string) {
    this.color = value;
  }

  getColor() {
    return this.color;
  }
}

const counterStore = new CounterStore();
export default counterStore; 