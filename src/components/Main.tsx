import React from 'react';
import { CounterProvider } from '../context/CounterContext';
import Child from './Child';
// import Parent from './Parent';

const Parent = (props: any) => {
  return (
    <div style={{ padding: '20px', border: '2px solid blue', margin: '10px' }}>
      <h2>Parent Component</h2>

      <Child>
        <p>Some Child component content IF NEEDED (OPTIONAL)</p>
      </Child>

      <div>
        <p>props.value = {props.value}</p>
      </div>

    </div>
  );
};

const Main = (props: any) => {
  return (
      <CounterProvider>
        <Parent {...props}/>
      </CounterProvider>
  );
};

export default Main; 
