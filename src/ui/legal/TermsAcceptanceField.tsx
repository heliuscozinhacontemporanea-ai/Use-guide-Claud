import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Dialog } from '../components/Dialog';
import {
  type LegalSectionKey,
  LegalTermsDocument,
  type PlatformFeesView,
} from './LegalTermsDocument';

interface TermsAcceptanceFieldProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  audience: 'buyer' | 'partner';
  fees?: PlatformFeesView | null;
  version?: string;
}

const SECTIONS: Record<
  'buyer' | 'partner',
  { sections: LegalSectionKey[]; focus: LegalSectionKey }
> = {
  buyer: { sections: ['purchases', 'use', 'privacy'], focus: 'purchases' },
  partner: { sections: ['partner', 'purchases'], focus: 'partner' },
};

/** Caixa de aceite com link para os termos, abertos num diálogo sem sair da tela (D15). */
export function TermsAcceptanceField({
  checked,
  onChange,
  audience,
  fees,
  version,
}: TermsAcceptanceFieldProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const config = SECTIONS[audience];
  return (
    <>
      <label className="flex items-start gap-3 min-h-11 text-xs text-ink/80 cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="mt-0.5 w-5 h-5 shrink-0 accent-teal-400"
        />
        <span>
          <Trans
            i18nKey={`legal.accept.${audience}`}
            // `link` é elemento vazio do HTML e perderia o texto; por isso a tag se chama `terms`.
            components={{
              terms: (
                <button
                  type="button"
                  onClick={(event) => {
                    // O link fica dentro do rótulo: abrir os termos não pode marcar a caixa.
                    event.preventDefault();
                    setOpen(true);
                  }}
                  className="text-accent font-semibold underline underline-offset-2 focus-visible:ring-2 focus-visible:ring-teal-400/50 rounded"
                />
              ),
            }}
          />
        </span>
      </label>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title={t('legal.title')}
        nested
        className="sm:max-w-lg"
      >
        <LegalTermsDocument
          sections={config.sections}
          focusSection={config.focus}
          fees={fees}
          version={version}
        />
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="press mt-6 w-full min-h-11 rounded-xl bg-surface border border-line text-sm font-semibold text-ink focus-visible:ring-2 focus-visible:ring-teal-400/50"
        >
          {t('legal.accept.close')}
        </button>
      </Dialog>
    </>
  );
}
