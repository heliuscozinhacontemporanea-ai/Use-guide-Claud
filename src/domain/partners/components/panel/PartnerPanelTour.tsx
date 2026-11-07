import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Z_INDEX } from '../../../../shared/constants/zIndex';
import { BUTTON_PRIMARY } from '../../../../ui/styles/controls';
import {
  PANEL_TOUR_STEPS,
  type PanelTourStepId,
  tourTarget,
  visibleTourSteps,
} from '../../utils/panelTourSteps';

const PAD = 8;

/**
 * Tour do painel (etapa 6): destaca cada parte com um balão curto. "Concluir" e "Pular" com
 * "Não mostrar novamente" marcado encerram de vez (na conta); "Pular" sem a caixa volta na próxima
 * abertura do painel.
 */
export function PartnerPanelTour({ onClose }: { onClose: (done: boolean) => void }) {
  const { t } = useTranslation();
  const titleId = useId();
  const cardRef = useRef<HTMLDivElement>(null);
  const [steps, setSteps] = useState<PanelTourStepId[]>([]);
  const [index, setIndex] = useState(0);
  const [neverAgain, setNeverAgain] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const step = steps[index];
  const last = index === steps.length - 1;

  useLayoutEffect(() => {
    const target = step
      ? tourTarget(PANEL_TOUR_STEPS.find((item) => item.id === step)?.target ?? '')
      : null;
    if (!target) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView?.({ block: 'center', behavior: reduce ? 'auto' : 'smooth' });
    const update = () => setRect(target.getBoundingClientRect());
    update();
    const timer = window.setTimeout(update, 350);
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [step]);

  // Lido depois de montar: o painel já está na tela e se sabe quais partes existem agora.
  useLayoutEffect(() => {
    setSteps(visibleTourSteps());
  }, []);

  useEffect(() => {
    if (steps.length > 0) cardRef.current?.focus();
  }, [steps.length]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose(neverAgain);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [neverAgain, onClose]);

  if (!step) return null;
  // Balão embaixo; quando o destaque está na metade de baixo, vai para cima.
  const cardAtTop = rect !== null && rect.top + rect.height / 2 > window.innerHeight / 2;

  return (
    <div className="fixed inset-0" style={{ zIndex: Z_INDEX.modal }}>
      {rect ? (
        <div
          aria-hidden="true"
          className="fixed rounded-2xl ring-2 ring-teal-400 transition-all duration-200 motion-reduce:transition-none"
          style={{
            top: rect.top - PAD,
            left: rect.left - PAD,
            width: rect.width + PAD * 2,
            height: rect.height + PAD * 2,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.62)',
          }}
        />
      ) : (
        <div aria-hidden="true" className="fixed inset-0 bg-black/60" />
      )}
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`fixed left-4 right-4 mx-auto max-w-[480px] p-5 rounded-[24px] bg-surface border border-line shadow-xl space-y-3 outline-none ${
          cardAtTop
            ? 'top-[calc(env(safe-area-inset-top)+16px)]'
            : 'bottom-[calc(env(safe-area-inset-bottom)+16px)]'
        }`}
      >
        <p className="text-[13px] font-semibold text-ink/70">
          {t('partnerTour.progress', { current: index + 1, total: steps.length })}
        </p>
        <h2 id={titleId} className="text-[19px] font-display font-bold text-ink">
          {t(`partnerTour.steps.${step}.title`)}
        </h2>
        <p className="text-[15px] text-ink/80">{t(`partnerTour.steps.${step}.text`)}</p>
        <label className="flex items-center gap-3 min-h-11 text-[15px] text-ink cursor-pointer">
          <input
            type="checkbox"
            checked={neverAgain}
            onChange={(event) => setNeverAgain(event.target.checked)}
            className="w-5 h-5 accent-teal-400"
          />
          {t('partnerTour.neverAgain')}
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onClose(neverAgain)}
            className="press min-h-11 px-3 rounded-xl text-[15px] font-semibold text-ink/80 focus-visible:ring-2 focus-visible:ring-teal-400/50"
          >
            {t('partnerTour.skip')}
          </button>
          <span className="flex-1" />
          {index > 0 && (
            <button
              type="button"
              onClick={() => setIndex(index - 1)}
              className="press min-h-11 px-3 rounded-xl text-[15px] font-semibold text-ink focus-visible:ring-2 focus-visible:ring-teal-400/50"
            >
              {t('partnerTour.back')}
            </button>
          )}
          <button
            type="button"
            onClick={() => (last ? onClose(true) : setIndex(index + 1))}
            className={BUTTON_PRIMARY}
          >
            {t(last ? 'partnerTour.finish' : 'partnerTour.next')}
          </button>
        </div>
      </div>
    </div>
  );
}
