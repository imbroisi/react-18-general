import React, { useState } from 'react';
import './App.css';
import CaTripleStateCheckbox, { CaTripleState } from './components/CaTripleStateCheckbox';

const App = () => {
  const [state, setState] = useState<CaTripleState>('unchecked');

  return (
    <div className="app-container">
      <CaTripleStateCheckbox state={state} onChange={setState} />
    </div>
  );
};

export default App;