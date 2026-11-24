import { Trans } from 'react-i18next';

const LINK =
  'text-accent font-semibold underline underline-offset-2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50';

/**
 * Aviso dos Termos de uso e da Política de privacidade ao criar a conta (D35 1b): abaixo de "Cadastrar"
 * e de "Continuar com Google". Os dois links abrem a página "Termos e políticas", que tem as duas.
 */
export function TermsNotice({
  action,
  onOpenTerms,
}: {
  /** `create`: "Ao criar a conta…"; `continue`: "Ao continuar…" (Google cria a conta no primeiro toque). */
  action: 'create' | 'continue';
  onOpenTerms: () => void;
}) {
  const link = <button type="button" onClick={onOpenTerms} className={LINK} />;
  return (
    <p className="text-center text-caption text-ink-muted">
      <Trans i18nKey={`legal.notice.${action}`} components={{ terms: link, privacy: link }} />
    </p>
  );
}
