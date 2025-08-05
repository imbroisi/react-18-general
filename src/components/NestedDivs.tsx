// import React from 'react';
import './NestedDivs.css';

interface NestedDivsProps {
  leftMargin: number;
  text: string;
}

const NestedDivs: React.FC<NestedDivsProps> = ({ leftMargin, text }) => {
  return (
    <div className="outer-container">
      <div 
        className="middle-container"
        style={{ marginLeft: `${leftMargin}px` }}
      >
        <div className="inner-container">
          <div className="text-container">
            {text}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NestedDivs; 