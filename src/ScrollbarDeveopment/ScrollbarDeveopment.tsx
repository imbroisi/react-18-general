import React, { useRef } from 'react';
import './ScrollbarDeveopment.css';
import { useScrollManager } from '../hooks/useScrollManager';
// import { useBlockThumbDrag } from '../hooks/useBlockThumbDrag';

export interface ScrollbarDeveopmentProps {

}

const ScrollbarDeveopment = (props: ScrollbarDeveopmentProps) => {
  // const testScrollRef = useRef<HTMLDivElement>(null);
  // const contentRef = useRef<HTMLDivElement>(null);
  
  // Hook version test refs
  const hookContainerRef = useRef<HTMLDivElement>(null);
  const hookContentRef = useRef<HTMLDivElement>(null);
  
  // State for parent-controlled scrolling
  // const [scrollPosition, setScrollPosition] = useState({ top: 0, left: 0 });
  // const [thumbPosition, setThumbPosition] = useState({ scrollTop: 0, scrollLeft: 0, scrollPercentageV: 0, scrollPercentageH: 0 });
  
  // Test controls to prove parent control
  // const [parentControlEnabled, setParentControlEnabled] = useState(true);
  // const [contentMovementEnabled, setContentMovementEnabled] = useState(true);
  // const [callbackEnabled, setCallbackEnabled] = useState(true);
  
  // Hook version handlers
  const handleHookVThumbMove = (position: { scrollTop: number; scrollPercentage: number }) => {
    console.log('🎣 Hook V Thumb Move:', position);
  };

  const handleHookHThumbMove = (position: { scrollLeft: number; scrollPercentage: number }) => {
    console.log('🎣 Hook H Thumb Move:', position);
  };

  // Use the ScrollManager hook
  const scrollManager = useScrollManager(hookContainerRef, hookContentRef, {
    onVThumbMove: handleHookVThumbMove,
    onHThumbMove: handleHookHThumbMove,
    mode: 'alwaysPresent'
  });

  // Handle thumb movements from the hook
  // const handleThumbMove = (position: { scrollTop: number; scrollLeft: number; scrollPercentageV: number; scrollPercentageH: number }) => {
  //   if (!callbackEnabled) {
  //     console.log('🚫 Parent callback DISABLED - ignoring thumb move:', position);
  //     return; // Parent ignores thumb movements
  //   }
  //   
  //   console.log('🎯 Parent received thumb move:', position);
  //   
  //   // Update thumb position state (always update for dashboard)
  //   setThumbPosition(position);
  //   
  //   if (!parentControlEnabled) {
  //     console.log('🚫 Parent control DISABLED - not updating scroll position');
  //     return; // Parent doesn't update scroll position
  //   }
  //   
  //   // Parent controls the actual content scrolling
  //   setScrollPosition({ top: position.scrollTop, left: position.scrollLeft });
  //   
  //   if (!contentMovementEnabled) {
  //     console.log('🚫 Content movement DISABLED - not moving content');
  //     return; // Parent doesn't move content
  //   }
  //   
  //   // Apply the scroll to the content element
  //   if (contentRef.current) {
  //     contentRef.current.style.transform = `translate(-${position.scrollLeft}px, -${position.scrollTop}px)`;
  //     console.log('✅ Content moved by parent to:', `translate(-${position.scrollLeft}px, -${position.scrollTop}px)`);
  //   }
  // };

  // Apply the hook with parent control
  // useBlockThumbDrag(testScrollRef, { 
  //   enabled: true, 
  //   debug: true,
  //   onThumbMove: handleThumbMove, // Always pass callback, but handle conditionally inside
  //   allowWheelScroll: false,  // Block wheel scroll - parent controls everything
  //   allowKeyboardScroll: false  // Block keyboard scroll - parent controls everything
  // });

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

      {/* Hook Version Test Area - useScrollManager */}
      <div style={{ marginTop: '20px' }}>
        <h3>🎣 useScrollManager Hook - No Wrapper Component!</h3>
        <p><strong>✅ Same ScrollManager functionality without wrapper interference</strong></p>
        
        <div 
          ref={hookContainerRef}
          style={{
            ...scrollManager.containerStyles,
            width: '1000px',
            height: '300px',
            border: '2px solid green',
            backgroundColor: '#f0f8f0'
          }}
        >
          {/* Viewport area */}
          <div style={scrollManager.viewportStyles}>
            <div 
              ref={hookContentRef}
              style={{
                ...scrollManager.contentStyles,
                width: '1400px',
                height: '800px',
                background: 'linear-gradient(45deg, #27ae60, #2ecc71, #58d68d, #85c1e9)',
                padding: '20px',
                fontSize: '18px',
                color: 'white',
                borderRadius: '8px'
              }}
            >
              <h2>🎣 Hook-Based ScrollManager</h2>
              <p><strong>✅ No wrapper component - pure hook!</strong></p>
              <p><strong>✅ Same functionality as ScrollManager</strong></p>
              <p><strong>✅ No parent interference</strong></p>
              <p><strong>✅ Custom scrollbars with full control</strong></p>
              
              <h3>How it works:</h3>
              <ul>
                <li><strong>🎣 Hook manages state</strong> → No wrapper needed</li>
                <li><strong>📦 Returns scrollbar elements</strong> → You position them</li>
                <li><strong>🎨 Returns styles</strong> → You apply to your elements</li>
                <li><strong>🎛️ Full callback support</strong> → Same as ScrollManager</li>
              </ul>
              
              <div style={{ marginTop: '200px', padding: '20px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                <h4>🔧 Implementation:</h4>
                <pre style={{ fontSize: '14px', color: '#ecf0f1' }}>
{`const scrollManager = useScrollManager(containerRef, contentRef, {
  onVThumbMove: handleVThumbMove,
  onHThumbMove: handleHThumbMove,
  mode: 'alwaysPresent'
});

// Apply styles to your elements
<div style={scrollManager.containerStyles}>
  <div style={scrollManager.viewportStyles}>
    <div style={scrollManager.contentStyles}>
      Your content here
    </div>
  </div>
  {scrollManager.verticalScrollbar}
  {scrollManager.horizontalScrollbar}
  {scrollManager.corner}
</div>`}
                </pre>
              </div>
              
              <div style={{ marginTop: '200px' }}>
                <p><strong>🎯 Perfect for complex apps where wrapper components cause issues!</strong></p>
              </div>
            </div>
          </div>
          
          {/* Render scrollbars */}
          {scrollManager.verticalScrollbar}
          {scrollManager.horizontalScrollbar}
          {scrollManager.corner}
        </div>
      </div>

      {/* Hook Test Area - useBlockThumbDrag - COMMENTED OUT */}
      {/* 
      <div style={{ marginTop: '20px' }}>
        <h3>🎛️ Parent-Controlled Scrolling - Thumb Movement Capture:</h3>
        
        Parent Control Info Panel
        <div style={{ 
          marginBottom: '20px', 
          padding: '15px', 
          backgroundColor: '#e8f4fd', 
          border: '1px solid #3498db',
          borderRadius: '8px',
          fontFamily: 'monospace'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>📊 Parent Control Dashboard:</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', color: '#2c3e50', marginBottom: '15px' }}>
            <div><strong>Scroll Position:</strong> scrollPosition.top.toFixed(0) px, scrollPosition.left.toFixed(0) px</div>
            <div><strong>Thumb Position:</strong> thumbPosition.scrollTop.toFixed(0) px, thumbPosition.scrollLeft.toFixed(0) px</div>
            <div><strong>Vertical %:</strong> thumbPosition.scrollPercentageV.toFixed(1) %</div>
            <div><strong>Horizontal %:</strong> thumbPosition.scrollPercentageH.toFixed(1) %</div>
          </div>
          
          Test Control Buttons
          <div style={{ borderTop: '1px solid #3498db', paddingTop: '15px' }}>
            <h5 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>🧪 Test Parent Control (Drag thumb to test):</h5>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button>Callback Button</button>
              <button>Parent Control Button</button>
              <button>Content Movement Button</button>
            </div>
            
            <div style={{ marginTop: '10px', fontSize: '12px', color: '#7f8c8d' }}>
              <strong>Status:</strong> 
              <span>Callback: ON/OFF</span>
              <span>Parent Control: ON/OFF</span>
              <span>Content Movement: ON/OFF</span>
            </div>
          </div>
        </div>
        
        Scrollable test area with content...
        
      </div>
      */}  
    </div>
  );
}

export default ScrollbarDeveopment;
