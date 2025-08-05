import counterStore from './counterStore';

describe('CounterStore', () => {
  it('should initialize with default values', () => {
    expect(counterStore.counter).toBe(12);
    expect(counterStore.name).toBe('');
    expect(counterStore.list).toEqual([]);
    expect(counterStore.getColor()).toBe('red');
  });

  it('should set counter value', () => {
    counterStore.setCounter(10);
    expect(counterStore.counter).toBe(10);
  });

  it('should set name value', () => {
    counterStore.setName('Test Name');
    expect(counterStore.name).toBe('Test Name');
  });

  it('should set list value', () => {
    const testList = ['item1', 'item2'];
    counterStore.setList(testList);
    expect(counterStore.list).toEqual(testList);
  });

  it('should set and get color value', () => {
    counterStore.setColor('blue');
    expect(counterStore.getColor()).toBe('blue');
  });
});
