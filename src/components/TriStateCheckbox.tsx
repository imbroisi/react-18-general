import React from 'react';
import styles from './TriStateCheckbox.module.css';

type TriState = 'empty' | 'checked' | 'plus';

type TriStateCheckboxProps = {
  state?: TriState;
  disabled?: boolean;
};

const TriStateCheckbox: React.FC<TriStateCheckboxProps> = ({ state = 'empty', disabled }) => {
  const isChecked = state === 'checked' || state === 'plus';
  const isPlus = state === 'plus';

  return (
    <label
      className={`${styles.checkboxContainer} ${isPlus ? styles.showPlus : ''}`}
      aria-label={`tri-state checkbox (${state})`}
    >
      <input
        className={styles.checkboxInput}
        type="checkbox"
        defaultChecked={isChecked}
        disabled={disabled}
      />
      <span className={styles.plusIndicator} aria-hidden />
    </label>
  );
};

export default TriStateCheckbox;





