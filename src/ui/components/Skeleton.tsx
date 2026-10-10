import React from 'react';
import { cn } from '../../shared/utils/cn';

interface SkeletonProps {
  key?: string | number;
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse-slow rounded-md bg-white/5 border border-white/5', className)}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-video w-full rounded-2xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

export function GridItemSkeleton() {
  return (
    <div className="flex h-40 overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02]">
      <Skeleton className="w-1/3 h-full rounded-none" />
      <div className="w-2/3 p-5 flex flex-col justify-center space-y-3">
        <div className="flex justify-between items-center">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-4 w-10" />
        </div>
        <Skeleton className="h-5 w-full" />
        <div className="space-y-2">
          <Skeleton className="h-3 w-full opacity-50" />
          <Skeleton className="h-3 w-4/5 opacity-50" />
        </div>
      </div>
    </div>
  );
}
