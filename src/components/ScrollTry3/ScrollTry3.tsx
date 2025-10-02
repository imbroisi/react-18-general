import React from 'react';
import ScrollableContent from './ScrollableContent';
import { useControlledScroll } from '../../hooks/useControlledScroll';
import './ScrollTry3.css';

export interface ScrollTry3Props {

}

const ScrollTry3 = (props: ScrollTry3Props) => {
  // Primeiro container: sincroniza o segundo apenas em interações do usuário
  const container1 = useControlledScroll({
    onUserScroll: ({ position, maxScroll }) => {
      if (maxScroll.top > 0 && container2.maxScroll.top > 0) {
        const ratio = position.top / maxScroll.top;
        const targetTop = ratio * container2.maxScroll.top;
        container2.setScrollPosition({ top: Math.max(0, Math.min(container2.maxScroll.top, targetTop)), left: 0 });
      }
    }
  });

  // Segundo container: sincroniza o primeiro apenas em interações do usuário
  const container2 = useControlledScroll({
    onUserScroll: ({ position, maxScroll }) => {
      if (maxScroll.top > 0 && container1.maxScroll.top > 0) {
        const ratio = position.top / maxScroll.top;
        const targetTop = ratio * container1.maxScroll.top;
        container1.setScrollPosition({ top: Math.max(0, Math.min(container1.maxScroll.top, targetTop)), left: 0 });
      }
    }
  });

  return (
    <>
      <div style={{ display: 'flex', gap: '50px', width: '100%' }}>
        {/* Div scrollável controlada (nativo bloqueado) */}
        <div
          ref={container1.scrollableRef}
          className="scrollable-content"
          style={{ margin: '20px', overflow: 'hidden', position: 'relative', paddingRight: 12, height: 'calc(100vh - 40px)', minWidth: '400px', flex: '1' }}
        >
          <container1.VerticalScrollbar color="#3498db" />

          <div ref={container1.contentRef} className="scrollable-inner" style={{ zIndex: 1 }}>
            <ScrollableContent />
          </div>
        </div>

        {/* Segundo container */}
        <div
          ref={container2.scrollableRef}
          className="scrollable-content"
          style={{ margin: '20px', overflow: 'hidden', position: 'relative', paddingRight: 12, height: 'calc(100vh - 40px)', minWidth: '400px', flex: '1' }}
        >
          <container2.VerticalScrollbar color="#9b59b6" />

          <div ref={container2.contentRef} className="scrollable-inner" style={{ zIndex: 1 }}>
            <ScrollableContent />
          </div>
        </div>
      </div>
    </>
  );
}

export default ScrollTry3;