import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { useControlledScroll } from '../../hooks/useControlledScroll';

export interface ControlledScrollViewHandle {
  setScrollPosition: (pos: { top: number; left?: number }) => void;
  getMaxScroll: () => { top: number; left: number };
  getPosition: () => { top: number; left: number };
}

export interface ControlledScrollViewProps {
  onUserScroll?: (args: { position: { top: number; left: number }; maxScroll: { top: number; left: number } }) => void;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  scrollbarWidth?: number;
}

const ControlledScrollView = forwardRef<ControlledScrollViewHandle, ControlledScrollViewProps>(
  ({ onUserScroll, style, children, scrollbarWidth = 12 }, ref) => {
    const apiRef = useRef<ControlledScrollViewHandle | null>(null);
    const container = useControlledScroll({ onUserScroll });

    useImperativeHandle(ref, () => ({
      setScrollPosition: (pos) => container.setScrollPosition({ top: pos.top, left: pos.left ?? 0 }),
      getMaxScroll: () => container.maxScroll,
      getPosition: () => container.scrollPosition,
    }), [container]);

    return (
      <div
        ref={container.scrollableRef}
        className="scrollable-content"
        style={{
          margin: '20px',
          overflow: 'hidden',
          position: 'relative',
          paddingRight: scrollbarWidth,
          height: 'calc(100vh - 40px)',
          minWidth: '400px',
          flex: '1',
          ...style,
        }}
      >
        <container.VerticalScrollbar />
        <div ref={container.contentRef} className="scrollable-inner" style={{ zIndex: 1 }}>
          {children}
        </div>
      </div>
    );
  }
);

export default ControlledScrollView;


