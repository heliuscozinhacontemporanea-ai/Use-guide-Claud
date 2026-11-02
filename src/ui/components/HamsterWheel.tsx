import { useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';
import { cn } from '../../shared/utils/cn';
import './HamsterWheel.css';

type Phase = 'stand' | 'look' | 'down' | 'run' | 'up';

const NEXT: Record<Phase, Phase> = {
  stand: 'look',
  look: 'down',
  down: 'run',
  run: 'up',
  up: 'stand',
};

const PHASE_MS: Record<Phase, number> = {
  stand: 800,
  look: 2400,
  down: 500,
  run: 6000,
  up: 500,
};

/**
 * Hamster na roda (página não encontrada): de pé com a roda parada, procura algo, desce, corre 6 s,
 * para e recomeça. Decorativo. Com movimento reduzido, fica de pé e parado. O tamanho vem do
 * `font-size` (a roda tem 12em).
 */
export function HamsterWheel({ className }: { className?: string }) {
  const reducedMotion = useReducedMotion();
  const [phase, setPhase] = useState<Phase>('stand');

  useEffect(() => {
    if (reducedMotion) return;
    const timer = window.setTimeout(() => setPhase(NEXT[phase]), PHASE_MS[phase]);
    return () => window.clearTimeout(timer);
  }, [phase, reducedMotion]);

  return (
    <div
      aria-hidden="true"
      data-phase={reducedMotion ? 'stand' : phase}
      className={cn('ug-hamster-wheel shrink-0', className)}
    >
      <div className="ug-hamster-wheel__wheel" />
      <div className="ug-hamster">
        <div className="ug-hamster__pose">
          <div className="ug-hamster__body">
            <div className="ug-hamster__head">
              <div className="ug-hamster__ear" />
              <div className="ug-hamster__eye" />
              <div className="ug-hamster__nose" />
            </div>
            <div className="ug-hamster__limb--fr" />
            <div className="ug-hamster__limb--fl" />
            <div className="ug-hamster__limb--br" />
            <div className="ug-hamster__limb--bl" />
            <div className="ug-hamster__tail" />
          </div>
        </div>
      </div>
      <div className="ug-hamster-wheel__spoke" />
    </div>
  );
}
