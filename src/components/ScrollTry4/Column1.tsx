import React, { useEffect, useRef } from 'react';
import { useScrollControl } from './ScrollColumn/ScrollControlContext';
import './Column1.css';

const Column1: React.FC = () => {
  const { registerScrollable } = useScrollControl();
  const scrollableRef = useRef<HTMLDivElement>(null);

  // Register scrollable element for direct DOM updates to avoid delays in synchronization
  useEffect(() => {
    const unregister = registerScrollable(scrollableRef.current!);
    return unregister;
  }, [registerScrollable]);

  // Generate sample content for column 1
  const generateContent = () => {
    const items = [];
    for (let i = 1; i <= 50; i++) {
      items.push(
        <div key={i} className={`column1-item ${i % 2 === 0 ? 'even' : 'odd'}`}>
          Column 1 - Item {i}
        </div>
      );
    }
    return items;
  };

  return (
    <div className="column1-container">
      <div
        ref={scrollableRef}
        className="column1-scroll"
      >
        {generateContent()}
      </div>
    </div>
  );
};

export default Column1;
