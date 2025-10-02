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
      const hasVert = maxScroll.top > 0 && container2.maxScroll.top > 0;
      const hasHorz = maxScroll.left > 0 && container2.maxScroll.left > 0;
      const EPS = 1; // snap when within 1px of the end
      const targetTop = hasVert
        ? (maxScroll.top - position.top <= EPS
            ? container2.maxScroll.top
            : Math.floor((position.top / maxScroll.top) * container2.maxScroll.top))
        : container2.scrollPosition.top;
      const targetLeft = hasHorz
        ? (maxScroll.left - position.left <= EPS
            ? container2.maxScroll.left
            : Math.floor((position.left / maxScroll.left) * container2.maxScroll.left))
        : container2.scrollPosition.left;
      container2.applyPosition(targetTop, targetLeft);
    }
  });
  const container2 = useControlledScroll({
    onUserScroll: ({ position, maxScroll }) => {
      const hasVert = maxScroll.top > 0 && container1.maxScroll.top > 0;
      const hasHorz = maxScroll.left > 0 && container1.maxScroll.left > 0;
      const EPS = 1;
      const targetTop = hasVert
        ? (maxScroll.top - position.top <= EPS
            ? container1.maxScroll.top
            : Math.floor((position.top / maxScroll.top) * container1.maxScroll.top))
        : container1.scrollPosition.top;
      const targetLeft = hasHorz
        ? (maxScroll.left - position.left <= EPS
            ? container1.maxScroll.left
            : Math.floor((position.left / maxScroll.left) * container1.maxScroll.left))
        : container1.scrollPosition.left;
      container1.applyPosition(targetTop, targetLeft);
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