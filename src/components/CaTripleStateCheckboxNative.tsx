/**
 * CaTripleStateCheckboxNative - A controlled triple-state checkbox component
 * 
 * This component provides a checkbox with three possible states:
 * - 'checked': Shows a checkmark icon
 * - 'unchecked': Shows an empty checkbox
 * - 'indeterminate': Shows a minus sign icon
 * 
 * The component is fully controlled - you must manage the state externally
 * and update it via the onChange callback.
 * 
 * @example
 * ```tsx
 * import { useState } from 'react';
 * import CaTripleStateCheckboxNative, { CaTripleState } from './components/CaTripleStateCheckboxNative';
 * 
 * function MyComponent() {
 *   const [state, setState] = useState<CaTripleState>('unchecked');
 * 
 *   const handleChange = (checked: boolean) => {
 *     // Handle the change - checked will be true when clicking from unchecked/indeterminate to checked
 *     // You control the next state based on your business logic
 *     setState(checked ? 'checked' : 'unchecked');
 *   };
 * 
 *   return (
 *     <CaTripleStateCheckboxNative
 *       state={state}
 *       onChange={handleChange}
 *       disabled={false}
 *       className="my-custom-class"
 *       style={{ margin: '10px' }}
 *     />
 *   );
 * }
 * ```
 * 
 * @param state - The current state of the checkbox: 'checked' | 'unchecked' | 'indeterminate'
 * @param disabled - Optional. When true, the checkbox is disabled and appears with reduced opacity
 * @param onChange - Optional callback fired when the checkbox is clicked. Receives (checked: boolean, event: React.ChangeEvent<HTMLInputElement>)
 * @param className - Optional additional CSS class name(s) to apply to the container
 * @param style - Optional inline styles to apply to the container
 */

import React, { useEffect, useRef } from 'react';
import styles from './CaTripleStateCheckboxNative.module.scss';

export type CaTripleState = 'checked' | 'unchecked' | 'indeterminate';

type CaTripleStateCheckboxNativeProps = {
  state: CaTripleState;
  disabled?: boolean;
  onChange?: (checked: boolean, event: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  style?: React.CSSProperties;
};

const CaTripleStateCheckboxNative = ({
  state,
  disabled = false,
  onChange,
  className,
  style,
}: CaTripleStateCheckboxNativeProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const isChecked = state === 'checked';
  const isIndeterminate = state === 'indeterminate';

  useEffect(() => {
    if (!inputRef.current) return;
    
    inputRef.current.checked = isChecked;
    inputRef.current.indeterminate = isIndeterminate;
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
    className || '',
  ].join(' ');

  return (
    <div className={containerClassName} style={style}>
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

