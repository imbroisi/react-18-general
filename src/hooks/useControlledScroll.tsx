import React, { useRef, useEffect, useState } from 'react';

export interface UseControlledScrollOptions {
  onUserScroll?: (args: {
    position: { top: number; left: number };
    maxScroll: { top: number; left: number };
  }) => void;
}

export const useControlledScroll = (options?: UseControlledScrollOptions) => {
  const scrollableRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState({ top: 0, left: 0 });
  const [maxScroll, setMaxScroll] = useState({ top: 0, left: 0 });
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [contentSize, setContentSize] = useState({ width: 0, height: 0 });
  
  // Drag state handled via ref to avoid stale closures in document listeners
  const dragStartRef = useRef({ y: 0, scrollTop: 0 });
  const isDraggingRef = useRef(false);

  // Controlled transform application
  useEffect(() => {
    if (!contentRef.current) return;
    contentRef.current.style.transform = `translate(-${scrollPosition.left}px, -${scrollPosition.top}px)`;
  }, [scrollPosition]);

  // Measure sizes and compute max scroll
  useEffect(() => {
    const containerEl = scrollableRef.current;
    const contentEl = contentRef.current;
    if (!containerEl || !contentEl) return;

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
  }, [scrollPosition, maxScroll, options?.onUserScroll]);

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
  };

  const onThumbMouseMove = (e: MouseEvent) => {
    if (!isDraggingRef.current) return;
    const trackHeight = containerSize.height;
    const viewport = containerSize.height;
    const content = contentSize.height;
    const maxTop = Math.max(0, content - viewport);
    if (maxTop <= 0) return;
    const thumbHeight = Math.max(20, (viewport / content) * trackHeight);
    const scrollArea = trackHeight - thumbHeight;
    const deltaY = e.clientY - dragStartRef.current.y;
    const nextTop = Math.max(0, Math.min(maxTop, dragStartRef.current.scrollTop + (deltaY * (maxTop / scrollArea))));
    setScrollPosition(prev => ({ ...prev, top: nextTop }));
    // Notifica scroll do usuário
    options?.onUserScroll?.({ position: { top: nextTop, left: scrollPosition.left }, maxScroll });
  };

  const onThumbMouseUp = () => {
    isDraggingRef.current = false;
    document.removeEventListener('mousemove', onThumbMouseMove);
    document.removeEventListener('mouseup', onThumbMouseUp);
  };

  // Renderer para a barra vertical (track + thumb)
  const VerticalScrollbar: React.FC<{ color?: string }>= ({ color = '#3498db' }) => {
    const trackHeight = containerSize.height;
    const viewport = containerSize.height;
    const content = contentSize.height;
    const maxTopLocal = Math.max(0, content - viewport);
    const thumbHeight = Math.max(20, (viewport > 0 && content > 0) ? (viewport / content) * trackHeight : 0);
    const scrollArea = Math.max(0, trackHeight - thumbHeight);
    const thumbTop = maxTopLocal > 0 ? (scrollPosition.top / maxTopLocal) * scrollArea : 0;

    return (
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 12,
          height: '100%',
          background: '#ecf0f1',
          zIndex: 2
        }}
      >
        <div
          onMouseDown={onThumbMouseDown}
          style={{
            position: 'absolute',
            left: 2,
            width: 8,
            borderRadius: 4,
            background: color,
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


