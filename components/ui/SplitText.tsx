'use client';

import React, { useRef } from 'react';
import { motion, useInView, type Variants } from 'framer-motion';

export interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  ease?: string;
  splitType?: 'chars' | 'words' | 'lines' | 'words, chars';
  from?: { opacity?: number; y?: number; x?: number; scale?: number };
  to?: { opacity?: number; y?: number; x?: number; scale?: number };
  threshold?: number;
  rootMargin?: string;
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
  textAlign?: React.CSSProperties['textAlign'];
  onLetterAnimationComplete?: () => void;
}

export default function SplitText({
  text,
  className = '',
  delay = 45,
  duration = 0.7,
  splitType = 'words',
  from = { opacity: 0, y: 30 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  tag = 'h1',
  textAlign = 'left',
  onLetterAnimationComplete
}: SplitTextProps) {
  const ref = useRef<HTMLHeadingElement>(null);
  const isInView = useInView(ref, { once: true, amount: threshold });

  const isCharSplit = splitType === 'chars' || splitType === 'words, chars';
  const units = isCharSplit ? text.split('') : text.split(' ');

  const containerVariants: Variants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: delay / 1000,
        delayChildren: 0.05
      }
    }
  };

  const itemVariants: Variants = {
    hidden: {
      opacity: from.opacity ?? 0,
      y: from.y ?? 30,
      x: from.x ?? 0,
      scale: from.scale ?? 1
    },
    visible: {
      opacity: to.opacity ?? 1,
      y: to.y ?? 0,
      x: to.x ?? 0,
      scale: to.scale ?? 1,
      transition: {
        duration: duration,
        ease: 'easeOut'
      }
    }
  };

  const Component = motion[tag || 'h1'];

  return (
    <Component
      ref={ref}
      className={`inline-block ${className}`}
      style={{ textAlign, wordBreak: 'break-word' }}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      onAnimationComplete={onLetterAnimationComplete}
    >
      {units.map((unit, index) => (
        <motion.span
          key={index}
          variants={itemVariants}
          className="inline-block whitespace-pre"
        >
          {unit}
          {!isCharSplit && index < units.length - 1 ? '\u00A0' : ''}
        </motion.span>
      ))}
    </Component>
  );
}
