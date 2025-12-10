import React from 'react';
import styles from './PlusMinus.module.css';

type PlusMinusProps = {
  sign: 'plus' | 'minus';
};

const PlusMinus: React.FC<PlusMinusProps> = ({ sign }) => {
  const rows = [0, 1];
  const cols = [0, 1];

  return (
    <table className={styles.plusMinusTable} role="presentation">
      <tbody>
        {rows.map((row) => (
          <tr key={row}>
            {cols.map((col) => {
              const cellClasses = [styles.cell];

              if (row === 0) {
                cellClasses.push(styles.topRowCell);
              }

              if (sign === 'plus' && col === 1) {
                cellClasses.push(styles.rightColumnCell);
              }

              return (
                <td
                  key={`${row}-${col}`}
                  className={cellClasses.join(' ')}
                  aria-hidden="true"
                />
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default PlusMinus;

