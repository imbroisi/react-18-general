import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
  useRef,
} from 'react';

interface ScrollControlContextType {
  resetScrollbar: () => void;
  scrollBarPosition: number;
  registerScrollable: (ref: HTMLDivElement, innerRef?: HTMLDivElement) => () => void;
  updateScrollPosition: (position: number) => void;
}

interface ScrollControlProviderProps {
  children: ReactNode;
}

const SCROLLBAR_TOP_MARGIN = 200;
const SCROLL_RESET_SPEED = 200;

const ScrollControlContext = createContext<ScrollControlContextType | undefined>(undefined);

export const ScrollControlProvider = ({ children }: ScrollControlProviderProps) => {
  const [scrollBarPosition, setScrollBarPosition] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollableElements = useRef<Set<HTMLDivElement>>(new Set());
  // const scrollRef = useRef<HTMLDivElement>(null);

  const getMaxScrollTop = useCallback(() => {
    const elements = Array.from(scrollableElements.current);
    if (elements.length === 0) return 0;
    // Use the minimum max scroll among registered elements to keep them in sync
    let minMax = Infinity;
    for (const el of elements) {
      const maxForEl = Math.max(0, el.scrollHeight - el.clientHeight);
      if (maxForEl < minMax) minMax = maxForEl;
    }
    return minMax === Infinity ? 0 : minMax;
  }, []);

  const resetScrollbar = useCallback(() => {
    const startPosition = scrollBarPosition;
    const targetPosition = 0;
    const duration = SCROLL_RESET_SPEED;
    // equivalent to Date.now() with better performance
    const startTime = performance.now();

    const animateReset = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentPosition = startPosition + (targetPosition - startPosition) * easeOut;

      setScrollBarPosition(currentPosition);

      // Direct DOM updates for immediate synchronization
      scrollableElements.current.forEach(element => {
        element.scrollTop = currentPosition;
      });

      if (progress < 1) {
        requestAnimationFrame(animateReset);
      }
    };

    // more efficient than setTimeout() for UI updates
    requestAnimationFrame(animateReset);
  }, [scrollBarPosition]);

  /**
   * scroll bar processing
   */
  const updateScrollPosition = useCallback((position: number) => {
    const maxScrollTop = getMaxScrollTop();
    const clampedPosition = Math.max(0, Math.min(position, maxScrollTop));
    setScrollBarPosition(clampedPosition);
    // Direct DOM updates for immediate synchronization
    scrollableElements.current.forEach(element => {
      element.scrollTop = clampedPosition;
    });
  }, [getMaxScrollTop]);

  /**
   * wheel processing 
   */
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // Only handle wheel events within the provider's children
      if (!containerRef.current || !containerRef.current.contains(e.target as Node)) {
        return;
      }

      // Prevent default scroll behavior in all children (columns), let this context's scroll control handle it
      e.preventDefault();
      e.stopPropagation();

      const maxScrollTop = getMaxScrollTop();
      const next = scrollBarPosition + e.deltaY;
      const clampedPosition = Math.max(0, Math.min(next, maxScrollTop));
      setScrollBarPosition(clampedPosition);
      // Direct DOM updates for immediate pixel-perfect synchronization
      scrollableElements.current.forEach(element => {
        element.scrollTop = clampedPosition;
      });
    };

    document.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      document.removeEventListener('wheel', handleWheel);
    };
  }, [scrollBarPosition, getMaxScrollTop]);

  const registerScrollable = useCallback((ref: HTMLDivElement, innerRef?: HTMLDivElement) => {
    scrollableElements.current.add(ref);
    if (innerRef) {
      const elements = Array.from(scrollableElements.current);

      innerRef.style.height = `${elements[1].scrollHeight}px`;

      const height = ref.clientHeight;
      const scrollHeight = height - SCROLLBAR_TOP_MARGIN;
      const scale = scrollHeight / height;

      ref.style.transform = `scaleY(${scale})`;
      ref.style.bottom = `-${SCROLLBAR_TOP_MARGIN / 2}px`;
    }

    // Different from window.onresize, ResizeObserver observes a specific element’s size changes.
    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        // update Column3 height when screen size changes
        const elements = Array.from(scrollableElements.current);
        const column2 = elements[1];
        const column3 = elements[2];
        column3.style.height = `${column2.clientHeight}px`;
      });
    });

    // Observe the window/document for screen size changes
    resizeObserver.observe(document.body);

    const handleScroll = () => {
      const maxScrollTop = getMaxScrollTop();
      const next = Math.max(0, Math.min(ref.scrollTop, maxScrollTop));
      updateScrollPosition(next);
    };

    ref.addEventListener('scroll', handleScroll);

    return () => {
      scrollableElements.current.delete(ref);
      ref.removeEventListener('scroll', handleScroll);
      resizeObserver.disconnect();
    };
  }, [updateScrollPosition, getMaxScrollTop]);

  const value: ScrollControlContextType = {
    resetScrollbar,
    scrollBarPosition,
    registerScrollable,
    updateScrollPosition
  };

  return (
    <ScrollControlContext.Provider value={value}>
      {/* cloneElement/containerRef are used to detect whether mouse events are coming from any child of the provider */}
      {/* this way it is not necessary to process mouse events in each child */}
      {React.cloneElement(children as React.ReactElement<any>, { ref: containerRef })};
    </ScrollControlContext.Provider>
  );
};

export const useScrollControl = (): ScrollControlContextType => {
  const context = useContext(ScrollControlContext);
  if (context === undefined) {
    throw new Error('useScrollControl must be used within a ScrollControlProvider');
  }
  return context;
};
