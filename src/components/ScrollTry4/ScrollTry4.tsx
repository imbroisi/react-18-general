import React from 'react';
import Column1 from './Column1';
import Column2 from './Column2';
// import Column3 from './Column3';
import Column4 from './Column4';
import { ScrollControlProvider, useScrollControl } from './ScrollColumn/ScrollControlContext';
import ScrollColumn from './ScrollColumn';

export interface ScrollTry4Props {
  // No props needed for this isolated component
}

const Button: React.FC = () => {
  const { resetScrollbar } = useScrollControl();
  return (
    <button onClick={resetScrollbar}>
      Reset
    </button>
  );
};

const ScrollTry4: React.FC<ScrollTry4Props> = () => {
  return (
    <div style={{
      display: 'flex',
      // gap: '20px',
      width: '100%',
      height: '100vh',
      // padding: '20px',
      boxSizing: 'border-box',
      overflowX: 'auto',
      minWidth: 'fit-content'
    }}>
      <ScrollControlProvider>
        <div style={{ display: 'flex', margin: '20px 0',  position: 'relative', border: '1px solid blue' }}>
          <Button />

          <Column1 />
          <Column2 />
          <ScrollColumn />
          
        </div>
      </ScrollControlProvider>
      {/* <Column4 /> */}
    </div>
  );
};

export default ScrollTry4;
