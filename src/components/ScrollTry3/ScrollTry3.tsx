import React from 'react';
import ScrollableContent from './ScrollableContent';
import { useControlledScroll } from '../../hooks/useControlledScroll';
import './ScrollTry3.css';

const SCROLLBAR_WIDTH = 12;

export interface ScrollTry3Props {

}

const Inner: React.FC = () => {
  const container1 = useControlledScroll({
    onUserScroll: ({ position, maxScroll }) => {
      if (maxScroll.top > 0 && container2.maxScroll.top > 0) {
        const ratio = position.top / maxScroll.top;
        container2.applyPosition(ratio * container2.maxScroll.top, 0);
      }
    }
  });
  const container2 = useControlledScroll({
    onUserScroll: ({ position, maxScroll }) => {
      if (maxScroll.top > 0 && container1.maxScroll.top > 0) {
        const ratio = position.top / maxScroll.top;
        container1.applyPosition(ratio * container1.maxScroll.top, 0);
      }
    }
  });

  // Hoisted styles to avoid recreating objects on every render
  const rowStyle: React.CSSProperties = { display: 'flex', gap: '50px', width: '100%' };
  const paneStyle: React.CSSProperties = { margin: '20px', overflow: 'hidden', position: 'relative', paddingRight: SCROLLBAR_WIDTH, height: 'calc(100vh - 40px)', minWidth: '400px', flex: '1' };

  console.log("==>> rendering ScrollTry3");
  
  return (
    <>
      <div style={rowStyle}>
        {/* Div scrollável controlada (nativo bloqueado) */}
        <div
          ref={container1.scrollableRef}
          className="scrollable-content"
          style={paneStyle}
        >
          <container1.VerticalScrollbar />

          <div ref={container1.contentRef} className="scrollable-inner" style={{ zIndex: 1 }}>
            <ScrollableContent />
          </div>
        </div>

        {/* Segundo container */}
        <div
          ref={container2.scrollableRef}
          className="scrollable-content"
          style={paneStyle}
        >
          <container2.VerticalScrollbar />

          <div ref={container2.contentRef} className="scrollable-inner" style={{ zIndex: 1 }}>
            <ScrollableContent />
          </div>
        </div>
      </div>
    </>
  );
};

export default React.memo(Inner);