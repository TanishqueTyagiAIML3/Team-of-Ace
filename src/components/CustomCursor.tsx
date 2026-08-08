import React, { useEffect, useState } from 'react';
import { motion, useSpring } from 'motion/react';

export const CustomCursor: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  // Smooth springs for cursor positioning
  const cursorX = useSpring(-100, { stiffness: 500, damping: 28 });
  const cursorY = useSpring(-100, { stiffness: 500, damping: 28 });

  // Outer ring slightly lagging for smooth inertia effect
  const ringX = useSpring(-100, { stiffness: 220, damping: 22 });
  const ringY = useSpring(-100, { stiffness: 220, damping: 22 });

  useEffect(() => {
    // Only enable custom cursor on fine pointer devices (desktop mouse)
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    if (isTouch) return;

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      ringX.set(e.clientX);
      ringY.set(e.clientY);
      if (!isVisible) setIsVisible(true);

      // Check if mouse is hovering an interactive element
      const target = e.target as HTMLElement | null;
      if (target) {
        const interactive = target.closest('button, a, input, select, textarea, [role="button"], .cursor-pointer');
        setIsHovered(!!interactive);
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [cursorX, cursorY, ringX, ringY, isVisible]);

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      {/* Outer Spring Follower Ring / Target Reticle */}
      <motion.div
        style={{
          x: ringX,
          y: ringY,
        }}
        animate={{
          scale: isClicking ? 0.75 : isHovered ? 1.6 : 1,
          opacity: isVisible ? 1 : 0,
        }}
        transition={{ type: 'spring', stiffness: 350, damping: 20 }}
        className="fixed -top-5 -left-5 w-10 h-10 rounded-full border border-cyan-400/60 bg-indigo-500/10 shadow-[0_0_15px_rgba(34,211,238,0.3)] flex items-center justify-center backdrop-blur-[1px]"
      >
        {/* Futuristic Target Crosshair Ticks when hovering */}
        {isHovered && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-[1px] bg-cyan-400/40" />
            <div className="h-full w-[1px] bg-cyan-400/40 absolute" />
          </div>
        )}
      </motion.div>

      {/* Inner Glowing Core Pointer Dot */}
      <motion.div
        style={{
          x: cursorX,
          y: cursorY,
        }}
        animate={{
          scale: isClicking ? 1.4 : isHovered ? 0.6 : 1,
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 28 }}
        className="fixed -top-1.5 -left-1.5 w-3 h-3 rounded-full bg-gradient-to-tr from-cyan-400 to-indigo-400 shadow-[0_0_10px_#22d3ee]"
      />
    </div>
  );
};
