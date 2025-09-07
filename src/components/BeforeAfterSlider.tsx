"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./BeforeAfterSlider.module.css";

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeAlt?: string;
  afterAlt?: string;
  className?: string;
}

export default function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeAlt = "Before",
  afterAlt = "After",
  className = "",
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Event handlers
  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    setIsDragging(true);
    event.preventDefault();
  }, []);

  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    setIsDragging(true);
    event.preventDefault();
  }, []);

  const handleMove = useCallback((event: MouseEvent | TouchEvent) => {
    if (!isDragging || !sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    
    setSliderPosition(percentage);
  }, [isDragging]);

  const handleUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Global event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleUp);
      document.addEventListener('touchmove', handleMove);
      document.addEventListener('touchend', handleUp);

      return () => {
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleUp);
        document.removeEventListener('touchmove', handleMove);
        document.removeEventListener('touchend', handleUp);
      };
    }
  }, [isDragging, handleMove, handleUp]);

  return (
    <div 
      className={`${styles.beforeAfterSlider} ${className}`}
      ref={sliderRef}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* Before Image */}
      <div className={styles.beforeImage}>
        <Image
          src={beforeImage}
          alt={beforeAlt}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          style={{ objectFit: "cover" }}
          priority
        />
      </div>
      
      {/* After Image */}
      <div 
        className={styles.afterImage} 
        style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
      >
        <Image
          src={afterImage}
          alt={afterAlt}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          style={{ objectFit: "cover" }}
          priority
        />
      </div>
      
      {/* Slider Handle */}
      <div className={styles.sliderHandle} style={{ left: `${sliderPosition}%` }}>
        <div className={styles.sliderLine}></div>
        <div className={styles.sliderButton}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M8 7l4-4 4 4M8 17l4 4 4-4M12 3v18"/>
          </svg>
        </div>
      </div>
      
      {/* Labels */}
      <div className={styles.sliderLabels}>
        <span className={styles.beforeLabel}>Before</span>
        <span className={styles.afterLabel}>After</span>
      </div>
    </div>
  );
}