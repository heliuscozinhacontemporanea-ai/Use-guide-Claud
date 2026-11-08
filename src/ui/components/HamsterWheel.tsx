import { cn } from '../../shared/utils/cn';
import './HamsterWheel.css';

/**
 * Hamster correndo na roda (ilustração da página não encontrada). Decorativo: o texto da página diz
 * o que aconteceu. O tamanho vem do `font-size` (a roda tem 12em).
 */
export function HamsterWheel({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn('ug-hamster-wheel shrink-0', className)}>
      <div className="ug-hamster-wheel__wheel" />
      <div className="ug-hamster">
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
      <div className="ug-hamster-wheel__spoke" />
    </div>
  );
}
