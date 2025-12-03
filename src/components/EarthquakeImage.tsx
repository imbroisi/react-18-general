import React, { useState, useEffect, useRef } from 'react';
import carlSaganImage from '../images/carl_sagan.jpg';
import './EarthquakeImage.css';

const EarthquakeImage: React.FC = () => {
  const [frequency, setFrequency] = useState<number>(10); // Hz
  const [amplitude, setAmplitude] = useState<number>(5); // pixels
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!imageRef.current) return;

    const image = imageRef.current;
    let animationFrameId: number;
    let startTime = Date.now();

    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000; // seconds
      const angle = 2 * Math.PI * frequency * elapsed;
      
      // Random vibration in both X and Y directions
      const randomX = (Math.random() - 0.5) * 2 * amplitude;
      const randomY = (Math.random() - 0.5) * 2 * amplitude;
      
      // Combine sine wave with random for more realistic earthquake effect
      const x = Math.sin(angle * 1.3) * amplitude + randomX * 0.5;
      const y = Math.cos(angle * 0.7) * amplitude + randomY * 0.5;
      
      image.style.transform = `translate(${x}px, ${y}px)`;
      
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [frequency, amplitude]);

  return (
    <div className="earthquake-container">
      <div className="controls">
        <div className="control-group">
          <label htmlFor="frequency">
            Frequência: {frequency} Hz
          </label>
          <input
            id="frequency"
            type="range"
            min="1"
            max="30"
            value={frequency}
            onChange={(e) => setFrequency(Number(e.target.value))}
          />
        </div>
        <div className="control-group">
          <label htmlFor="amplitude">
            Amplitude: {amplitude}px
          </label>
          <input
            id="amplitude"
            type="range"
            min="1"
            max="20"
            value={amplitude}
            onChange={(e) => setAmplitude(Number(e.target.value))}
          />
        </div>
      </div>
      <div className="image-wrapper">
        <img
          ref={imageRef}
          src={carlSaganImage}
          alt="Carl Sagan"
          className="earthquake-image"
        />
      </div>
    </div>
  );
};

export default EarthquakeImage;

