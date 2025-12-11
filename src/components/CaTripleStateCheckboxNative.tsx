import React, { useEffect, useRef } from 'react';
import styles from './CaTripleStateCheckboxNative.module.scss';

export type CaTripleState = 'checked' | 'unchecked' | 'indeterminate';

type CaTripleStateCheckboxNativeProps = {
  state: CaTripleState;
  disabled?: boolean;
  onChange?: (checked: boolean, event: React.ChangeEvent<HTMLInputElement>) => void;
};

const CaTripleStateCheckboxNative = ({
  state,
  disabled = false,
  onChange,
}: CaTripleStateCheckboxNativeProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const isChecked = state === 'checked';
  const isIndeterminate = state === 'indeterminate';

  useEffect(() => {
    if (!inputRef.current) return;
    
    inputRef.current.checked = isChecked;
    inputRef.current.indeterminate = isIndeterminate;
    inputRef.current.style.setProperty('background-color', '#ffffff', 'important');
    inputRef.current.style.setProperty('background', '#ffffff', 'important');
  }, [isChecked, isIndeterminate]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    onChange?.(checked, event);
  };

  const checkboxClassName = [
    styles.checkbox,
    isChecked ? styles.checked : '',
    isIndeterminate ? styles.indeterminate : '',
  ].join(' ');

  const containerClassName = [
    styles.caCheckboxTripleStateContainer,
    disabled ? styles.disabled : '',
  ].join(' ');

  return (
    <div className={containerClassName}>
      <input
        ref={inputRef}
        type="checkbox"
        className={checkboxClassName}
        disabled={disabled}
        onChange={handleChange}
      />
      {isChecked && (
        <div className={`${styles.iconOverlay} ${styles.checkmark}`} />
      )}
      {isIndeterminate && (
        <div className={`${styles.iconOverlay} ${styles.indeterminate}`} />
      )}
    </div>
  );
};

export default CaTripleStateCheckboxNative;

