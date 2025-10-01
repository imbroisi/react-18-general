import React, { useRef, useState } from 'react';
import './ScrollbarDeveopment.css';
import { useBlockThumbDrag } from '../hooks/useBlockThumbDrag';

export interface ScrollbarDeveopmentProps {

}

const ScrollbarDeveopment = (props: ScrollbarDeveopmentProps) => {
  const testScrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // State for parent-controlled scrolling
  const [scrollPosition, setScrollPosition] = useState({ top: 0, left: 0 });
  const [thumbPosition, setThumbPosition] = useState({ scrollTop: 0, scrollLeft: 0, scrollPercentageV: 0, scrollPercentageH: 0 });

  // Handle thumb movements from the hook
  const handleThumbMove = (position: { scrollTop: number; scrollLeft: number; scrollPercentageV: number; scrollPercentageH: number }) => {
    console.log('🎯 Parent received thumb move:', position);
    
    // Update thumb position state
    setThumbPosition(position);
    
    // Parent controls the actual content scrolling
    setScrollPosition({ top: position.scrollTop, left: position.scrollLeft });
    
    // Apply the scroll to the content element
    if (contentRef.current) {
      contentRef.current.style.transform = `translate(-${position.scrollLeft}px, -${position.scrollTop}px)`;
    }
  };

  // Apply the hook with parent control
  useBlockThumbDrag(testScrollRef, { 
    enabled: true, 
    debug: true,
    onThumbMove: handleThumbMove,
    allowWheelScroll: false,  // Block wheel scroll - parent controls everything
    allowKeyboardScroll: false  // Block keyboard scroll - parent controls everything
  });

  // const handleVerticalThumbMove = (position: { scrollTop: number; scrollPercentage: number }) => {
  //   if (contentRef.current) {
  //     scrollPositionRef.current.y = position.scrollTop;
  //     contentRef.current.style.transform = `translate(-${scrollPositionRef.current.x}px, -${scrollPositionRef.current.y}px)`;
  //     console.log(`Vertical scroll: ${position.scrollTop}px (${position.scrollPercentage.toFixed(1)}%)`);
  //   }
  // };

  // const handleHorizontalThumbMove = (position: { scrollLeft: number; scrollPercentage: number }) => {
  //   if (contentRef.current) {
  //     scrollPositionRef.current.x = position.scrollLeft;
  //     contentRef.current.style.transform = `translate(-${scrollPositionRef.current.x}px, -${scrollPositionRef.current.y}px)`;
  //     console.log(`Horizontal scroll: ${position.scrollLeft}px (${position.scrollPercentage.toFixed(1)}%)`);
  //   }
  // };

  // Helper function to trigger scroll commands
  // const scrollTo = (vertical?: number, horizontal?: number) => {
  //   if (vertical !== undefined) setScrollToV(vertical);
  //   if (horizontal !== undefined) setScrollToH(horizontal);
  //   
  //   // Clear the command after a brief delay to allow for new commands
  //   setTimeout(() => {
  //     if (vertical !== undefined) setScrollToV(undefined);
  //     if (horizontal !== undefined) setScrollToH(undefined);
  //   }, 50);
  // };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
      overflow: 'hidden'
    }}>
      {/* ScrollTo Command Buttons */}
      {/* <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button onClick={() => scrollTo(0)}>Scroll to Top</button>
        <button onClick={() => scrollTo(200)}>Scroll to 200px</button>
        <button onClick={() => scrollTo(400)}>Scroll to Bottom</button>
        <button onClick={() => scrollTo(undefined, 0)}>Scroll to Left</button>
        <button onClick={() => scrollTo(undefined, 100)}>Scroll to 100px Right</button>
        <button onClick={() => scrollTo(0, 0)}>Scroll to Top-Left</button>
      </div> */}
      
      {/* <div 
        id="outer-container" 
        style={{
          width: '1000px',
          height: '600px',
          border: '1px solid gray',
          position: 'relative'
        }}
      >
        <ScrollManager 
          onVThumbMove={handleVerticalThumbMove}
          onHThumbMove={handleHorizontalThumbMove}
          mode="alwaysPresent"
          scrollToVertical={scrollToV}
          scrollToHorizontal={scrollToH}
        >
          <div 
            ref={contentRef}
            style={{
              width: '1400px',
              height: '1000px',
              border: '10px solid orange',
              marginTop: '0px',
              overflow: 'hidden',
              backgroundColor: 'lightblue',
              transition: 'transform 0.1s ease-out'
            }}
          >
          </div>
        </ScrollManager>
      </div> */}

      {/* Hook Test Area - useBlockThumbDrag */}
      <div style={{ marginTop: '20px' }}>
        <h3>🎛️ Parent-Controlled Scrolling - Thumb Movement Capture:</h3>
        
        {/* Parent Control Info Panel */}
        <div style={{ 
          marginBottom: '20px', 
          padding: '15px', 
          backgroundColor: '#e8f4fd', 
          border: '1px solid #3498db',
          borderRadius: '8px',
          fontFamily: 'monospace'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>📊 Parent Control Dashboard:</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', color: '#2c3e50' }}>
            <div><strong>Scroll Position:</strong> {scrollPosition.top.toFixed(0)}px, {scrollPosition.left.toFixed(0)}px</div>
            <div><strong>Thumb Position:</strong> {thumbPosition.scrollTop.toFixed(0)}px, {thumbPosition.scrollLeft.toFixed(0)}px</div>
            <div><strong>Vertical %:</strong> {thumbPosition.scrollPercentageV.toFixed(1)}%</div>
            <div><strong>Horizontal %:</strong> {thumbPosition.scrollPercentageH.toFixed(1)}%</div>
          </div>
        </div>
        <div 
          ref={testScrollRef}
          style={{
            width: '1000px',
            height: '300px',
            border: '2px solid purple',
            overflow: 'auto',
            padding: '10px',
            backgroundColor: '#f9f9f9',
            position: 'relative'
          }}
        >
          {/* Invisible spacer to create scrollable area */}
          <div style={{ width: '1400px', height: '800px', visibility: 'hidden', pointerEvents: 'none' }} />
          
          <div 
            ref={contentRef}
            style={{
              width: '1400px',
              height: '800px',
              background: 'linear-gradient(45deg, #8e44ad, #3498db, #e67e22, #27ae60)',
              padding: '20px',
              fontSize: '18px',
              color: 'white',
              borderRadius: '8px',
              position: 'absolute',
              top: '10px',
              left: '10px',
              transition: 'transform 0.1s ease-out'
            }}
          >
            <h2>🎛️ Parent-Controlled Scrolling</h2>
            <p><strong>✅ Thumb movements captured and sent to parent</strong></p>
            <p><strong>✅ Parent has full control over content scrolling</strong></p>
            <p><strong>✅ No direct scrolling - everything goes through parent</strong></p>
            <p><strong>🪟 Windows scrollbar detection only</strong></p>
            
            <h3>How it works:</h3>
            <ul>
              <li><strong>🎯 Drag scrollbar thumb</strong> → Parent receives position data</li>
              <li><strong>🎛️ Parent controls content</strong> → Content moves via transform</li>
              <li><strong>❌ Mouse wheel blocked</strong> → Parent has full control</li>
              <li><strong>❌ Keyboard scroll blocked</strong> → Parent has full control</li>
              <li><strong>📊 Real-time feedback</strong> → Dashboard shows all data</li>
            </ul>
            
            <div style={{ marginTop: '100px', padding: '20px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
              <h4>🔍 Debug Information:</h4>
              <p>Check the browser console for detailed logging:</p>
              <ul>
                <li>🖱️ Mouse position and scrollbar detection</li>
                <li>🚫 Blocked thumb interactions</li>
                <li>✅ Allowed wheel/keyboard scrolling</li>
              </ul>
            </div>
            
            <div style={{ marginTop: '200px' }}>
              <p><strong>Windows scrollbars have actual width/height that we can detect!</strong></p>
              <p>The hook uses <code>offsetWidth - clientWidth</code> to detect scrollbar presence.</p>
            </div>
            
            <div style={{ marginTop: '200px' }}>
              <p><strong>Your parent component styles are completely preserved!</strong></p>
              <p>No wrapper div interference - just pure event listener magic! ✨</p>
            </div>
            
            <div style={{ marginTop: '100px', textAlign: 'center', fontSize: '24px' }}>
              <p>🎯 End of scrollable content</p>
            </div>
          </div>
        </div>
      </div>  
    </div>
  );
}

export default ScrollbarDeveopment;
