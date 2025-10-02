import React, { useRef, useEffect, useState } from 'react';

export interface UseControlledScrollOptions {
  onUserScroll?: (args: {
    position: { top: number; left: number };
    maxScroll: { top: number; left: number };
  }) => void;
}

const COLOR_THUMB = '#a0a0a0';
const COLOR_TRACK = '#ecf0f1';
const THUMB_HEIGHT = 20;
const THUMB_TOP_MARGIN = 100;
const THUMB_BOTTOM_MARGIN = 8;
const SCROLLBAR_WIDTH = 12;

export const useControlledScroll = (options?: UseControlledScrollOptions) => {
  const scrollableRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState({ top: 0, left: 0 });
  const [maxScroll, setMaxScroll] = useState({ top: 0, left: 0 });
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [contentSize, setContentSize] = useState({ width: 0, height: 0 });
  
  // Drag state handled via ref to avoid stale closures in document listeners
  const dragStartRef = useRef({ y: 0, scrollTop: 0 });
  const isDraggingRef = useRef(false);

  // Controlled transform application - optimized for smooth updates
  useEffect(() => {
    if (!contentRef.current) return;
    // Use transform3d for hardware acceleration
    contentRef.current.style.transform = `translate3d(-${scrollPosition.left}px, -${scrollPosition.top}px, 0)`;
  }, [scrollPosition]);

  // Measure sizes and compute max scroll
  useEffect(() => {
    const containerEl = scrollableRef.current;
    const contentEl = contentRef.current;
    if (!containerEl || !contentEl) return;

    // Performance hints
    containerEl.style.contain = 'strict';
    contentEl.style.willChange = 'transform';

    const updateSizes = () => {
      const height = containerEl.clientHeight;
      const width = containerEl.clientWidth;
      const cHeight = contentEl.scrollHeight;
      const cWidth = contentEl.scrollWidth;
      setContainerSize({ width, height });
      setContentSize({ width: cWidth, height: cHeight });
      setMaxScroll({
        top: Math.max(0, cHeight - height),
        left: Math.max(0, cWidth - width)
      });
      setScrollPosition(prev => ({
        top: Math.min(prev.top, Math.max(0, cHeight - height)),
        left: Math.min(prev.left, Math.max(0, cWidth - width))
      }));
    };

    updateSizes();
    const ro = new ResizeObserver(updateSizes);
    ro.observe(containerEl);
    ro.observe(contentEl);
    return () => {
      ro.disconnect();
    };
  }, []);

  // Wheel handler (block native and update controlled position)
  useEffect(() => {
    const containerEl = scrollableRef.current;
    if (!containerEl) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const nextTop = Math.max(0, Math.min(maxScroll.top, scrollPosition.top + e.deltaY));
      const nextLeft = Math.max(0, Math.min(maxScroll.left, scrollPosition.left + e.deltaX));
      setScrollPosition({ top: nextTop, left: nextLeft });
      // Notifica scroll do usuário
      options?.onUserScroll?.({ position: { top: nextTop, left: nextLeft }, maxScroll });
    };
    containerEl.addEventListener('wheel', onWheel, { passive: false });
    return () => containerEl.removeEventListener('wheel', onWheel);
  }, [scrollPosition, maxScroll, options]);

  // Prevent native scroll from container (safety)
  useEffect(() => {
    const el = scrollableRef.current;
    if (!el) return;
    const onScroll = (e: Event) => {
      e.preventDefault();
      (e.target as HTMLElement).scrollTop = 0;
      (e.target as HTMLElement).scrollLeft = 0;
    };
    el.addEventListener('scroll', onScroll, { passive: false });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  // Drag on custom thumb
  const onThumbMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    dragStartRef.current = { y: e.clientY, scrollTop: scrollPosition.top };
    document.addEventListener('mousemove', onThumbMouseMove);
    document.addEventListener('mouseup', onThumbMouseUp);
    // UX: indicate dragging and reduce selection jank
    document.body.style.cursor = 'grabbing';
    (document.body as HTMLElement).style.userSelect = 'none';
  };

  const onThumbMouseMove = (e: MouseEvent) => {
    if (!isDraggingRef.current) return;
    
    // Use requestAnimationFrame for smoother updates
    requestAnimationFrame(() => {
      const trackHeight = containerSize.height;
      const viewport = containerSize.height;
      const content = contentSize.height;
      const maxTop = Math.max(0, content - viewport);
      if (maxTop <= 0) return;
      const thumbHeight = Math.max(THUMB_HEIGHT, (viewport / content) * trackHeight);
      const scrollArea = trackHeight - thumbHeight;
      
      // Account for thumb positioning constraints
        const topMargin = THUMB_TOP_MARGIN;
      const bottomMargin = THUMB_BOTTOM_MARGIN;
        const maxThumbTop = scrollArea - bottomMargin;
        const availableThumbArea = maxThumbTop - topMargin;
      
      const deltaY = e.clientY - dragStartRef.current.y;
      const nextTop = Math.max(0, Math.min(maxTop, dragStartRef.current.scrollTop + (deltaY * (maxTop / availableThumbArea))));

      // Immediate visual updates to minimize perceived latency
      if (contentRef.current) {
        contentRef.current.style.transform = `translate3d(-${scrollPosition.left}px, -${nextTop}px, 0)`;
      }
      if (thumbRef.current) {
        const proportion = maxTop > 0 ? (nextTop / maxTop) : 0;
        const computedThumbTop = Math.min(maxThumbTop, topMargin + proportion * (maxThumbTop - topMargin));
        thumbRef.current.style.top = `${computedThumbTop}px`;
      }
      
      // Batch the state update
      setScrollPosition(prev => ({ ...prev, top: nextTop }));
      // Notifica scroll do usuário
      options?.onUserScroll?.({ position: { top: nextTop, left: scrollPosition.left }, maxScroll });
    });
  };

  const onThumbMouseUp = () => {
    isDraggingRef.current = false;
    document.removeEventListener('mousemove', onThumbMouseMove);
    document.removeEventListener('mouseup', onThumbMouseUp);
    document.body.style.cursor = '';
    (document.body as HTMLElement).style.userSelect = '';
  };

  // Renderer para a barra vertical (track + thumb)
  const VerticalScrollbar: React.FC = () => {
    const trackHeight = containerSize.height;
    const viewport = containerSize.height;
    const content = contentSize.height;
    const maxTopLocal = Math.max(0, content - viewport);
    const thumbHeight = Math.max(THUMB_HEIGHT, (viewport > 0 && content > 0) ? (viewport / content) * trackHeight : 0);
    const scrollArea = Math.max(0, trackHeight - thumbHeight);
    // Thumb starts at 100px from top and moves to 8px from bottom
        const topMargin = THUMB_TOP_MARGIN;
    const bottomMargin = THUMB_BOTTOM_MARGIN;
    const maxThumbTop = scrollArea - bottomMargin;
    const calculatedThumbTop = maxTopLocal > 0 ? (scrollPosition.top / maxTopLocal) * (maxThumbTop - topMargin) : 0;
    
    const thumbTop = Math.min(maxThumbTop, topMargin + calculatedThumbTop);

    return (
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: SCROLLBAR_WIDTH,
          height: '100%',
          background: COLOR_TRACK,
          zIndex: 2
        }}
      >
        <div
          ref={thumbRef}
          onMouseDown={onThumbMouseDown}
          style={{
            position: 'absolute',
            left: 2,
            width: 8,
            borderRadius: 4,
            background: COLOR_THUMB,
            cursor: 'pointer',
            height: `${thumbHeight}px`,
            top: `${thumbTop}px`
          }}
        />
      </div>
    );
  };

  return {
    scrollableRef,
    contentRef,
    scrollPosition,
    setScrollPosition,
    maxScroll,
    containerSize,
    contentSize,
    onThumbMouseDown,
    isDragging: isDraggingRef.current,
    VerticalScrollbar
  };
};


