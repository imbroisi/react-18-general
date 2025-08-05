import React from 'react';
import { useCounter } from '../../context/CounterContext';

/**
 *   MOCKED Child Component
 */

const Child = ({ children }: any) => {
  const { count, increment, decrement } = useCounter();

  return (
    <div style={{ padding: '20px', border: '2px solid green', margin: '10px' }}>
      [MOCKED]
      <h3>[MOCKED] Child</h3>
      <div>[MOCKED] Current count: <p data-testid="childCountId">[MOCKED] {count}</p></div>
        <button data-testid="abc" onClick={increment}>[MOCKED] Increment</button>
      <button onClick={decrement}>[MOCKED] Decrement</button>
      
      [MOCKED] {children}

    </div>
  );
};

export default Child; 

