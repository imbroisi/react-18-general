import React, { useRef, useState, useEffect, useCallback } from 'react';
import './Scrollbars.css';
import { SCROLLBAR_CONFIG } from './config';
import Arrow from './Arrow';


export interface ScrollbarsProps {
  children: React.ReactNode;
  onHThumbMove?: (position: { scrollLeft: number; scrollPercentage: number }) => void;
  onVThumbMove?: (position: { scrollTop: number; scrollPercentage: number }) => void;
  mode?: 'normal' | 'alwaysPresent' | 'invisible';
  scrollToVertical?: number;    // Scroll to vertical position (one-time command)
  scrollToHorizontal?: number;  // Scroll to horizontal position (one-time command)
}

const ScrollManager: React.FC<ScrollbarsProps> = ({ children, onHThumbMove, onVThumbMove, mode = 'normal', scrollToVertical, scrollToHorizontal }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const verticalThumbRef = useRef<HTMLDivElement>(null);
  const horizontalThumbRef = useRef<HTMLDivElement>(null);

  const [scrollTop, setScrollTop] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);
  const [isDraggingVertical, setIsDraggingVertical] = useState(false);
  const [isDraggingHorizontal, setIsDraggingHorizontal] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartScrollTop, setDragStartScrollTop] = useState(0);
  const [dragStartScrollLeft, setDragStartScrollLeft] = useState(0);

  // Calculate scrollbar visibility and dimensions
  const needsVerticalScrollbar = contentHeight > containerHeight;
  const needsHorizontalScrollbar = contentWidth > containerWidth;

  // In alwaysPresent mode, always show scrollbars. In invisible mode, never show scrollbars
  const showVerticalScrollbar = mode === 'invisible' ? false : (mode === 'alwaysPresent' || needsVerticalScrollbar);
  const showHorizontalScrollbar = mode === 'invisible' ? false : (mode === 'alwaysPresent' || needsHorizontalScrollbar);

  const originalContainerHeight = containerRef.current ? containerRef.current.clientHeight : containerHeight;
  const originalContainerWidth = containerRef.current ? containerRef.current.clientWidth : containerWidth;

  // Account for scrollbar space in viewport calculations (except in invisible mode)
  const scrollbarSpaceV = (showVerticalScrollbar && mode !== 'invisible') ? SCROLLBAR_CONFIG.width : 0;
  const scrollbarSpaceH = (showHorizontalScrollbar && mode !== 'invisible') ? SCROLLBAR_CONFIG.width : 0;
  const availableViewportHeight = containerHeight - scrollbarSpaceH;
  const availableViewportWidth = containerWidth - scrollbarSpaceV;

  const verticalThumbHeight = needsVerticalScrollbar
    ? Math.max(20, (availableViewportHeight / contentHeight) * (originalContainerHeight - scrollbarSpaceH - 2 * SCROLLBAR_CONFIG.arrowSize))
    : 0;

  const horizontalThumbWidth = needsHorizontalScrollbar
    ? Math.max(20, (availableViewportWidth / contentWidth) * (originalContainerWidth - scrollbarSpaceV - 2 * SCROLLBAR_CONFIG.arrowSize))
    : 0;

  const verticalThumbTop = needsVerticalScrollbar
    ? (scrollTop / (contentHeight - availableViewportHeight)) * (originalContainerHeight - verticalThumbHeight - scrollbarSpaceH - 2 * SCROLLBAR_CONFIG.arrowSize)
    : 0;

  const horizontalThumbLeft = needsHorizontalScrollbar
    ? (scrollLeft / (contentWidth - availableViewportWidth)) * (originalContainerWidth - horizontalThumbWidth - scrollbarSpaceV - 2 * SCROLLBAR_CONFIG.arrowSize)
    : 0;

  // Update dimensions
  const updateDimensions = useCallback(() => {
    if (containerRef.current && contentRef.current) {
      const containerHeight = containerRef.current.clientHeight;
      const containerWidth = containerRef.current.clientWidth;
      const contentHeight = contentRef.current.scrollHeight;
      const contentWidth = contentRef.current.scrollWidth;

      setContainerHeight(containerHeight);
      setContainerWidth(containerWidth);
      setContentHeight(contentHeight);
      setContentWidth(contentWidth);
    }
  }, []);

  // Handle scroll
  const handleScroll = useCallback((newScrollTop: number, newScrollLeft: number) => {
    // Calculate available viewport space (excluding scrollbars) - use show variables for alwaysVisible mode
    const availableHeight = containerHeight - scrollbarSpaceH;
    const availableWidth = containerWidth - scrollbarSpaceV;

    const maxScrollTop = Math.max(0, contentHeight - availableHeight);
    const maxScrollLeft = Math.max(0, contentWidth - availableWidth);

    const clampedScrollTop = Math.max(0, Math.min(maxScrollTop, newScrollTop));
    const clampedScrollLeft = Math.max(0, Math.min(maxScrollLeft, newScrollLeft));

    // Update internal state
    setScrollTop(clampedScrollTop);
    setScrollLeft(clampedScrollLeft);

    // Call callbacks with position information instead of moving content directly
    if (onVThumbMove && clampedScrollTop !== scrollTop) {
      const scrollPercentage = maxScrollTop > 0 ? (clampedScrollTop / maxScrollTop) * 100 : 0;
      onVThumbMove({
        scrollTop: clampedScrollTop,
        scrollPercentage
      });
    }

    if (onHThumbMove && clampedScrollLeft !== scrollLeft) {
      const scrollPercentage = maxScrollLeft > 0 ? (clampedScrollLeft / maxScrollLeft) * 100 : 0;
      onHThumbMove({
        scrollLeft: clampedScrollLeft,
        scrollPercentage
      });
    }
  }, [contentHeight, containerHeight, contentWidth, containerWidth, scrollbarSpaceH, scrollbarSpaceV, onVThumbMove, onHThumbMove, scrollTop, scrollLeft]);

  // Mouse wheel handler - convert wheel events to thumb movements
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();

    // Calculate scroll step (you can adjust this multiplier for sensitivity)
    const scrollStep = 20;
    const deltaY = e.deltaY > 0 ? scrollStep : e.deltaY < 0 ? -scrollStep : 0;
    const deltaX = e.deltaX > 0 ? scrollStep : e.deltaX < 0 ? -scrollStep : 0;

    // Convert wheel movement to thumb movement via handleScroll
    // This will trigger the callbacks instead of direct content movement
    handleScroll(scrollTop + deltaY, scrollLeft + deltaX);
  }, [scrollTop, scrollLeft, handleScroll]);

  // Vertical scrollbar drag handlers
  const handleVerticalMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingVertical(true);
    setDragStartY(e.clientY);
    setDragStartScrollTop(scrollTop);
  }, [scrollTop]);

  // Horizontal scrollbar drag handlers
  const handleHorizontalMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingHorizontal(true);
    setDragStartX(e.clientX);
    setDragStartScrollLeft(scrollLeft);
  }, [scrollLeft]);

  // Arrow button handlers
  const handleVerticalArrowUp = useCallback(() => {
    handleScroll(scrollTop - 20, scrollLeft);
  }, [scrollTop, scrollLeft, handleScroll]);

  const handleVerticalArrowDown = useCallback(() => {
    handleScroll(scrollTop + 20, scrollLeft);
  }, [scrollTop, scrollLeft, handleScroll]);

  const handleHorizontalArrowLeft = useCallback(() => {
    handleScroll(scrollTop, scrollLeft - 20);
  }, [scrollTop, scrollLeft, handleScroll]);

  const handleHorizontalArrowRight = useCallback(() => {
    handleScroll(scrollTop, scrollLeft + 20);
  }, [scrollTop, scrollLeft, handleScroll]);

  // Track click handlers
  const handleVerticalTrackClick = useCallback((e: React.MouseEvent) => {
    if (e.target === verticalThumbRef.current) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickY = e.clientY - rect.top - SCROLLBAR_CONFIG.arrowSize;
    const trackHeight = rect.height - (2 * SCROLLBAR_CONFIG.arrowSize);
    const scrollRatio = clickY / trackHeight;
    const availableHeight = containerHeight - scrollbarSpaceH;
    const newScrollTop = scrollRatio * (contentHeight - availableHeight);

    handleScroll(newScrollTop, scrollLeft);
  }, [contentHeight, containerHeight, scrollbarSpaceH, scrollLeft, handleScroll]);

  const handleHorizontalTrackClick = useCallback((e: React.MouseEvent) => {
    if (e.target === horizontalThumbRef.current) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left - SCROLLBAR_CONFIG.arrowSize;
    const trackWidth = rect.width - (2 * SCROLLBAR_CONFIG.arrowSize);
    const scrollRatio = clickX / trackWidth;
    const availableWidth = containerWidth - scrollbarSpaceV;
    const newScrollLeft = scrollRatio * (contentWidth - availableWidth);

    handleScroll(scrollTop, newScrollLeft);
  }, [contentWidth, containerWidth, scrollbarSpaceV, scrollTop, handleScroll]);

  // Global mouse move and up handlers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingVertical) {
        const deltaY = e.clientY - dragStartY;
        const trackHeight = originalContainerHeight - (2 * SCROLLBAR_CONFIG.arrowSize) - scrollbarSpaceH;
        const scrollRatio = deltaY / (trackHeight - verticalThumbHeight);
        const availableHeight = containerHeight - scrollbarSpaceH;
        const newScrollTop = dragStartScrollTop + scrollRatio * (contentHeight - availableHeight);
        handleScroll(newScrollTop, scrollLeft);
      }

      if (isDraggingHorizontal) {
        const deltaX = e.clientX - dragStartX;
        const trackWidth = originalContainerWidth - (2 * SCROLLBAR_CONFIG.arrowSize) - scrollbarSpaceV;
        const scrollRatio = deltaX / (trackWidth - horizontalThumbWidth);
        const availableWidth = containerWidth - scrollbarSpaceV;
        const newScrollLeft = dragStartScrollLeft + scrollRatio * (contentWidth - availableWidth);
        handleScroll(scrollTop, newScrollLeft);
      }
    };

    const handleMouseUp = () => {
      setIsDraggingVertical(false);
      setIsDraggingHorizontal(false);
    };

    if (isDraggingVertical || isDraggingHorizontal) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [
    isDraggingVertical, isDraggingHorizontal, dragStartY, dragStartX,
    dragStartScrollTop, dragStartScrollLeft, originalContainerHeight, originalContainerWidth,
    verticalThumbHeight, horizontalThumbWidth, contentHeight, contentWidth,
    scrollTop, scrollLeft, handleScroll, scrollbarSpaceH, scrollbarSpaceV,
    containerHeight, containerWidth
  ]);

  // Setup event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, [handleWheel]);

  // Handle scrollTo commands (one-time scroll commands)
  useEffect(() => {
    if (scrollToVertical !== undefined) {
      const availableHeight = containerHeight - scrollbarSpaceH;
      const maxScrollTop = Math.max(0, contentHeight - availableHeight);
      const clampedScrollTop = Math.max(0, Math.min(maxScrollTop, scrollToVertical));

      setScrollTop(clampedScrollTop);

      // Call callback to notify parent of the new position
      if (onVThumbMove) {
        const scrollPercentage = maxScrollTop > 0 ? (clampedScrollTop / maxScrollTop) * 100 : 0;
        onVThumbMove({
          scrollTop: clampedScrollTop,
          scrollPercentage
        });
      }
    }
  }, [scrollToVertical, containerHeight, contentHeight, scrollbarSpaceH, onVThumbMove]);

  useEffect(() => {
    if (scrollToHorizontal !== undefined) {
      const availableWidth = containerWidth - scrollbarSpaceV;
      const maxScrollLeft = Math.max(0, contentWidth - availableWidth);
      const clampedScrollLeft = Math.max(0, Math.min(maxScrollLeft, scrollToHorizontal));

      setScrollLeft(clampedScrollLeft);

      // Call callback to notify parent of the new position
      if (onHThumbMove) {
        const scrollPercentage = maxScrollLeft > 0 ? (clampedScrollLeft / maxScrollLeft) * 100 : 0;
        onHThumbMove({
          scrollLeft: clampedScrollLeft,
          scrollPercentage
        });
      }
    }
  }, [scrollToHorizontal, containerWidth, contentWidth, scrollbarSpaceV, onHThumbMove]);

  // Update dimensions on mount and resize
  useEffect(() => {
    updateDimensions();
    // Reset scroll position to top-left on mount
    setScrollTop(0);
    setScrollLeft(0);

    const resizeObserver = new ResizeObserver(updateDimensions);

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    if (contentRef.current) {
      resizeObserver.observe(contentRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [updateDimensions]);

  return (
    <div
      ref={containerRef}
      className="use-scroll-manager-container"
      style={{
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        height: '100%'
      }}
    >
      {/* Content Viewport */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: scrollbarSpaceV,
          bottom: scrollbarSpaceH,
          overflow: 'hidden'
        }}
      >
        <div
          ref={contentRef}
          className="use-scroll-manager-content"
          style={{
            position: 'absolute',
            top: 0,
            left: 0
          }}
        >
          {children}
        </div>
      </div>

      {/* Vertical Scrollbar */}
      {showVerticalScrollbar && (
        <div
          className="use-scroll-manager-vertical"
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: SCROLLBAR_CONFIG.width,
            height: originalContainerHeight - scrollbarSpaceH,
            backgroundColor: SCROLLBAR_CONFIG.backgroundColor
          }}
          onClick={needsVerticalScrollbar ? handleVerticalTrackClick : undefined}
        >
          {/* Only show interactive elements when scrolling is actually needed */}
          {needsVerticalScrollbar && (
            <>
              <Arrow top onClick={handleVerticalArrowUp} />

              {/* Thumb Vertical */}
              <div
                ref={verticalThumbRef}
                className="use-scroll-manager-thumb use-scroll-manager-thumb-vertical"
                style={{
                  position: 'absolute',
                  top: SCROLLBAR_CONFIG.arrowSize + verticalThumbTop,
                  left: (SCROLLBAR_CONFIG.width - SCROLLBAR_CONFIG.thumbWidth) / 2,
                  width: SCROLLBAR_CONFIG.thumbWidth,
                  height: verticalThumbHeight,
                  backgroundColor: SCROLLBAR_CONFIG.thumbColor,
                  borderRadius: `${SCROLLBAR_CONFIG.thumbWidth / 2}px`,
                  cursor: 'pointer'
                }}
                onMouseDown={handleVerticalMouseDown}
              />

              <Arrow bottom onClick={handleVerticalArrowDown} />
            </>
          )}
        </div>
      )}

      {/* Horizontal Scrollbar */}
      {showHorizontalScrollbar && (
        <div
          className="use-scroll-manager-horizontal"
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: originalContainerWidth - scrollbarSpaceV,
            height: SCROLLBAR_CONFIG.width,
            backgroundColor: SCROLLBAR_CONFIG.backgroundColor,
            overflow: 'visible'
          }}
          onClick={needsHorizontalScrollbar ? handleHorizontalTrackClick : undefined}
        >
          {/* Only show interactive elements when scrolling is actually needed */}
          {needsHorizontalScrollbar && (
            <>
              <Arrow left onClick={handleHorizontalArrowLeft} />

              {/* Thumb Horizontal */}
              <div
                ref={horizontalThumbRef}
                className="use-scroll-manager-thumb use-scroll-manager-thumb-horizontal"
                style={{
                  position: 'absolute',
                  left: SCROLLBAR_CONFIG.arrowSize + horizontalThumbLeft,
                  top: (SCROLLBAR_CONFIG.width - SCROLLBAR_CONFIG.thumbWidth) / 2,
                  height: SCROLLBAR_CONFIG.thumbWidth,
                  width: horizontalThumbWidth,
                  backgroundColor: SCROLLBAR_CONFIG.thumbColor,
                  borderRadius: `${SCROLLBAR_CONFIG.thumbWidth / 2}px`,
                  cursor: 'pointer'
                }}
                onMouseDown={handleHorizontalMouseDown}
              />

              <Arrow right onClick={handleHorizontalArrowRight} />
            </>
          )}
        </div>
      )}

      {/* Corner */}
      {showVerticalScrollbar && showHorizontalScrollbar && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: SCROLLBAR_CONFIG.width,
            height: SCROLLBAR_CONFIG.width,
            backgroundColor: SCROLLBAR_CONFIG.backgroundColor
          }}
        />
      )}
    </div>
  );
};

export default ScrollManager;
