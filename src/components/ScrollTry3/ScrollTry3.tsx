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
      const hasVert3 = maxScroll.top > 0 && container3.maxScroll.top > 0;
      // const hasHorz = maxScroll.left > 0 && container2.maxScroll.left > 0; // ← horizontal disabled
      const EPS = 1; // snap when within 1px of the end
      const targetTop = hasVert
        ? (maxScroll.top - position.top <= EPS
            ? container2.maxScroll.top
            : Math.floor((position.top / maxScroll.top) * container2.maxScroll.top))
        : container2.scrollPosition.top;
      const targetTop3 = hasVert3
        ? (maxScroll.top - position.top <= EPS
            ? container3.maxScroll.top
            : Math.floor((position.top / maxScroll.top) * container3.maxScroll.top))
        : container3.scrollPosition.top;
      const targetLeft = 0; // ← horizontal disabled (was: proportional sync)
      container2.applyPosition(targetTop, targetLeft);
      container3.applyPosition(targetTop3, targetLeft);
    }
  });
  const container2 = useControlledScroll({
    onUserScroll: ({ position, maxScroll }) => {
      const hasVert = maxScroll.top > 0 && container1.maxScroll.top > 0;
      const hasVert3 = maxScroll.top > 0 && container3.maxScroll.top > 0;
      // const hasHorz = maxScroll.left > 0 && container1.maxScroll.left > 0; // ← horizontal disabled
      const EPS = 1;
      const targetTop = hasVert
        ? (maxScroll.top - position.top <= EPS
            ? container1.maxScroll.top
            : Math.floor((position.top / maxScroll.top) * container1.maxScroll.top))
        : container1.scrollPosition.top;
      const targetTop3 = hasVert3
        ? (maxScroll.top - position.top <= EPS
            ? container3.maxScroll.top
            : Math.floor((position.top / maxScroll.top) * container3.maxScroll.top))
        : container3.scrollPosition.top;
      const targetLeft = 0; // ← horizontal disabled (was: proportional sync)
      container1.applyPosition(targetTop, targetLeft);
      container3.applyPosition(targetTop3, targetLeft);
    }
  });
  const container3 = useControlledScroll({
    onUserScroll: ({ position, maxScroll }) => {
      const hasVert = maxScroll.top > 0 && container1.maxScroll.top > 0;
      const hasVert2 = maxScroll.top > 0 && container2.maxScroll.top > 0;
      // const hasHorz = maxScroll.left > 0 && container1.maxScroll.left > 0; // ← horizontal disabled
      const EPS = 1;
      const targetTop = hasVert
        ? (maxScroll.top - position.top <= EPS
            ? container1.maxScroll.top
            : Math.floor((position.top / maxScroll.top) * container1.maxScroll.top))
        : container1.scrollPosition.top;
      const targetTop2 = hasVert2
        ? (maxScroll.top - position.top <= EPS
            ? container2.maxScroll.top
            : Math.floor((position.top / maxScroll.top) * container2.maxScroll.top))
        : container2.scrollPosition.top;
      const targetLeft = 0; // ← horizontal disabled (was: proportional sync)
      container1.applyPosition(targetTop, targetLeft);
      container2.applyPosition(targetTop2, targetLeft);
    }
  });

  // Hoisted styles to avoid recreating objects on every render
  const rowStyle: React.CSSProperties = { display: 'flex', gap: '50px', width: '100%' };
  const paneStyle: React.CSSProperties = { margin: '20px', overflow: 'hidden', position: 'relative', height: 'calc(100vh - 40px)', minWidth: '400px', flex: '1' };
  const paneStyle3: React.CSSProperties = { margin: '20px', overflow: 'hidden', position: 'relative', paddingRight: SCROLLBAR_WIDTH, height: 'calc(100vh - 40px)', width: '100px', flexShrink: 0 };

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
          {/* Scrollbar hidden for first column */}

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
          {/* Scrollbar hidden for second column */}

          <div ref={container2.contentRef} className="scrollable-inner" style={{ zIndex: 1 }}>
            <ScrollableContent />
          </div>
        </div>

        {/* Terceiro container - 100px width */}
        <div
          ref={container3.scrollableRef}
          className="scrollable-content"
          style={paneStyle3}
        >
          <container3.VerticalScrollbar />

          <div ref={container3.contentRef} className="scrollable-inner" style={{ zIndex: 1, height: container2.contentSize.height }}>
            {/* Empty content with height matching second column */}
          </div>
        </div>
      </div>
    </>
  );
};

export default React.memo(Inner);