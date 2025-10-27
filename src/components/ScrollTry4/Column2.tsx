import React, { useEffect, useRef } from 'react';
import { useScrollControl } from './ScrollColumn/ScrollControlContext';

const Column2: React.FC = () => {
  const { registerScrollable } = useScrollControl();
  const scrollableRef = useRef<HTMLDivElement>(null);

  // Register scrollable element for direct DOM updates
  useEffect(() => {
    const unregister = registerScrollable(scrollableRef.current!);
    return unregister;
  }, [registerScrollable]);

  // Generate sample content for column 2
  const generateContent = () => {
    const items = [];
    for (let i = 1; i <= 50; i++) {
      items.push(
        <div key={i} style={{
          padding: '10px',
          borderBottom: '1px solid #eee',
          backgroundColor: i % 2 === 0 ? '#f9f9f9' : '#ffffff'
        }}>
          Column 2 - Item {i}
        </div>
      );
    }
    return items;
  };

  return (
    <>
      <style>
        {`
          .hidden-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>
      <div style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        overflow: 'hidden',
        position: 'relative',
        background: '#fff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      flex: 1,
      minWidth: '200px',
      maxWidth: '300px'
      }}>
        <div 
          ref={scrollableRef}
          className="hidden-scrollbar"
          style={{
            height: '100%',
            overflowY: 'auto',
            padding: 0,
            scrollbarWidth: 'none', // Firefox
            msOverflowStyle: 'none' // IE/Edge
          }}>
          {generateContent()}
        </div>
      </div>
    </>
  );
};

export default Column2;
