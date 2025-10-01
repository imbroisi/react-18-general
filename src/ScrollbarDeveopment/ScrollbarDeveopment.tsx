import React, { useRef, useState } from 'react';
import './ScrollbarDeveopment.css';
import ScrollManager from '../components/Scrollbars/Scrollbars';

export interface ScrollbarDeveopmentProps {

}

const ScrollbarDeveopment = (props: ScrollbarDeveopmentProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollPositionRef = useRef({ x: 0, y: 0 });
  
  // ScrollTo commands (one-time scroll commands)
  const [scrollToV, setScrollToV] = useState<number | undefined>(undefined);
  const [scrollToH, setScrollToH] = useState<number | undefined>(undefined);

  const handleVerticalThumbMove = (position: { scrollTop: number; scrollPercentage: number }) => {
    if (contentRef.current) {
      scrollPositionRef.current.y = position.scrollTop;
      contentRef.current.style.transform = `translate(-${scrollPositionRef.current.x}px, -${scrollPositionRef.current.y}px)`;
      console.log(`Vertical scroll: ${position.scrollTop}px (${position.scrollPercentage.toFixed(1)}%)`);
    }
  };

  const handleHorizontalThumbMove = (position: { scrollLeft: number; scrollPercentage: number }) => {
    if (contentRef.current) {
      scrollPositionRef.current.x = position.scrollLeft;
      contentRef.current.style.transform = `translate(-${scrollPositionRef.current.x}px, -${scrollPositionRef.current.y}px)`;
      console.log(`Horizontal scroll: ${position.scrollLeft}px (${position.scrollPercentage.toFixed(1)}%)`);
    }
  };

  // Helper function to trigger scroll commands
  const scrollTo = (vertical?: number, horizontal?: number) => {
    if (vertical !== undefined) setScrollToV(vertical);
    if (horizontal !== undefined) setScrollToH(horizontal);
    
    // Clear the command after a brief delay to allow for new commands
    setTimeout(() => {
      if (vertical !== undefined) setScrollToV(undefined);
      if (horizontal !== undefined) setScrollToH(undefined);
    }, 50);
  };

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
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button onClick={() => scrollTo(0)}>Scroll to Top</button>
        <button onClick={() => scrollTo(200)}>Scroll to 200px</button>
        <button onClick={() => scrollTo(400)}>Scroll to Bottom</button>
        <button onClick={() => scrollTo(undefined, 0)}>Scroll to Left</button>
        <button onClick={() => scrollTo(undefined, 100)}>Scroll to 100px Right</button>
        <button onClick={() => scrollTo(0, 0)}>Scroll to Top-Left</button>
      </div>
      
      <div 
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
      </div>  
    </div>
  );
}

export default ScrollbarDeveopment;
