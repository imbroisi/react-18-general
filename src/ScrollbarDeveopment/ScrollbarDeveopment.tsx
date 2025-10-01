import React, { useRef } from 'react';
import './ScrollbarDeveopment.css';
import { useBlockThumbDrag } from '../hooks/useBlockThumbDrag';

export interface ScrollbarDeveopmentProps {

}

const ScrollbarDeveopment = (props: ScrollbarDeveopmentProps) => {
  // const contentRef = useRef<HTMLDivElement>(null);
  // const scrollPositionRef = useRef({ x: 0, y: 0 });
  const testScrollRef = useRef<HTMLDivElement>(null); // New ref for hook test
  
  // ScrollTo commands (one-time scroll commands)
  // const [scrollToV, setScrollToV] = useState<number | undefined>(undefined);
  // const [scrollToH, setScrollToH] = useState<number | undefined>(undefined);

  // Apply the hook to the test scroll area
  useBlockThumbDrag(testScrollRef, { enabled: true, debug: true });

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
        <h3>useBlockThumbDrag Hook Test - Windows Only (No wrapper interference):</h3>
        <div 
          ref={testScrollRef}
          style={{
            width: '1000px',
            height: '300px',
            border: '2px solid purple',
            overflow: 'auto',
            padding: '10px',
            backgroundColor: '#f9f9f9'
          }}
        >
          <div 
            style={{
              width: '1400px',
              height: '800px',
              background: 'linear-gradient(45deg, #8e44ad, #3498db, #e67e22, #27ae60)',
              padding: '20px',
              fontSize: '18px',
              color: 'white',
              borderRadius: '8px'
            }}
          >
            <h2>🎣 Hook-Based Thumb Blocking</h2>
            <p><strong>✅ No wrapper component interference</strong></p>
            <p><strong>✅ Uses your existing element and styles</strong></p>
            <p><strong>✅ Just adds event listeners via hook</strong></p>
            <p><strong>🪟 Windows scrollbar detection only</strong></p>
            
            <h3>Test different scroll methods:</h3>
            <ul>
              <li><strong>✅ Mouse wheel over content</strong> (should work)</li>
              <li><strong>❌ Dragging scrollbar thumb</strong> (should be blocked)</li>
              <li><strong>✅ Arrow keys</strong> (should work)</li>
              <li><strong>✅ Page Up/Down keys</strong> (should work)</li>
              <li><strong>❌ Clicking scrollbar track</strong> (should be blocked)</li>
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
