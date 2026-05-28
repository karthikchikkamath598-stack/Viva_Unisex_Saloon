import React, { useEffect, useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, useMotionValue, useSpring } from 'framer-motion';

const CustomCursor = () => {
  const [hidden, setHidden] = useState(true);
  const [clicked, setClicked] = useState(false);
  const [hovered, setHovered] = useState(false);

  // Mouse coordinates motion values
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Spring physics for trailing ring
  const ringX = useSpring(mouseX, { damping: 25, stiffness: 250, mass: 0.4 });
  const ringY = useSpring(mouseY, { damping: 25, stiffness: 250, mass: 0.4 });

  // Spring physics for background glow
  const glowX = useSpring(mouseX, { damping: 40, stiffness: 120, mass: 0.8 });
  const glowY = useSpring(mouseY, { damping: 40, stiffness: 120, mass: 0.8 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (hidden) setHidden(false);
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

    const attachHoverHandlers = () => {
      const elements = document.querySelectorAll('a, button, select, input, textarea, [role="button"], .interactive-card, .timeline-item, .viva-input');
      elements.forEach(el => {
        if (el.dataset.hasCursorHandler) return;
        
        el.addEventListener('mouseenter', () => setHovered(true));
        el.addEventListener('mouseleave', () => setHovered(false));
        el.dataset.hasCursorHandler = 'true';
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    
    const interval = setInterval(attachHoverHandlers, 800);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      clearInterval(interval);
    };
  }, [mouseX, mouseY, hidden]);

  if (hidden) return null;

  return (
    <>
      {/* Dynamic Background Glow Spotlight */}
      <motion.div
        className="fixed pointer-events-none z-[9998] w-[350px] h-[350px] rounded-full hidden md:block mix-blend-screen"
        style={{
          left: glowX,
          top: glowY,
          translateX: '-50%',
          translateY: '-50%',
          background: 'radial-gradient(circle, rgba(212, 164, 55, 0.04) 0%, rgba(212, 164, 55, 0.003) 60%, rgba(0, 0, 0, 0) 100%)',
        }}
      />

      {/* Trailing Outer Ring (White Circle) */}
      <motion.div
        className="fixed pointer-events-none z-[99999] rounded-full border border-white/40 hidden md:block"
        style={{
          left: ringX,
          top: ringY,
          translateX: '-50%',
          translateY: '-50%',
          width: 20,
          height: 20,
        }}
        animate={{
          width: clicked ? 12 : hovered ? 28 : 20,
          height: clicked ? 12 : hovered ? 28 : 20,
          borderColor: clicked ? 'rgba(255, 255, 255, 0.9)' : hovered ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 255, 255, 0.35)',
          backgroundColor: clicked ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0)',
        }}
        transition={{ type: 'spring', damping: 20, stiffness: 300, mass: 0.2 }}
      />
    </>
  );
};

export default CustomCursor;
