import { useTranslation } from 'react-i18next';
import { ListCard, ListRowButton } from '../../../../../ui/components/ListRows';

/** Revisão do cadastro (V2): cada parte com "Editar", que volta ao passo dela. */
export function SignupReview({
  formData,
  onEdit,
}: {
  formData: {
    businessName?: string;
    category?: string;
    region?: string;
    city?: string;
    state?: string;
  };
  onEdit: (step: number) => void;
}) {
  const { t } = useTranslation();
  const producer = formData.category === 'producer';
  const place = [formData.region, [formData.city, formData.state].filter(Boolean).join(', ')]
    .filter(Boolean)
    .join(' · ');
  const category = formData.category
    ? t(`partnerSignup.categories.${formData.category}`, { defaultValue: '' })
    : '';
  const edit = (
    <span className="shrink-0 text-[14px] font-semibold text-accent">
      {t('partnerSignup.step5.edit')}
    </span>
  );
  return (
    <section aria-labelledby="signup-review-title">
      <h3 id="signup-review-title" className="sr-only">
        {t('partnerSignup.step5.title')}
      </h3>
      <ListCard>
        <ListRowButton
          title={t('partnerSignup.step5.business')}
          sub={[formData.businessName, category].filter(Boolean).join(' · ')}
          aside={edit}
          onClick={() => onEdit(1)}
        />
        <ListRowButton
          title={t('partnerSignup.step5.contact')}
          sub={place}
          aside={edit}
          onClick={() => onEdit(2)}
        />
        {!producer && (
          <ListRowButton
            title={t('partnerSignup.step5.details')}
            sub={t('partnerSignup.step5.detailsHint')}
            aside={edit}
            onClick={() => onEdit(3)}
          />
        )}
        {!producer && (
          <ListRowButton
            title={t('partnerSignup.step5.extras')}
            sub={t('partnerSignup.step5.extrasHint')}
            aside={edit}
            onClick={() => onEdit(4)}
          />
        )}
      </ListCard>
    </section>
  );
}
