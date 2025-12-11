import React, { useState } from 'react';
import './App.css';
import CaTripleStateCheckbox, { CaTripleState } from './components/CaTripleStateCheckbox';

const App = () => {
  const [state, setState] = useState<CaTripleState>('unchecked');

  const handleChange = (checked: boolean) => {
    // Exemplo: mantém o ciclo manual ignorando o boolean retornado.
    setState((prev) => {
      switch (prev) {
        case 'unchecked':
          return 'checked';
        case 'checked':
          return 'halfchecked';
        case 'halfchecked':
        default:
          return 'unchecked';
      }
    });

    // Caso queira, pode usar "checked" para decidir o próximo estado, por exemplo:
    // setState(checked ? 'checked' : 'unchecked');
  };

  return (
    <div className="app-container">
      <CaTripleStateCheckbox state={state} onChange={handleChange} />
    </div>
  );
};

export default App;