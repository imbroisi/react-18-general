import { useEffect, useRef } from 'react';

interface UseBlockThumbDragOptions {
  enabled?: boolean;
  debug?: boolean;
}

export const useBlockThumbDrag = (
  elementRef: React.RefObject<HTMLElement | null>,
  options: UseBlockThumbDragOptions = {}
) => {
  const { enabled = true, debug = false } = options;
  
  const isThumbDraggingRef = useRef(false);
  const lastValidScrollPositionRef = useRef({ top: 0, left: 0 });
  const isWheelScrollingRef = useRef(false);
  const isKeyboardScrollingRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    
    const element = elementRef.current;
    if (!element) return;

    // Initialize scroll position
    lastValidScrollPositionRef.current = {
      top: element.scrollTop,
      left: element.scrollLeft
    };

    // Detect Windows scrollbar interaction
    const handleMouseDown = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      
      // Windows scrollbars take up actual space
      const verticalScrollbarWidth = element.offsetWidth - element.clientWidth;
      const horizontalScrollbarHeight = element.offsetHeight - element.clientHeight;
      
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      // Check if mouse is in scrollbar area (Windows-specific)
      const inVerticalScrollbar = verticalScrollbarWidth > 0 && mouseX >= element.clientWidth;
      const inHorizontalScrollbar = horizontalScrollbarHeight > 0 && mouseY >= element.clientHeight;
      
      if (debug) {
        console.log('🖱️ Mouse Down:', {
          mouseX,
          mouseY,
          clientWidth: element.clientWidth,
          clientHeight: element.clientHeight,
          verticalScrollbarWidth,
          horizontalScrollbarHeight,
          inVerticalScrollbar,
          inHorizontalScrollbar
        });
      }
      
      if (inVerticalScrollbar || inHorizontalScrollbar) {
        if (debug) console.log('🚫 Scrollbar detected - blocking thumb interaction');
        
        isThumbDraggingRef.current = true;
        lastValidScrollPositionRef.current = {
          top: element.scrollTop,
          left: element.scrollLeft
        };
        
        e.preventDefault();
        e.stopPropagation();
      }
    };

    // Global mouse up handler
    const handleMouseUp = () => {
      if (isThumbDraggingRef.current) {
        if (debug) console.log('✅ Mouse released - thumb dragging stopped');
        isThumbDraggingRef.current = false;
      }
    };

    // Global mouse move handler during drag
    const handleMouseMove = (e: MouseEvent) => {
      if (isThumbDraggingRef.current) {
        if (debug) console.log('🚫 Preventing mouse move during thumb drag');
        e.preventDefault();
        e.stopPropagation();
      }
    };

    // Intercept scroll events
    const handleScroll = (e: Event) => {
      if (isThumbDraggingRef.current && !isWheelScrollingRef.current && !isKeyboardScrollingRef.current) {
        // Block thumb-initiated scrolling
        if (debug) console.log('🚫 Blocking thumb scroll - restoring position');
        element.scrollTop = lastValidScrollPositionRef.current.top;
        element.scrollLeft = lastValidScrollPositionRef.current.left;
      } else {
        // Allow wheel/keyboard scrolling
        lastValidScrollPositionRef.current = {
          top: element.scrollTop,
          left: element.scrollLeft
        };
        
        if (debug && isWheelScrollingRef.current) console.log('✅ Wheel scroll allowed');
        if (debug && isKeyboardScrollingRef.current) console.log('✅ Keyboard scroll allowed');
      }
      
      // Reset flags
      isWheelScrollingRef.current = false;
      isKeyboardScrollingRef.current = false;
    };

    // Allow wheel scrolling
    const handleWheel = (e: WheelEvent) => {
      isWheelScrollingRef.current = true;
      if (debug) console.log('🎡 Wheel scroll detected');
    };

    // Allow keyboard scrolling
    const handleKeyDown = (e: KeyboardEvent) => {
      const scrollKeys = [32, 33, 34, 35, 36, 37, 38, 39, 40];
      if (scrollKeys.includes(e.keyCode)) {
        isKeyboardScrollingRef.current = true;
        if (debug) console.log('⌨️ Keyboard scroll detected');
      }
    };

    // Add event listeners
    element.addEventListener('mousedown', handleMouseDown, { passive: false });
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousemove', handleMouseMove, { passive: false });
    element.addEventListener('scroll', handleScroll, { passive: false });
    element.addEventListener('wheel', handleWheel);
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      element.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('scroll', handleScroll);
      element.removeEventListener('wheel', handleWheel);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [elementRef, enabled, debug]);

  // Return control functions if needed
  return {
    isThumbDragging: isThumbDraggingRef.current,
    resetPosition: () => {
      const element = elementRef.current;
      if (element) {
        element.scrollTop = lastValidScrollPositionRef.current.top;
        element.scrollLeft = lastValidScrollPositionRef.current.left;
      }
    }
  };
};
