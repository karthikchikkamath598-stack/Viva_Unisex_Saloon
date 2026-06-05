import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export const CustomCursor = () => {
  const [hidden, setHidden] = useState(true);
  const [clicked, setClicked] = useState(false);
  const [hoverType, setHoverType] = useState('none'); // 'none' | 'button' | 'card'
  const [magneticCenter, setMagneticCenter] = useState(null); // { x, y } when hovering cards

  // Mouse coordinates (instant)
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Springs for smooth tracking
  // Inner dot (tight and fast)
  const dotX = useSpring(mouseX, { damping: 40, stiffness: 600, mass: 0.1 });
  const dotY = useSpring(mouseY, { damping: 40, stiffness: 600, mass: 0.1 });

  // Outer ring (flowing and responsive)
  const ringX = useSpring(mouseX, { damping: 30, stiffness: 220, mass: 0.5 });
  const ringY = useSpring(mouseY, { damping: 30, stiffness: 220, mass: 0.5 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (hidden) setHidden(false);

      // Check if mouse is over a magnetic element
      const target = e.target;
      const interactiveEl = target.closest('a, button, select, input, textarea, [role="button"], .interactive-card, .timeline-item, .viva-input, .viva-input-morphed');
      
      if (interactiveEl) {
        if (interactiveEl.classList.contains('interactive-card') || 
            interactiveEl.closest('.interactive-card') ||
            interactiveEl.classList.contains('timeline-item')) {
          setHoverType('card');
          // Magnetic attraction: pull ring toward center of card
          const card = interactiveEl.classList.contains('interactive-card') ? interactiveEl : interactiveEl.closest('.interactive-card') || interactiveEl;
          const rect = card.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          setMagneticCenter({ x: centerX, y: centerY });
        } else {
          setHoverType('button');
          setMagneticCenter(null);
        }
      } else {
        setHoverType('none');
        setMagneticCenter(null);
      }
    };

    const handleMouseLeave = () => {
      setHidden(true);
    };

    const handleMouseDown = () => {
      setClicked(true);
    };

    const handleMouseUp = () => {
      setClicked(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [mouseX, mouseY, hidden]);

  // Hook spring coordinates to magnetic center if active
  useEffect(() => {
    if (magneticCenter) {
      ringX.set(magneticCenter.x);
      ringY.set(magneticCenter.y);
    }
  }, [magneticCenter, ringX, ringY]);

  if (hidden) return null;

  return (
    <>
      {/* 1. Gold Ambient Glow Spotlight (only shows on desktop hover) */}
      <motion.div
        className="fixed pointer-events-none z-[9998] w-[280px] h-[280px] rounded-full hidden md:block mix-blend-screen"
        style={{
          left: dotX,
          top: dotY,
          translateX: '-50%',
          translateY: '-50%',
          background: 'radial-gradient(circle, rgba(212, 164, 55, 0.05) 0%, rgba(212, 164, 55, 0.002) 65%, rgba(0, 0, 0, 0) 100%)',
        }}
        animate={{
          scale: hoverType === 'button' ? 1.3 : hoverType === 'card' ? 1.8 : 1,
          opacity: hoverType !== 'none' ? 0.95 : 0.6
        }}
        transition={{ type: 'spring', damping: 30, stiffness: 200 }}
      />

      {/* 2. Custom Gold Outer Ring */}
      <motion.div
        className="fixed pointer-events-none z-[99999] rounded-full border hidden md:block"
        style={{
          left: ringX,
          top: ringY,
          translateX: '-50%',
          translateY: '-50%',
          width: 24,
          height: 24,
          borderColor: '#D4A437',
        }}
        animate={{
          width: clicked ? 16 : hoverType === 'button' ? 44 : hoverType === 'card' ? 68 : 24,
          height: clicked ? 16 : hoverType === 'button' ? 44 : hoverType === 'card' ? 68 : 24,
          borderWidth: hoverType === 'card' ? '1.5px' : '1px',
          borderColor: clicked ? '#F5C65D' : hoverType === 'button' ? '#FFFFFF' : '#D4A437',
          backgroundColor: clicked ? 'rgba(212, 164, 55, 0.05)' : hoverType === 'button' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0)',
          boxShadow: hoverType === 'button' ? '0 0 15px rgba(212, 164, 55, 0.3)' : 'none',
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 220, mass: 0.2 }}
      />

      {/* 3. Custom White Inner Dot */}
      <motion.div
        className="fixed pointer-events-none z-[99999] w-1.5 h-1.5 rounded-full bg-white hidden md:block"
        style={{
          left: dotX,
          top: dotY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          scale: clicked ? 0.6 : hoverType === 'button' ? 0 : hoverType === 'card' ? 1.3 : 1,
          backgroundColor: hoverType === 'button' ? '#D4A437' : '#FFFFFF',
        }}
        transition={{ type: 'spring', damping: 30, stiffness: 400 }}
      />
    </>
  );
};

export default CustomCursor;
