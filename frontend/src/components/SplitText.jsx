import React from 'react';
import { motion } from 'framer-motion';

export const SplitText = ({ 
  text, 
  type = 'char', 
  className = '', 
  stagger = 0.03, 
  delay = 0,
  variant = 'hero-reveal',
  highlightWords = [] // Words that should get gold shine gradient
}) => {
  if (!text) return null;

  // Variants for individual characters/words
  const charVariants = {
    hidden: { 
      opacity: 0, 
      y: 25, 
      filter: 'blur(8px)',
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      filter: 'blur(0px)',
      scale: 1,
      transition: { 
        duration: 0.8, 
        ease: [0.16, 1, 0.3, 1] 
      }
    }
  };

  const wordVariants = {
    hidden: { 
      opacity: 0, 
      y: '60%', 
      rotate: 4
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      rotate: 0,
      transition: { 
        duration: 0.7, 
        ease: [0.16, 1, 0.3, 1] 
      }
    }
  };

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        delayChildren: delay,
        staggerChildren: stagger,
      }
    }
  };

  if (type === 'word') {
    const words = text.split(' ');
    return (
      <motion.span 
        className={`inline-block overflow-hidden py-1 ${className}`}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
      >
        {words.map((word, idx) => {
          const isHighlighted = highlightWords.some(hw => 
            word.toLowerCase().includes(hw.toLowerCase())
          );
          
          return (
            <span key={idx} className="inline-block overflow-hidden mr-3">
              <motion.span 
                variants={wordVariants}
                className={`inline-block ${isHighlighted ? 'gold-shine-text font-semibold' : ''}`}
              >
                {word}
              </motion.span>
            </span>
          );
        })}
      </motion.span>
    );
  }

  // Character splitting (default)
  const chars = text.split('');
  return (
    <motion.span 
      className={`inline-block ${className}`}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      style={{ letterSpacing: '0.08em' }}
    >
      {chars.map((char, idx) => (
        <motion.span 
          key={idx} 
          variants={charVariants} 
          className="inline-block origin-bottom"
          style={{ display: char === ' ' ? 'inline' : 'inline-block' }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </motion.span>
  );
};

export default SplitText;
