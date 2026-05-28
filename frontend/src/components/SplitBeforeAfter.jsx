import React, { useState, useRef, useEffect } from 'react';

const SplitBeforeAfter = ({ beforeImage, afterImage, beforeLabel = "Before", afterLabel = "After" }) => {
  const [sliderPosition, setSliderPosition] = useState(50); // 50% slider value
  const [containerWidth, setContainerWidth] = useState(500);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const updateWidth = () => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.getBoundingClientRect().width);
    }
  };

  useEffect(() => {
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const handleMove = React.useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const position = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(position);
  }, []);

  const handleTouchMove = React.useCallback((e) => {
    if (e.touches && e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  }, [handleMove]);

  const handleMouseMove = React.useCallback((e) => {
    handleMove(e.clientX);
  }, [handleMove]);

  const onDragStart = () => {
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);

    const onMove = (e) => {
      if (!isDragging) return;
      if (e.type === 'touchmove') {
        handleTouchMove(e);
      } else {
        handleMouseMove(e);
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', onMove);
      window.addEventListener('touchmove', onMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleTouchMove]);

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[4/3] rounded-lg overflow-hidden select-none cursor-ew-resize border border-viva-gold/20 shadow-gold-glow"
      onMouseDown={onDragStart}
      onTouchStart={onDragStart}
    >
      {/* Before Image (Base Layer) */}
      <img
        src={beforeImage}
        alt="Before transformation"
        className="absolute inset-0 w-full h-full object-cover"
        draggable="false"
      />
      <div className="absolute bottom-4 left-4 z-10 bg-viva-black/80 px-3 py-1 rounded text-xs font-semibold tracking-wider text-viva-white border border-white/10 uppercase">
        {beforeLabel}
      </div>

      {/* After Image (Top Sliding Layer) */}
      <div
        className="absolute inset-y-0 left-0 overflow-hidden"
        style={{ width: `${sliderPosition}%` }}
      >
        <img
          src={afterImage}
          alt="After transformation"
          className="absolute top-0 left-0 h-full object-cover max-w-none"
          style={{ width: `${containerWidth}px` }}
          draggable="false"
        />
      </div>
      <div 
        className="absolute bottom-4 right-4 z-10 bg-viva-gold px-3 py-1 rounded text-xs font-bold tracking-wider text-viva-black uppercase shadow-md"
        style={{ opacity: sliderPosition < 90 ? 1 : 0, transition: 'opacity 0.2s' }}
      >
        {afterLabel}
      </div>

      {/* Vertical Slider Bar */}
      <div
        className="absolute inset-y-0 w-0.5 bg-viva-gold pointer-events-none"
        style={{ left: `${sliderPosition}%` }}
      >
        {/* Drag Handle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-viva-gold border-2 border-viva-black flex items-center justify-center shadow-gold-glow pointer-events-none">
          <svg className="w-5 h-5 text-viva-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default SplitBeforeAfter;
