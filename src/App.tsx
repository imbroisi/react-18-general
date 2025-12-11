import React, { useState } from 'react';
import './App.css';
import CaTripleStateCheckbox, { CaTripleState } from './components/CaTripleStateCheckbox';
import CaTripleStateCheckboxMUI from './components/CaTripleStateCheckboxMUI';
import CaTripleStateCheckboxNative, { CaTripleState as CaTripleStateNative } from './components/CaTripleStateCheckboxNative';

const App = () => {
  const [state, setState] = useState<CaTripleState>('unchecked');
  const [stateMUI, setStateMUI] = useState<CaTripleState>('unchecked');
  const [stateNative, setStateNative] = useState<CaTripleStateNative>('unchecked');
  const [disabledNative, setDisabledNative] = useState(false);

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

  const handleChangeMUI = (checked: boolean) => {
    setStateMUI((prev) => {
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
  };

  const handleChangeNative = (checked: boolean) => {
    setStateNative((prev) => {
      switch (prev) {
        case 'unchecked':
          return 'checked';
        case 'checked':
          return 'indeterminate';
        case 'indeterminate':
        default:
          return 'unchecked';
      }
    });
  };

  console.log(state);

  return (
    <div className="app-container">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', alignItems: 'center' }}>
        {/* Kendo Checkbox */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
          <h3>Kendo Checkbox</h3>
          <CaTripleStateCheckbox state={state} onChange={handleChange} />
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setState('checked')}>Checked</button>
            <button onClick={() => setState('unchecked')}>Unchecked</button>
            <button onClick={() => setState('halfchecked')}>HalfChecked</button>
          </div>
        </div>

        {/* MUI Checkbox */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
          <h3>MUI Checkbox (cor customizada: vermelho)</h3>
          <CaTripleStateCheckboxMUI 
            state={stateMUI} 
            onChange={handleChangeMUI}
            indeterminateColor="red"
          />
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setStateMUI('checked')}>Checked</button>
            <button onClick={() => setStateMUI('unchecked')}>Unchecked</button>
            <button onClick={() => setStateMUI('halfchecked')}>HalfChecked</button>
          </div>
        </div>

        {/* Native Checkbox */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
          <h3>Native Checkbox</h3>
          <CaTripleStateCheckboxNative 
            state={stateNative} 
            disabled={disabledNative}
            onChange={handleChangeNative}
          />
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setStateNative('checked')}>Checked</button>
            <button onClick={() => setStateNative('unchecked')}>Unchecked</button>
            <button onClick={() => setStateNative('indeterminate')}>Indeterminate</button>
            <button onClick={() => setDisabledNative(!disabledNative)}>Disable</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;