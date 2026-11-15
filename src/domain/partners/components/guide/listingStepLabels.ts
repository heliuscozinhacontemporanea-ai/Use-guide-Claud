import { useTranslation } from 'react-i18next';

/** Nomes dos passos do guia e dos campos que faltam, no idioma ativo (D34). */
export function useListingStepLabels(category: string) {
  const { t, i18n } = useTranslation();
  const list = new Intl.ListFormat(i18n.language, { style: 'long', type: 'conjunction' });
  return {
    step: (id: string) =>
      id === 'details'
        ? t(`partnerGuide.steps.details_${category}`, {
            defaultValue: t('partnerGuide.steps.details'),
          })
        : t(`partnerGuide.steps.${id}`),
    fields: (missing: string[]) =>
      list.format([...new Set(missing)].map((field) => t(`partnerGuide.missing.${field}`))),
  };
}
