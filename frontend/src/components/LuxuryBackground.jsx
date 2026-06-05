import React, { useEffect, useRef } from 'react';

export const LuxuryBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle class
    class Particle {
      constructor() {
        this.reset(true);
      }

      reset(init = false) {
        this.x = Math.random() * canvas.width;
        this.y = init ? Math.random() * canvas.height : canvas.height + 10;
        this.size = Math.random() * 1.5 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.25;
        this.speedY = -(Math.random() * 0.4 + 0.1); // Always floats upwards
        this.opacity = Math.random() * 0.4 + 0.15;
        this.maxOpacity = this.opacity;
        this.fadeSpeed = Math.random() * 0.005 + 0.002;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Fade near top/bottom edges
        if (this.y < 50) {
          this.opacity -= this.fadeSpeed;
        }

        // Reset if goes offscreen or fully faded
        if (this.y < -10 || this.x < -10 || this.x > canvas.width + 10 || this.opacity <= 0) {
          this.reset(false);
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212, 164, 55, ${this.opacity})`;
        ctx.fill();
      }
    }

    // Initialize particles
    const particleCount = Math.min(60, Math.floor((window.innerWidth * window.innerHeight) / 25000));
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden bg-transparent">
      {/* Drifting Canvas Particles */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full opacity-60 mix-blend-screen"
      />

      {/* Luxury Subtle Moving Pattern Grid Overlay */}
      <div className="absolute inset-0 opacity-[0.015] bg-[radial-gradient(rgba(212,164,55,0.15)_1px,transparent_1px)] [background-size:32px_32px] pointer-events-none" />
    </div>
  );
};

export default LuxuryBackground;
