import React, { useState, useEffect } from 'react';
import './ProgressBar.css';

interface ProgressBarProps {
  value?: number;
  max?: number;
  showValue?: boolean;
  color?: string;
  height?: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value = 0,
  max = 100,
  showValue = true,
  color = '#1976d2',
  height = 8,
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Ensure value is between 0 and max
    const clampedValue = Math.min(Math.max(value, 0), max);
    setProgress((clampedValue / max) * 100);
  }, [value, max]);

  return (
    <div className="progress-bar-container">
      <div 
        className="progress-bar"
        style={{
          height: `${height}px`,
          backgroundColor: '#e0e0e0',
          borderRadius: `${height / 2}px`,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          className="progress-bar-fill"
          style={{
            width: `${progress}%`,
            height: '100%',
            backgroundColor: color,
            transition: 'width 0.3s ease-in-out',
          }}
        />
      </div>
      {showValue && (
        <span className="progress-bar-value" style={{ color }}>
          {Math.round(progress)}%
        </span>
      )}
    </div>
  );
};

export default ProgressBar; 