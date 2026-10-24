import { Z_INDEX } from '../../../../shared/constants/zIndex';
import { cn } from '../../../../shared/utils/cn';
import { PULL_REFRESH_THRESHOLD } from '../../hooks/usePullToRefresh';

interface PullRefreshIndicatorProps {
  pullDistance: number;
  isPulling: boolean;
  isRefreshing: boolean;
}

export function PullRefreshIndicator({
  pullDistance,
  isPulling,
  isRefreshing,
}: PullRefreshIndicatorProps) {
  if (pullDistance < 20 && !isRefreshing) return null;
  return (
    <div
      className="fixed left-0 right-0 pointer-events-none select-none flex justify-center"
      style={{
        zIndex: Z_INDEX.toast,
        top: isRefreshing ? '84px' : `${54 + pullDistance * 0.45}px`,
        opacity: isRefreshing ? 1 : Math.min((pullDistance - 20) / 36, 1),
        transform: `scale(${isRefreshing ? 1 : Math.min(0.5 + (pullDistance / PULL_REFRESH_THRESHOLD) * 0.5, 1)})`,
        transition: isPulling
          ? 'none'
          : 'top 200ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity 200ms, transform 200ms cubic-bezier(0.2, 0.8, 0.2, 1)',
      }}
    >
      <div
        className={cn(
          'w-11 h-11 rounded-full backdrop-blur-xl flex items-center justify-center relative transition-all duration-300',
          pullDistance >= PULL_REFRESH_THRESHOLD
            ? 'bg-white/25 border border-white/40 shadow-[0_0_12px_rgba(99,102,241,0.4)]'
            : 'bg-white/10 border border-white/20 shadow-md'
        )}
        style={{
          maskImage: 'radial-gradient(circle, transparent 52%, black 53%)',
          WebkitMaskImage: 'radial-gradient(circle, transparent 52%, black 53%)',
        }}
      >
        <svg
          className={cn(
            'w-8 h-8 transform -rotate-90 origin-center absolute',
            isRefreshing && 'animate-spin'
          )}
          viewBox="0 0 36 36"
        >
          <circle cx="18" cy="18" r="13" fill="none" className="stroke-white/5" strokeWidth="2.5" />
          <circle
            cx="18"
            cy="18"
            r="13"
            fill="none"
            className={cn(
              'transition-all duration-300',
              pullDistance >= PULL_REFRESH_THRESHOLD
                ? 'stroke-indigo-400 drop-shadow-[0_0_6px_rgba(129,140,248,0.9)]'
                : 'stroke-indigo-300/70'
            )}
            strokeWidth="2.5"
            strokeDasharray={isRefreshing ? '22 60' : '81.68'} // 2 * pi * r = 2 * 3.14159 * 13 ≈ 81.68
            strokeDashoffset={
              isRefreshing ? 0 : 81.68 - 81.68 * Math.min(pullDistance / PULL_REFRESH_THRESHOLD, 1)
            }
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
}
