import React, { useRef, useEffect, ReactNode } from 'react';

interface ScrollTry1Props {
  children: ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

const ScrollTry1: React.FC<ScrollTry1Props> = ({ children, style, className }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const blockThumbScrollRef = useRef(false);
  const lastScrollPositionRef = useRef({ top: 0, left: 0 });
  const isWheelScrollingRef = useRef(false);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    // Store initial position
    lastScrollPositionRef.current.top = element.scrollTop;
    lastScrollPositionRef.current.left = element.scrollLeft;

    // Detect scrollbar interaction with more precision
    const handleMouseDown = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const scrollbarWidth = element.offsetWidth - element.clientWidth;
      const scrollbarHeight = element.offsetHeight - element.clientHeight;
      
      const relativeX = e.clientX - rect.left;
      const relativeY = e.clientY - rect.top;
      
      // More precise scrollbar detection
      const inVerticalScrollbar = scrollbarWidth > 0 && relativeX > element.clientWidth;
      const inHorizontalScrollbar = scrollbarHeight > 0 && relativeY > element.clientHeight;
      
      console.log('Mouse down:', {
        relativeX,
        relativeY,
        clientWidth: element.clientWidth,
        clientHeight: element.clientHeight,
        scrollbarWidth,
        scrollbarHeight,
        inVerticalScrollbar,
        inHorizontalScrollbar
      });
      
      if (inVerticalScrollbar || inHorizontalScrollbar) {
        e.preventDefault(); // Prevent default scrollbar behavior
        blockThumbScrollRef.current = true;
        lastScrollPositionRef.current.top = element.scrollTop;
        lastScrollPositionRef.current.left = element.scrollLeft;
        console.log('🚫 Scrollbar interaction detected - blocking thumb scroll');
      }
    };

    // Global mouse up to ensure we catch it even if mouse leaves element
    const handleMouseUp = () => {
      if (blockThumbScrollRef.current) {
        console.log('✅ Mouse released - allowing scroll again');
      }
      blockThumbScrollRef.current = false;
    };

    // Track mouse movement during drag
    const handleMouseMove = (e: MouseEvent) => {
      if (blockThumbScrollRef.current) {
        e.preventDefault();
        console.log('🚫 Mouse move during thumb drag - preventing');
      }
    };

    // Intercept all scroll events
    const handleScroll = (e: Event) => {
      if (blockThumbScrollRef.current && !isWheelScrollingRef.current) {
        // Prevent thumb scrolling by restoring previous position
        console.log('🚫 Thumb scroll prevented - restoring position');
        element.scrollTop = lastScrollPositionRef.current.top;
        element.scrollLeft = lastScrollPositionRef.current.left;
      } else {
        // Update valid position for content scrolling (wheel, keyboard, etc.)
        lastScrollPositionRef.current.top = element.scrollTop;
        lastScrollPositionRef.current.left = element.scrollLeft;
        if (isWheelScrollingRef.current) {
          console.log('✅ Wheel scroll allowed');
        }
      }
      
      // Reset wheel flag after scroll event
      isWheelScrollingRef.current = false;
    };

    // Mark wheel scrolling to allow it
    const handleWheel = (e: WheelEvent) => {
      isWheelScrollingRef.current = true;
      console.log('🎡 Wheel scroll detected - marking as allowed');
      // Don't prevent default - let browser handle wheel scrolling
    };

    // Prevent context menu on scrollbar to avoid interference
    const handleContextMenu = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const scrollbarWidth = element.offsetWidth - element.clientWidth;
      const scrollbarHeight = element.offsetHeight - element.clientHeight;
      
      const relativeX = e.clientX - rect.left;
      const relativeY = e.clientY - rect.top;
      
      const inScrollbar = (scrollbarWidth > 0 && relativeX > element.clientWidth) ||
                         (scrollbarHeight > 0 && relativeY > element.clientHeight);
      
      if (inScrollbar) {
        e.preventDefault();
      }
    };

    // Add event listeners
    element.addEventListener('mousedown', handleMouseDown, { passive: false });
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousemove', handleMouseMove, { passive: false });
    element.addEventListener('scroll', handleScroll, { passive: false });
    element.addEventListener('wheel', handleWheel, { passive: false });
    element.addEventListener('contextmenu', handleContextMenu);

    // Cleanup
    return () => {
      element.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('scroll', handleScroll);
      element.removeEventListener('wheel', handleWheel);
      element.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  const defaultStyle: React.CSSProperties = {
    overflow: 'auto',
    height: '100%',
    width: '100%',
    ...style
  };

  return (
    <div 
      ref={containerRef}
      style={defaultStyle}
      className={className}
    >
      {children}
    </div>
  );
};

export default ScrollTry1;
