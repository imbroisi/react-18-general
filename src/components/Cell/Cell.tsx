import { memo } from 'react';
import './Cell.css';

export interface CellProps {
  key: number;
  showMe: boolean;
  label: string;
}

const Cell = memo(({ key, showMe, label }: CellProps) => {
  // const Cell = ({ key, showMe, label }: CellProps) => {

  console.log('===>> RENDERING CELL');

  return (
    <div
      key={key}
      className="table-cell"
      style={{
        height: showMe ? '40px' : '0'
      }}>
        <div style={{
          height: '18px',
          // overflow: 'hidden',
          // transition: 'height 0.2s ease-in-out',
        }}>
          {/* {label} */}
        </div>
      {/* {label} */}

      <div style={{
        height: showMe ? '90px' : '0',
        overflow: 'hidden',
        transition: 'height 0.2s ease-in-out',
        fontWeight: 'normal',
        lineHeight: '1.3',
        paddingLeft: '10px',
        paddingTop: '4px',
      }}>
        XXXX
        <br />
        bbbb
        <br />
        cccc
        <br />
        dddd
        <br />
      </div>

    </div>
  );
});
// };

export default Cell;
