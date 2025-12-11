import React, { useEffect, useRef } from 'react';
import { Checkbox, CheckboxChangeEvent } from '@progress/kendo-react-inputs';

export type CaTripleState = 'checked' | 'unchecked' | 'halfchecked';

type CaTripleStateCheckboxProps = {
  state: CaTripleState;
  disabled?: boolean;
  onChange?: (nextState: CaTripleState, event: CheckboxChangeEvent) => void;
};

const getNextState = (current: CaTripleState): CaTripleState => {
  switch (current) {
    case 'unchecked':
      return 'checked';
    case 'checked':
      return 'halfchecked';
    case 'halfchecked':
    default:
      return 'unchecked';
  }
};

const CaTripleStateCheckbox: React.FC<CaTripleStateCheckboxProps> = ({
  state,
  disabled = false,
  onChange,
}) => {
  const checkboxRef = useRef<import('@progress/kendo-react-inputs').CheckboxHandle | null>(null);

  useEffect(() => {
    const inputEl = checkboxRef.current?.element;
    if (inputEl) {
      inputEl.indeterminate = state === 'halfchecked';
    }
  }, [state]);

  const handleChange = (event: CheckboxChangeEvent) => {
    const nextState = getNextState(state);
    onChange?.(nextState, event);
  };

  return (
    <Checkbox
      ref={checkboxRef}
      checked={state === 'checked'}
      disabled={disabled}
      onChange={handleChange}
      // aria-label={`ca triple state checkbox (${state}${disabled ? ', disabled' : ''})`}
    />
  );
};

export default CaTripleStateCheckbox;

