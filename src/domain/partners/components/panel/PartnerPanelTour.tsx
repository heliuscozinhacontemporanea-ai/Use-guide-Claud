import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Z_INDEX } from '../../../../shared/constants/zIndex';
import { BUTTON_PRIMARY } from '../../../../ui/styles/controls';
import {
  chapterReady,
  PANEL_TOUR_CHAPTERS,
  type PanelTourResult,
  type PanelTourStepId,
  type TourRect,
  tourRect,
  tourTargets,
  visibleChapterSteps,
} from '../../utils/panelTourSteps';
import type { PartnerPanelTab } from './partnerPanelTabs';

const PAD = 8;
const POLL_MS = 100;
// A aba que não abrir nesse tempo tem o capítulo pulado.
const CHAPTER_TIMEOUT_MS = 5000;

interface Position {
  chapter: number;
  /** Ao voltar de um capítulo, entra pelo último passo do anterior. */
  fromEnd: boolean;
}

/**
 * Tour do painel (proposta 2): um capítulo por aba; o tour troca de aba sozinho e destaca o
 * elemento real. "Não mostrar dicas do painel" desliga o tour e as dicas que vierem depois.
 */
export function PartnerPanelTour({
  startChapter = 0,
  onTabChange,
  onClose,
}: {
  startChapter?: number;
  onTabChange: (tab: PartnerPanelTab) => void;
  onClose: (result: PanelTourResult) => void;
}) {
  const { t } = useTranslation();
  const titleId = useId();
  const cardRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<Position>({ chapter: startChapter, fromEnd: false });
  const [steps, setSteps] = useState<PanelTourStepId[] | null>(null);
  const [index, setIndex] = useState(0);
  const [tipsOff, setTipsOff] = useState(false);
  const [rect, setRect] = useState<TourRect | null>(null);
  const chapter = PANEL_TOUR_CHAPTERS[position.chapter];
  const step = steps?.[index];
  const lastChapter = position.chapter === PANEL_TOUR_CHAPTERS.length - 1;
  const last = lastChapter && steps !== null && index === steps.length - 1;
  const first = position.chapter === startChapter && index === 0;
  const close = (result: PanelTourResult) => onClose(tipsOff ? 'tips_off' : result);

  // Troca de aba e espera ela abrir; capítulo sem passos na tela (ou que não abriu) é pulado.
  // biome-ignore lint/correctness/useExhaustiveDependencies: só ao mudar de capítulo.
  useEffect(() => {
    if (!chapter) {
      onClose(tipsOff ? 'tips_off' : 'done');
      return;
    }
    setSteps(null);
    setRect(null);
    onTabChange(chapter.tab);
    const started = Date.now();
    const timer = window.setInterval(() => {
      const ready = chapterReady(position.chapter);
      if (!ready && Date.now() - started < CHAPTER_TIMEOUT_MS) return;
      window.clearInterval(timer);
      const visible = ready ? visibleChapterSteps(position.chapter) : [];
      if (visible.length === 0) {
        const next = position.fromEnd ? position.chapter - 1 : position.chapter + 1;
        if (next < startChapter) onClose('skip');
        else setPosition({ chapter: next, fromEnd: position.fromEnd });
        return;
      }
      setSteps(visible);
      setIndex(position.fromEnd ? visible.length - 1 : 0);
    }, POLL_MS);
    return () => window.clearInterval(timer);
  }, [position]);

  useLayoutEffect(() => {
    if (!step) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    tourTargets(step)[0]?.scrollIntoView?.({
      block: 'center',
      behavior: reduce ? 'auto' : 'smooth',
    });
    const update = () => setRect(tourRect(step));
    update();
    // A aba pode mudar de tamanho depois de carregar; o destaque acompanha.
    const timer = window.setInterval(update, 250);
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [step]);

  useEffect(() => {
    if (step) cardRef.current?.focus();
  }, [step]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: `close` lê a caixa marcada agora.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close('skip');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [tipsOff]);

  const next = () => {
    if (!steps) return;
    if (index < steps.length - 1) setIndex(index + 1);
    else if (lastChapter) close('done');
    else setPosition({ chapter: position.chapter + 1, fromEnd: false });
  };
  const back = () => {
    if (index > 0) setIndex(index - 1);
    else setPosition({ chapter: position.chapter - 1, fromEnd: true });
  };

  // Balão embaixo; quando o destaque está na metade de baixo, vai para cima.
  const cardAtTop = rect !== null && rect.top + rect.height / 2 > window.innerHeight / 2;

  return (
    <div className="fixed inset-0" style={{ zIndex: Z_INDEX.modal }}>
      {rect && step ? (
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
      {step && chapter && steps && (
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
            {t('partnerTour.progress', {
              chapter: t(`partnerTour.chapters.${chapter.tab}`),
              current: index + 1,
              total: steps.length,
            })}
          </p>
          <h2 id={titleId} className="text-[19px] font-display font-bold text-ink">
            {t(`partnerTour.steps.${step}.title`)}
          </h2>
          <p className="text-[15px] text-ink/80">{t(`partnerTour.steps.${step}.text`)}</p>
          <label className="flex items-center gap-3 min-h-11 text-[15px] text-ink cursor-pointer">
            <input
              type="checkbox"
              checked={tipsOff}
              onChange={(event) => setTipsOff(event.target.checked)}
              className="w-5 h-5 accent-teal-400"
            />
            {t('partnerTour.tipsOff')}
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => close('skip')}
              className="press min-h-11 px-3 rounded-xl text-[15px] font-semibold text-ink/80 focus-visible:ring-2 focus-visible:ring-teal-400/50"
            >
              {t('partnerTour.skip')}
            </button>
            <span className="flex-1" />
            {!first && (
              <button
                type="button"
                onClick={back}
                className="press min-h-11 px-3 rounded-xl text-[15px] font-semibold text-ink focus-visible:ring-2 focus-visible:ring-teal-400/50"
              >
                {t('partnerTour.back')}
              </button>
            )}
            <button type="button" onClick={next} className={BUTTON_PRIMARY}>
              {t(last ? 'partnerTour.finish' : 'partnerTour.next')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
