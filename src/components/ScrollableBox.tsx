import React, { useCallback, useEffect, useRef, useState } from 'react';
import styles from './ScrollableBox.module.css';

const ScrollableBox: React.FC = () => {
  const scrollTrackRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const offset = 100; // pixels to keep between scrollbar top and real content
  const contentHeight = 1000; // base height for the filler paragraphs

  // numbered paragraphs so you can identify each block visually
  const paragraphs = Array.from({ length: 12 }, (_, index) => (
    <p key={index} className={styles.paragraph}>
      <strong>{index + 1}.</strong> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus.
      Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices
      diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi. Proin porttitor, orci nec nonummy
      molestie, enim est eleifend mi, non fermentum diam nisl sit amet erat. Duis semper. Duis arcu massa,
      scelerisque vitae, consequat in, pretium a, enim. Pellentesque congue.
    </p>
  ));

  const [translation, setTranslation] = useState(0); // tracks the visual shift driven by the hidden scrollbar

  // start the fake scrollbar at the 100px offset to simulate the reduced range
  useEffect(() => {
    if (scrollTrackRef.current) {
      scrollTrackRef.current.scrollTop = offset;
    }
  }, [offset]);

  const handleScroll = useCallback(() => {
    const track = scrollTrackRef.current;
    if (!track || !contentRef.current) {
      return;
    }

    const minScroll = offset;
    const maxScroll = contentHeight + offset - track.clientHeight;
    let nextTop = track.scrollTop;

    if (nextTop < minScroll) {
      nextTop = minScroll;
    } else if (nextTop > maxScroll) {
      nextTop = maxScroll;
    }

    if (nextTop !== track.scrollTop) {
      track.scrollTop = nextTop;
    }

    setTranslation(-(nextTop - offset));
  }, [contentHeight, offset]);

  return (
    <div className={styles.scrollableWrapper}>
      {/* hidden viewport that receives the translated content */}
      <div className={styles.viewport}>
        <div
          ref={contentRef}
          className={styles.content}
          style={{
            transform: `translateY(${translation}px)`,
          }}
        >
          {paragraphs}
        </div>
      </div>
      {/* invisible scroll tracker that drives the offsets */}
      <div ref={scrollTrackRef} onScroll={handleScroll} className={styles.scrollTrack}>
        <div
          className={styles.spacer}
          style={{ height: contentHeight + offset }}
        />
      </div>
    </div>
  );
};

export default ScrollableBox;


