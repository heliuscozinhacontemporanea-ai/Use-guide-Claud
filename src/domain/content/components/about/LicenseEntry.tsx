import { ChevronDown, ExternalLink } from 'lucide-react';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../../../shared/utils/cn';

interface LicenseEntryProps {
  title: string;
  subtitle: string;
  license: string;
  url: string;
  text: string;
}

// Os arquivos de licença quebram linha a cada ~80 colunas; na tela estreita, cada parágrafo flui.
function reflow(text: string): string {
  return text.replace(/([^\n])\n(?=[^\n\s])/g, '$1 ');
}

/** Uma linha de Licenças e créditos: abre o texto completo da licença e o link do projeto. */
export function LicenseEntry({ title, subtitle, license, url, text }: LicenseEntryProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <li>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={`${title}, ${subtitle}, ${license}`}
        onClick={() => setOpen((value) => !value)}
        className="w-full min-h-14 px-4 py-2.5 flex items-center gap-3 text-left hover:bg-ink/[0.03] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-400/50 focus-visible:outline-none"
      >
        <span className="flex-1 min-w-0">
          <span className="block text-[15px] font-semibold text-ink break-words">{title}</span>
          <span className="block text-[13px] text-ink/70 break-words">{subtitle}</span>
        </span>
        <span className="shrink-0 px-2 py-0.5 rounded-full bg-ink/[0.06] text-[12px] font-semibold text-ink/80">
          {license}
        </span>
        <ChevronDown
          size={18}
          aria-hidden="true"
          className={cn(
            'shrink-0 text-ink/40 transition-transform motion-reduce:transition-none',
            open && 'rotate-180'
          )}
        />
      </button>
      {open && (
        <div id={panelId} className="px-4 pb-4 space-y-2">
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 min-h-11 text-[13px] font-semibold text-accent focus-visible:ring-2 focus-visible:ring-teal-400/50 rounded-lg"
            >
              {t('appAbout.project')}
              <ExternalLink size={14} aria-hidden="true" />
            </a>
          )}
          <p className="max-h-72 overflow-auto p-3 rounded-xl bg-ink/[0.04] text-[12px] leading-relaxed text-ink/80 whitespace-pre-line break-words">
            {reflow(text)}
          </p>
        </div>
      )}
    </li>
  );
}
