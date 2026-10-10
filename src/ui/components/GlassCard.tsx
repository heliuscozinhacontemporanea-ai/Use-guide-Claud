import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';
import { cn } from '../../shared/utils/cn';

export interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  variant?: 'default' | 'vibrant' | 'none';
}

export function GlassCard({
  children,
  className,
  variant = 'default',
  onClick,
  ...props
}: GlassCardProps) {
  const variantClass =
    variant === 'vibrant' ? 'glassmorphism-vibrant' : variant === 'default' ? 'glassmorphism' : '';

  return (
    <motion.div
      whileHover={onClick ? { scale: 0.98 } : {}}
      whileTap={onClick ? { scale: 0.95 } : {}}
      onClick={onClick}
      className={cn(
        'rounded-[2.5rem] overflow-hidden transition-all duration-300',
        variantClass,
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
