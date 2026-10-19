import { Languages } from 'lucide-react';
import { i18n, type Locale } from '../../shared/i18n';
import { Z_INDEX } from '../../shared/constants/zIndex';

interface LocaleSuggestionBannerProps {
  target: Locale;
  onSwitch: () => void;
  onKeep: () => void;
}

/** Aviso numa página em português aberta por link: o texto sai no idioma sugerido, não no da página. */
export function LocaleSuggestionBanner({ target, onSwitch, onKeep }: LocaleSuggestionBannerProps) {
  const t = i18n.getFixedT(target);

  return (
    <section
      lang={target}
      aria-label={t('localeSuggestion.label')}
      style={{
        zIndex: Z_INDEX.banner,
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 6rem)',
      }}
      className="fixed left-1/2 -translate-x-1/2 w-full max-w-lg px-4"
    >
      <div className="glassmorphism-vibrant rounded-3xl border border-white/10 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
        <p className="flex items-start gap-2 text-sm font-semibold text-white">
          <Languages size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-teal-300" />
          {t('localeSuggestion.message')}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onSwitch}
            className="flex-1 min-h-[44px] rounded-xl bg-teal-500 px-4 text-sm font-bold text-black hover:bg-teal-400 transition-colors focus-visible:ring-2 focus-visible:ring-teal-400/50"
          >
            {t('localeSuggestion.switch')}
          </button>
          <button
            type="button"
            onClick={onKeep}
            className="flex-1 min-h-[44px] rounded-xl bg-white/5 border border-white/10 px-4 text-sm font-semibold text-white/80 hover:bg-white/10 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-teal-400/50"
          >
            {t('localeSuggestion.keep')}
          </button>
        </div>
      </div>
    </section>
  );
}
