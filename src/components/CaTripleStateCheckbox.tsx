import React from 'react';
import { Checkbox, CheckboxChangeEvent, CheckboxProps } from '@progress/kendo-react-inputs';

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
  const handleChange = (event: CheckboxChangeEvent) => {
    const checked = Boolean(event.value);
    onChange?.(checked, event);
  };

  // A tipagem de CheckboxProps não expõe "indeterminate", mas o componente aceita a prop.
  const checkboxProps: CheckboxProps & { indeterminate?: boolean } = {
    checked: state === 'checked',
    indeterminate: state === 'halfchecked',
    disabled,
    onChange: handleChange,
    'aria-label': `ca triple state checkbox (${state}${disabled ? ', disabled' : ''})`,
  };

  return (
    <Checkbox {...checkboxProps} />
  );
};

export default CaTripleStateCheckbox;

