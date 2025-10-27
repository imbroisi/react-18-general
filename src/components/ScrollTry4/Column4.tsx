import React from 'react';

const Column4: React.FC = () => {
  // Generate sample content for column 4
  const generateContent = () => {
    const items = [];
    for (let i = 1; i <= 50; i++) {
      items.push(
        <div key={i} style={{
          padding: '10px',
          borderBottom: '1px solid #eee',
          backgroundColor: i % 2 === 0 ? '#f9f9f9' : '#ffffff'
        }}>
          Column 4 - Item {i}
        </div>
      );
    }
    return items;
  };

  return (
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
      <div style={{
        height: '100%',
        overflowY: 'auto',
        padding: 0
      }}>
        {generateContent()}
      </div>
    </div>
  );
};

export default Column4;
