import React from 'react';
import { Checkbox, CheckboxChangeEvent } from '@progress/kendo-react-inputs';

// API exposta: estados "checked", "unchecked" e "halfchecked".
export type CaTripleState = 'checked' | 'unchecked' | 'halfchecked';

type CaTripleStateCheckboxProps = {
  state: CaTripleState;
  disabled?: boolean;
  onChange?: (checked: boolean, event: CheckboxChangeEvent) => void;
};

const CaTripleStateCheckbox: React.FC<CaTripleStateCheckboxProps> = ({
  state,
  disabled = false,
  onChange,
}) => {
  const getValue = () => {
    switch (state) {
      case 'checked':
        return true;
      case 'halfchecked':
        return null;
      case 'unchecked':
      default:
        return false;
    }
  };

  const handleChange = (event: CheckboxChangeEvent) => {
    const checked = !!(event.value);
    onChange?.(checked, event);
  };

  return (
    <Checkbox
      value={getValue()}
      disabled={disabled}
      onChange={handleChange}
      aria-label={`ca triple state checkbox (${state}${disabled ? ', disabled' : ''})`}
    />
  );
};

export default CaTripleStateCheckbox;

