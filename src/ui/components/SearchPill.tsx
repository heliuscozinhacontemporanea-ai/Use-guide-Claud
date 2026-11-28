import { Search } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';
import { FADE } from '../motion/tokens';

const PHRASE_INTERVAL_MS = 4000;

/**
 * Busca principal em pílula (DESIGN.md P5, D37 item 4): abre a busca; as frases que mudam mostram o que
 * dá para procurar. O nome para leitor de tela é fixo; com "reduzir movimento", a frase não troca.
 */
export function SearchPill({
  label,
  phrases,
  onClick,
}: {
  label: string;
  phrases: readonly string[];
  onClick: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduceMotion || phrases.length < 2) return;
    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % phrases.length),
      PHRASE_INTERVAL_MS
    );
    return () => window.clearInterval(timer);
  }, [reduceMotion, phrases.length]);

  const phrase = phrases[index % Math.max(phrases.length, 1)] ?? '';

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="press w-full h-12 px-4 rounded-full bg-surface border border-line flex items-center gap-3 text-left focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none"
    >
      <Search size={20} className="text-ink-muted shrink-0" aria-hidden="true" />
      <span aria-hidden="true" className="relative flex-1 h-[22px] overflow-hidden">
        <AnimatePresence initial={false}>
          <motion.span
            key={phrase}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={FADE}
            className="absolute inset-0 truncate text-body text-ink-muted"
          >
            {phrase}
          </motion.span>
        </AnimatePresence>
      </span>
    </button>
  );
}
