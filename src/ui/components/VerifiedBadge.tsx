import React from 'react';
import { BadgeCheck } from 'lucide-react';
import { cn } from '../../shared/utils/cn';
import { motion } from 'motion/react';

interface VerifiedBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function VerifiedBadge({ size = 'md', className }: VerifiedBadgeProps) {
  const sizeClasses = {
    sm: 'w-[0.8em] h-[0.8em]',
    md: 'w-[0.8em] h-[0.8em]',
    lg: 'w-[1.1em] h-[1.1em]',
  };

  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        'inline-flex items-center justify-center shrink-0 align-middle select-none',
        className
      )}
    >
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="verified-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
      </svg>
      <BadgeCheck
        className={cn(sizeClasses[size])}
        style={{
          fill: 'url(#verified-gradient)',
          stroke: 'white',
          strokeWidth: '1.5px',
        }}
      />
    </motion.div>
  );
}
