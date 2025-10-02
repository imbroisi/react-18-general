import React, { useRef, useCallback } from 'react';
import ScrollableContent from './ScrollableContent';
import ControlledScrollView, { ControlledScrollViewHandle } from './ControlledScrollView';
import './ScrollTry3.css';

const SCROLLBAR_WIDTH = 12;

export interface ScrollTry3Props {

}

const ScrollTry3 = (props: ScrollTry3Props) => {
  const ref1 = useRef<ControlledScrollViewHandle>(null);
  const ref2 = useRef<ControlledScrollViewHandle>(null);

  const onUserScroll1 = useCallback(({ position, maxScroll }: { position: { top: number; left: number }; maxScroll: { top: number; left: number } }) => {
    const r2 = ref2.current;
    if (!r2) return;
    const max2 = r2.getMaxScroll();
    if (maxScroll.top > 0 && max2.top > 0) {
      const ratio = position.top / maxScroll.top;
      r2.setScrollPosition({ top: ratio * max2.top, left: 0 });
    }
  }, []);

  const onUserScroll2 = useCallback(({ position, maxScroll }: { position: { top: number; left: number }; maxScroll: { top: number; left: number } }) => {
    const r1 = ref1.current;
    if (!r1) return;
    const max1 = r1.getMaxScroll();
    if (maxScroll.top > 0 && max1.top > 0) {
      const ratio = position.top / maxScroll.top;
      r1.setScrollPosition({ top: ratio * max1.top, left: 0 });
    }
  }, []);

  return (
    <>
      <div style={{ display: 'flex', gap: '50px', width: '100%' }}>
        <ControlledScrollView ref={ref1} onUserScroll={onUserScroll1} scrollbarWidth={SCROLLBAR_WIDTH}>
          <ScrollableContent />
        </ControlledScrollView>

        <ControlledScrollView ref={ref2} onUserScroll={onUserScroll2} scrollbarWidth={SCROLLBAR_WIDTH}>
          <ScrollableContent />
        </ControlledScrollView>
      </div>
    </>
  );
}

export default ScrollTry3;