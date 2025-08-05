import React from 'react';
import { useCounter } from '../context/CounterContext';
// import GrandChild from './GrandChild';

const Child = ({ children }: any) => {
  const { count, increment, decrement } = useCounter();

  return (
    <div style={{ padding: '20px', border: '2px solid green', margin: '10px' }}>
      <h3>Child Component</h3>
      <p>Current count: {count}</p>
      <button onClick={increment}>Increment</button>
      <button onClick={decrement}>Decrement</button>
      {children}
    </div>
  );
};

export default Child; 

