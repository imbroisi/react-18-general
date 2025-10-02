import { useRef, useEffect, useState } from 'react';
import ScrollableContent from './ScrollableContent';
import './ScrollTry3.css';

export interface ScrollTry3Props {

}

const ScrollTry3 = (props: ScrollTry3Props) => {
  const scrollableRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState({ top: 0, left: 0 });
  const [maxScroll, setMaxScroll] = useState({ top: 0, left: 0 });
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [contentSize, setContentSize] = useState({ width: 0, height: 0 });
  // Drag state handled via ref to avoid stale closures in document listeners
  const dragStartRef = useRef({ y: 0, scrollTop: 0 });
  const isDraggingRef = useRef(false);

  // Segundo container controlado
  const scrollableRef2 = useRef<HTMLDivElement>(null);
  const contentRef2 = useRef<HTMLDivElement>(null);
  const [scrollPosition2, setScrollPosition2] = useState({ top: 0, left: 0 });
  const [maxScroll2, setMaxScroll2] = useState({ top: 0, left: 0 });
  const [containerSize2, setContainerSize2] = useState({ width: 0, height: 0 });
  const [contentSize2, setContentSize2] = useState({ width: 0, height: 0 });
  const dragStartRef2 = useRef({ y: 0, scrollTop: 0 });
  const isDraggingRef2 = useRef(false);


  // Controlled transform application
  useEffect(() => {
    if (!contentRef.current) return;
    contentRef.current.style.transform = `translate(-${scrollPosition.left}px, -${scrollPosition.top}px)`;
  }, [scrollPosition]);

  // Controlled transform application - segundo
  useEffect(() => {
    if (!contentRef2.current) return;
    contentRef2.current.style.transform = `translate(-${scrollPosition2.left}px, -${scrollPosition2.top}px)`;
  }, [scrollPosition2]);

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

  // Measure sizes and compute max scroll - segundo
  useEffect(() => {
    const containerEl = scrollableRef2.current;
    const contentEl = contentRef2.current;
    if (!containerEl || !contentEl) return;

    const updateSizes = () => {
      const height = containerEl.clientHeight;
      const width = containerEl.clientWidth;
      const cHeight = contentEl.scrollHeight;
      const cWidth = contentEl.scrollWidth;
      setContainerSize2({ width, height });
      setContentSize2({ width: cWidth, height: cHeight });
      setMaxScroll2({
        top: Math.max(0, cHeight - height),
        left: Math.max(0, cWidth - width)
      });
      setScrollPosition2(prev => ({
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
      
      // Sincronizar com o segundo container
      if (maxScroll2.top > 0) {
        const ratio = nextTop / maxScroll.top;
        const syncedTop = ratio * maxScroll2.top;
        setScrollPosition2(prev => ({ ...prev, top: syncedTop }));
      }
    };
    containerEl.addEventListener('wheel', onWheel, { passive: false });
    return () => containerEl.removeEventListener('wheel', onWheel);
  }, [scrollPosition, maxScroll, maxScroll2]);

  // Wheel handler - segundo
  useEffect(() => {
    const containerEl = scrollableRef2.current;
    if (!containerEl) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const nextTop = Math.max(0, Math.min(maxScroll2.top, scrollPosition2.top + e.deltaY));
      const nextLeft = Math.max(0, Math.min(maxScroll2.left, scrollPosition2.left + e.deltaX));
      setScrollPosition2({ top: nextTop, left: nextLeft });
      
      // Sincronizar com o primeiro container
      if (maxScroll.top > 0) {
        const ratio = nextTop / maxScroll2.top;
        const syncedTop = ratio * maxScroll.top;
        setScrollPosition(prev => ({ ...prev, top: syncedTop }));
      }
    };
    containerEl.addEventListener('wheel', onWheel, { passive: false });
    return () => containerEl.removeEventListener('wheel', onWheel);
  }, [scrollPosition2, maxScroll2, maxScroll]);

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

  // Prevent native scroll from container - segundo
  useEffect(() => {
    const el = scrollableRef2.current;
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
    const trackHeight = containerSize.height; // minus padding if any
    const viewport = containerSize.height;
    const content = contentSize.height;
    const maxTop = Math.max(0, content - viewport);
    if (maxTop <= 0) return;
    const thumbHeight = Math.max(20, (viewport / content) * trackHeight);
    const scrollArea = trackHeight - thumbHeight;
    const deltaY = e.clientY - dragStartRef.current.y;
    const nextTop = Math.max(0, Math.min(maxTop, dragStartRef.current.scrollTop + (deltaY * (maxTop / scrollArea))));
    setScrollPosition(prev => ({ ...prev, top: nextTop }));
    
    // Sincronizar com o segundo container
    if (maxScroll2.top > 0) {
      const ratio = nextTop / maxTop;
      const syncedTop = ratio * maxScroll2.top;
      setScrollPosition2(prev => ({ ...prev, top: syncedTop }));
    }
  };

  const onThumbMouseUp = () => {
    isDraggingRef.current = false;
    document.removeEventListener('mousemove', onThumbMouseMove);
    document.removeEventListener('mouseup', onThumbMouseUp);
  };

  // Drag no segundo thumb
  const onThumbMouseDown2 = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef2.current = true;
    dragStartRef2.current = { y: e.clientY, scrollTop: scrollPosition2.top };
    document.addEventListener('mousemove', onThumbMouseMove2);
    document.addEventListener('mouseup', onThumbMouseUp2);
  };

  const onThumbMouseMove2 = (e: MouseEvent) => {
    if (!isDraggingRef2.current) return;
    const trackHeight = containerSize2.height;
    const viewport = containerSize2.height;
    const content = contentSize2.height;
    const maxTop = Math.max(0, content - viewport);
    if (maxTop <= 0) return;
    const thumbHeight = Math.max(20, (viewport / content) * trackHeight);
    const scrollArea = trackHeight - thumbHeight;
    const deltaY = e.clientY - dragStartRef2.current.y;
    const nextTop = Math.max(0, Math.min(maxTop, dragStartRef2.current.scrollTop + (deltaY * (maxTop / scrollArea))));
    setScrollPosition2(prev => ({ ...prev, top: nextTop }));
    
    // Sincronizar com o primeiro container
    if (maxScroll.top > 0) {
      const ratio = nextTop / maxTop;
      const syncedTop = ratio * maxScroll.top;
      setScrollPosition(prev => ({ ...prev, top: syncedTop }));
    }
  };

  const onThumbMouseUp2 = () => {
    isDraggingRef2.current = false;
    document.removeEventListener('mousemove', onThumbMouseMove2);
    document.removeEventListener('mouseup', onThumbMouseUp2);
  };

  // util opcional foi removida (não usada)

  // Removidos controles externos/commented UI; não usamos setTargetPosition

  return (
    <>
      {/* <div className="container">
        ... toda a UI (título, métricas, controles, botões) ...
      </div> */}

      <div style={{ display: 'flex', gap: '50px', width: '100%' }}>
        {/* Div scrollável controlada (nativo bloqueado) */}
        <div
          ref={scrollableRef}
          className="scrollable-content"
          style={{ margin: '20px', overflow: 'hidden', position: 'relative', paddingRight: 12, height: 'calc(100vh - 40px)', minWidth: '400px', flex: '1' }}
        >
          {/* custom vertical track */}
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
            {/* thumb */}
            <div
              onMouseDown={onThumbMouseDown}
              style={{
                position: 'absolute',
                left: 2,
                width: 8,
                borderRadius: 4,
                background: '#3498db',
                cursor: 'pointer',
                height: `${Math.max(20, (containerSize.height && contentSize.height ? (containerSize.height / contentSize.height) * containerSize.height : 0))}px`,
                top: `${(() => {
                  const viewport = containerSize.height;
                  const content = contentSize.height;
                  const trackH = containerSize.height;
                  const maxTop = Math.max(0, content - viewport);
                  if (maxTop <= 0) return 0;
                  const thumbH = Math.max(20, (viewport / content) * trackH);
                  const scrollArea = trackH - thumbH;
                  return (scrollPosition.top / maxTop) * scrollArea;
                })()}px`
              }}
            />
          </div>

          <div ref={contentRef} className="scrollable-inner" style={{ zIndex: 1 }}>
            <ScrollableContent />
          </div>
        </div>

        {/* Segundo container */}
        <div
          ref={scrollableRef2}
          className="scrollable-content"
          style={{ margin: '20px', overflow: 'hidden', position: 'relative', paddingRight: 12, height: 'calc(100vh - 40px)', minWidth: '400px', flex: '1' }}
        >
          {/* custom vertical track */}
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
            {/* thumb */}
            <div
              onMouseDown={onThumbMouseDown2}
              style={{
                position: 'absolute',
                left: 2,
                width: 8,
                borderRadius: 4,
                background: '#9b59b6',
                cursor: 'pointer',
                height: `${Math.max(20, (containerSize2.height && contentSize2.height ? (containerSize2.height / contentSize2.height) * containerSize2.height : 0))}px`,
                top: `${(() => {
                  const viewport = containerSize2.height;
                  const content = contentSize2.height;
                  const trackH = containerSize2.height;
                  const maxTop = Math.max(0, content - viewport);
                  if (maxTop <= 0) return 0;
                  const thumbH = Math.max(20, (viewport / content) * trackH);
                  const scrollArea = trackH - thumbH;
                  return (scrollPosition2.top / maxTop) * scrollArea;
                })()}px`
              }}
            />
          </div>

          <div ref={contentRef2} className="scrollable-inner" style={{ zIndex: 1 }}>
            <ScrollableContent />
          </div>
        </div>
      </div>
    </>
  );
}

export default ScrollTry3;
