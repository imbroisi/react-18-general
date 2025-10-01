import { useEffect, useRef } from 'react';

interface UseBlockThumbDragOptions {
  enabled?: boolean;
  debug?: boolean;
  onThumbMove?: (position: { scrollTop: number; scrollLeft: number; scrollPercentageV: number; scrollPercentageH: number }) => void;
  allowWheelScroll?: boolean;
  allowKeyboardScroll?: boolean;
}

export const useBlockThumbDrag = (
  elementRef: React.RefObject<HTMLElement | null>,
  options: UseBlockThumbDragOptions = {}
) => {
  const { 
    enabled = true, 
    debug = false, 
    onThumbMove,
    allowWheelScroll = true,
    allowKeyboardScroll = true 
  } = options;
  
  const isThumbDraggingRef = useRef(false);
  const lastValidScrollPositionRef = useRef({ top: 0, left: 0 });
  const isWheelScrollingRef = useRef(false);
  const isKeyboardScrollingRef = useRef(false);
  const dragStartPositionRef = useRef({ mouseY: 0, mouseX: 0, scrollTop: 0, scrollLeft: 0 });
  const thumbDragModeRef = useRef<'vertical' | 'horizontal' | null>(null);

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
        if (debug) console.log('🚫 Scrollbar detected - capturing thumb interaction');
        
        isThumbDraggingRef.current = true;
        thumbDragModeRef.current = inVerticalScrollbar ? 'vertical' : 'horizontal';
        
        // Store drag start position
        dragStartPositionRef.current = {
          mouseY: e.clientY,
          mouseX: e.clientX,
          scrollTop: element.scrollTop,
          scrollLeft: element.scrollLeft
        };
        
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
        thumbDragModeRef.current = null;
      }
    };

    // Global mouse move handler during drag
    const handleMouseMove = (e: MouseEvent) => {
      if (isThumbDraggingRef.current) {
        // Let the browser handle thumb movement naturally
        // The scroll event will capture the position changes
        if (debug) console.log('🎯 Mouse move during thumb drag');
      }
    };

    // Intercept scroll events
    const handleScroll = (e: Event) => {
      if (isThumbDraggingRef.current) {
        // Allow thumb scrolling to update scrollbar position, but notify parent
        if (debug) console.log('🎯 Thumb scroll detected - notifying parent');
        
        if (onThumbMove) {
          const maxScrollTop = element.scrollHeight - element.clientHeight;
          const maxScrollLeft = element.scrollWidth - element.clientWidth;
          const scrollPercentageV = maxScrollTop > 0 ? (element.scrollTop / maxScrollTop) * 100 : 0;
          const scrollPercentageH = maxScrollLeft > 0 ? (element.scrollLeft / maxScrollLeft) * 100 : 0;
          
          onThumbMove({
            scrollTop: element.scrollTop,
            scrollLeft: element.scrollLeft,
            scrollPercentageV,
            scrollPercentageH
          });
        }
        
        // Update last valid position
        lastValidScrollPositionRef.current = {
          top: element.scrollTop,
          left: element.scrollLeft
        };
      } else {
        // Block wheel and keyboard scrolling if not allowed
        const shouldBlockScroll = (!allowWheelScroll && isWheelScrollingRef.current) ||
                                 (!allowKeyboardScroll && isKeyboardScrollingRef.current);
        
        if (shouldBlockScroll) {
          if (debug) {
            if (!allowWheelScroll && isWheelScrollingRef.current) console.log('🚫 Blocking wheel scroll');
            if (!allowKeyboardScroll && isKeyboardScrollingRef.current) console.log('🚫 Blocking keyboard scroll');
          }
          element.scrollTop = lastValidScrollPositionRef.current.top;
          element.scrollLeft = lastValidScrollPositionRef.current.left;
        } else {
          // Allow scrolling and update position
          lastValidScrollPositionRef.current = {
            top: element.scrollTop,
            left: element.scrollLeft
          };
          
          if (debug && isWheelScrollingRef.current) console.log('✅ Wheel scroll allowed');
          if (debug && isKeyboardScrollingRef.current) console.log('✅ Keyboard scroll allowed');
        }
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
