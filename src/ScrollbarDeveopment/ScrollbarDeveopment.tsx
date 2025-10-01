import React, { useRef, useState } from 'react';
import './ScrollbarDeveopment.css';
import { useScrollManager } from '../hooks/useScrollManager';

export interface ScrollbarDeveopmentProps {

}

const ScrollbarDeveopment = (props: ScrollbarDeveopmentProps) => {
  // Left div refs (fixed 200px width)
  const leftContainerRef = useRef<HTMLDivElement>(null);
  const leftContentRef = useRef<HTMLDivElement>(null);
  
  // Right div refs (variable width)
  const rightContainerRef = useRef<HTMLDivElement>(null);
  const rightContentRef = useRef<HTMLDivElement>(null);
  
  // Synchronized scroll state
  const [syncScrollTop, setSyncScrollTop] = useState(0);
  const [syncScrollLeft, setSyncScrollLeft] = useState(0);
  
  // Smooth scroll to top function
  const scrollToTop = () => {
    setSyncScrollTop(0);
    setSyncScrollLeft(0);
  };
    
  // Left div handlers - will sync to right div
  const handleLeftVThumbMove = (position: { scrollTop: number; scrollPercentage: number }) => {
    console.log('📍 Left V Scroll:', position);
    setSyncScrollTop(position.scrollTop);
  };

  const handleLeftHThumbMove = (position: { scrollLeft: number; scrollPercentage: number }) => {
    console.log('📍 Left H Scroll:', position);
    setSyncScrollLeft(position.scrollLeft);
  };

  // Right div handlers - will sync to left div
  const handleRightVThumbMove = (position: { scrollTop: number; scrollPercentage: number }) => {
    console.log('📍 Right V Scroll:', position);
    setSyncScrollTop(position.scrollTop);
  };

  const handleRightHThumbMove = (position: { scrollLeft: number; scrollPercentage: number }) => {
    console.log('📍 Right H Scroll:', position);
    setSyncScrollLeft(position.scrollLeft);
  };

  // Left ScrollManager (fixed 200px width)
  const leftScrollManager = useScrollManager(leftContainerRef, leftContentRef, {
    onVThumbMove: handleLeftVThumbMove,
    onHThumbMove: handleLeftHThumbMove,
    mode: 'normal',
    scrollToVertical: syncScrollTop,
    scrollToHorizontal: syncScrollLeft
  });

  // Right ScrollManager (variable width)
  const rightScrollManager = useScrollManager(rightContainerRef, rightContentRef, {
    onVThumbMove: handleRightVThumbMove,
    onHThumbMove: handleRightHThumbMove,
    mode: 'normal',
    scrollToVertical: syncScrollTop,
    scrollToHorizontal: syncScrollLeft
  });

  return (
    <div style={{
      padding: '50px',
      width: '100vw',
      height: '100vh',
      backgroundColor: '#f5f5f5',
      boxSizing: 'border-box'
    }}>
      <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>
        🔄 Synchronized Scrolling Experiment
      </h2>
      <p style={{ textAlign: 'center', marginBottom: '20px', color: '#666' }}>
        <strong>Scroll either div vertically - both will sync in real-time!</strong>
      </p>
      
      {/* Scroll to Top Button */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <button
          onClick={scrollToTop}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: 'bold',
            color: 'white',
            background: 'linear-gradient(135deg, #3498db, #2980b9)',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            transition: 'all 0.2s ease',
            transform: 'translateY(0)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
          }}
        >
          🔝 Scroll Both to Top
        </button>
      </div>
      
      {/* Container for both scrollable divs */}
      <div style={{
        display: 'flex',
        gap: '50px',
        width: '100%',
        height: 'calc(100vh - 200px)'
      }}>
        
        {/* LEFT DIV - Fixed 200px width */}
        <div 
          ref={leftContainerRef}
          style={{
            ...leftScrollManager.containerStyles,
            width: '200px',
            height: '100%',
            border: '2px solid #3498db',
            backgroundColor: '#ecf0f1',
            borderRadius: '8px'
          }}
        >
          <div style={leftScrollManager.viewportStyles}>
            <div 
              ref={leftContentRef}
              style={{
                ...leftScrollManager.contentStyles,
                width: '300px', // Wider than container to trigger horizontal scroll
                background: 'linear-gradient(135deg, #3498db, #2980b9, #1abc9c)',
                padding: '20px',
                fontSize: '14px',
                color: 'white',
                borderRadius: '6px'
              }}
            >
              <h3>📍 Left Panel (200px)</h3>
              <p><strong>Fixed width scrollable area</strong></p>
              
              <div style={{ marginTop: '30px' }}>
                <h4>🎯 Features:</h4>
                <ul>
                  <li>Fixed 200px width</li>
                  <li>Variable height content</li>
                  <li>Horizontal overflow (300px content)</li>
                  <li>Syncs with right panel</li>
                </ul>
              </div>
              
              <div style={{ marginTop: '30px', padding: '20px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
                <h4>📊 Synchronized Scroll Status:</h4>
                <p><strong>Vertical Position:</strong> {syncScrollTop}px</p>
                <p><strong>Horizontal Position:</strong> {syncScrollLeft}px</p>
                <p><strong>🔄 This updates in real-time when either panel scrolls!</strong></p>
              </div>
              
              {/* Generate more content for scrolling */}
              {Array.from({ length: 15 }, (_, i) => (
                <div key={i} style={{ 
                  marginTop: '20px', 
                  padding: '12px', 
                  backgroundColor: 'rgba(255,255,255,0.1)', 
                  borderRadius: '4px' 
                }}>
                  <h5>Left Section {i + 1}</h5>
                  <p>This is the left panel content section {i + 1}. This panel has fixed width and syncs perfectly with the right panel. Try scrolling either panel and watch them move together!</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Render left scrollbars */}
          {leftScrollManager.verticalScrollbar}
          {leftScrollManager.horizontalScrollbar}
          {leftScrollManager.corner}
        </div>
        
        {/* RIGHT DIV - Variable width */}
        <div 
          ref={rightContainerRef}
          style={{
            ...rightScrollManager.containerStyles,
            width: 'calc(100% - 300px)', // Variable width (remaining space)
            height: '100%',
            border: '2px solid #e74c3c',
            backgroundColor: '#fdf2f2',
            borderRadius: '8px'
          }}
        >
          <div style={rightScrollManager.viewportStyles}>
            <div 
              ref={rightContentRef}
              style={{
                ...rightScrollManager.contentStyles,
                width: 'calc(100vw - 200px)', // Wider than container to trigger horizontal scroll
                background: 'linear-gradient(135deg, #e74c3c, #c0392b, #e67e22)',
                padding: '20px',
                fontSize: '14px', // Match left panel font size
                color: 'white',
                borderRadius: '6px'
              }}
            >
              <h3>📍 Right Panel (Variable Width)</h3>
              <p><strong>Responsive width scrollable area</strong></p>
              
              <div style={{ marginTop: '30px' }}>
                <h4>🎯 Features:</h4>
                <ul>
                  <li>Variable width (responsive)</li>
                  <li>Same height as left panel</li>
                  <li>Horizontal overflow (wider content)</li>
                  <li>Syncs with left panel</li>
                </ul>
              </div>
              
              <div style={{ marginTop: '30px', padding: '20px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
                <h4>📊 Synchronized Scroll Status:</h4>
                <p><strong>Vertical Position:</strong> {syncScrollTop}px</p>
                <p><strong>Horizontal Position:</strong> {syncScrollLeft}px</p>
                <p><strong>🔄 This updates in real-time when either panel scrolls!</strong></p>
              </div>
              
              {/* Generate more content for scrolling */}
              {Array.from({ length: 15 }, (_, i) => (
                <div key={i} style={{ 
                  marginTop: '20px', 
                  padding: '12px', 
                  backgroundColor: 'rgba(255,255,255,0.1)', 
                  borderRadius: '4px' 
                }}>
                  <h5>Right Section {i + 1}</h5>
                  <p>This is the right panel content section {i + 1}. This panel has variable width and syncs perfectly with the left panel. Try scrolling either panel and watch them move together!</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Render right scrollbars */}
          {rightScrollManager.verticalScrollbar}
          {rightScrollManager.horizontalScrollbar}
          {rightScrollManager.corner}
        </div>
      </div>
      
      {/* Instructions */}
      <div style={{ 
        marginTop: '20px', 
        textAlign: 'center', 
        padding: '15px', 
        backgroundColor: '#fff', 
        borderRadius: '8px',
        border: '1px solid #ddd'
      }}>
        <p><strong>🧪 Experiment Instructions:</strong></p>
        <p>1. Scroll vertically in the left panel → Right panel follows</p>
        <p>2. Scroll vertically in the right panel → Left panel follows</p>
        <p>3. Scroll horizontally in either panel → Both sync</p>
        <p>4. Click "Scroll Both to Top" → Both panels smoothly scroll to top</p>
        <p>5. Resize browser window → Right panel adapts, sync maintained</p>
      </div>
    </div>
  );
}

export default ScrollbarDeveopment;
