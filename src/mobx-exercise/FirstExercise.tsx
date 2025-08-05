import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import counterStore from '../store/counterStore';

const CounterComponent: React.FC = observer(() => {
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('');
  const [newListItem, setNewListItem] = useState('');

  const handleAddToList = () => {
    counterStore.setList([...counterStore.list, newListItem]);
    setNewListItem('');
  };

  return (
    <div>
      <h1>Mobx Counter: {counterStore.counter}</h1>
      <button onClick={() => counterStore.setCounter(counterStore.counter + 1)}>Increment</button>
      <button onClick={() => counterStore.setCounter(counterStore.counter - 1)}>Decrement</button>

      <h2>Name: {counterStore.name}</h2>
      <input
        type="text"
        value={newName}
        onChange={(e) => setNewName(e.target.value)}
        placeholder="Set new name"
      />
      <button onClick={() => counterStore.setName(newName)}>Set Name</button>

      <h2>List:</h2>
      <ul>
        {counterStore.list.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
      <input
        type="text"
        value={newListItem}
        onChange={(e) => setNewListItem(e.target.value)}
        placeholder="Add to list"
      />
      <button onClick={handleAddToList}>Add to List</button>

      <h2>Color: {counterStore.getColor()}</h2>
      <input
        type="text"
        value={newColor}
        onChange={(e) => setNewColor(e.target.value)}
        placeholder="Set new color"
      />
      <button onClick={() => counterStore.setColor(newColor)}>Set Color</button>
    </div>
  );
});

export default CounterComponent;