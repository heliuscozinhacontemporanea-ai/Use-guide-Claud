import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUI } from '../../../../shared/stores/useUIStore';
import { StatusText } from '../../../../ui/components/StatusText';
import { mapItemToFormData } from '../../application/mappers/partnerFormMapper';
import { getPartnerItemContactUseCase } from '../../application/usecases/getPartnerItemContactUseCase';
import { updatePartnerContentItemUseCase } from '../../application/usecases/updatePartnerContentItemUseCase';
import { ListingIncompleteError } from '../../errors/listingIncompleteError';
import type { DeclinedLink, PartnerContentRecord } from '../../types/partnerContent';
import type { ListingStep } from '../../types/partnerHome';
import type { FormState } from '../../types/partsForm';
import { type ListingStepEdit, listingStepUpdate } from '../../utils/listingStepUpdate';
import { NoneOfTheseContext } from '../steps/details/noneOfThese';
import { useListingStepLabels } from './listingStepLabels';
import { ListingPhotosField } from './ListingPhotosField';
import {
  AboutFields,
  ContactsFields,
  DetailsFields,
  NameFields,
  PhoneFields,
  WhereFields,
} from './ListingStepFields';

const NONE_LISTS = ['amenities', 'mealTypes', 'additionalServices', 'services', 'activities'];

/** Listas que o anúncio já gravou vazias: a pessoa tinha marcado "Nenhuma destas". */
function initialNone(item: PartnerContentRecord): Set<string> {
  const info = (item.operationalInfo ?? {}) as Record<string, unknown>;
  return new Set(NONE_LISTS.filter((key) => Array.isArray(info[key]) && !(info[key] as []).length));
}

/**
 * Uma página do guia de passos (D34): só os campos do passo. "Salvar", na barra, grava e volta ao
 * Início; o rodapé diz em que passo a pessoa está e qual vem depois.
 */
export function ListingStepPage({
  item,
  step,
  steps,
  registerSave,
  onSaved,
  mode = 'guide',
}: {
  item: PartnerContentRecord;
  step: ListingStepEdit;
  steps: ListingStep[];
  /** A página entrega à barra a ação de salvar (null ao sair). */
  registerSave: (save: (() => void) | null) => void;
  onSaved: () => void;
  /** Pelo editor do anúncio (F2): sem "Passo X de N" e com os detalhes de venda até a F3. */
  mode?: 'guide' | 'editor';
}) {
  const { t } = useTranslation();
  const { showToast } = useUI();
  const labels = useListingStepLabels(item.category);
  const [form, setForm] = useState<FormState>(() => mapItemToFormData(item));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [images, setImages] = useState<string[]>(() => item.images ?? []);
  const [none, setNone] = useState(() => initialNone(item));
  const [declined, setDeclined] = useState(() => new Set<DeclinedLink>(item.declinedLinks ?? []));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [phone, setPhone] = useState<string | undefined>(undefined);
  const [phoneReady, setPhoneReady] = useState(step !== 'phone');

  // O telefone de quem vende pelo app fica só no servidor (C2): a página lê pelo contato do dono.
  // O campo só aparece depois, porque lê o valor ao montar.
  useEffect(() => {
    if (step !== 'phone') return;
    let active = true;
    void getPartnerItemContactUseCase(item.id)
      .then(({ phone: current }) => {
        if (active && current) setPhone(current);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setPhoneReady(true);
      });
    return () => {
      active = false;
    };
  }, [step, item.id]);

  const save = async () => {
    if (saving || !phoneReady) return;
    if (step === 'phone' && !phone) {
      setMessage(t('partnerGuide.editor.phoneInvalid'));
      return;
    }
    if (step === 'name' && !form.businessName.trim()) {
      setMessage(t('partnerGuide.join.errors.name'));
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      await updatePartnerContentItemUseCase(
        item.id,
        listingStepUpdate(step, item, form, { images, none, declined, phone })
      );
      showToast(t('partnerGuide.page.saved'), 'success');
      onSaved();
    } catch (error) {
      setMessage(
        error instanceof ListingIncompleteError
          ? t('partnerGuide.page.lost', {
              fields: labels.fields(error.steps.flatMap((lost) => lost.missing)),
            })
          : error instanceof Error && error.message === 'CONTACT_IN_TEXT'
            ? t('partnerGuide.page.contactInText')
            : t('partnerGuide.page.failed')
      );
    } finally {
      setSaving(false);
    }
  };
  const latestSave = useRef(save);
  latestSave.current = save;
  // biome-ignore lint/correctness/useExhaustiveDependencies: a ação da barra é entregue uma vez; ela chama sempre a versão atual.
  useEffect(() => {
    registerSave(() => void latestSave.current());
    return () => registerSave(null);
  }, []);

  const fields = {
    form,
    setForm,
    errors,
    setErrors,
    declined,
    setDeclined: (link: DeclinedLink, on: boolean) =>
      setDeclined((current) => {
        const next = new Set(current);
        if (on) next.add(link);
        else next.delete(link);
        return next;
      }),
  };
  const order = [...steps.map((entry) => entry.id), 'publish'];
  const position = order.indexOf(step);
  const nextId = order[position + 1];
  const missing = steps.find((entry) => entry.id === step)?.missing ?? [];

  return (
    <NoneOfTheseContext.Provider
      value={{
        isNone: (key) => none.has(key),
        setNone: (key, on) =>
          setNone((current) => {
            const next = new Set(current);
            if (on) next.add(key);
            else next.delete(key);
            return next;
          }),
      }}
    >
      <div className="space-y-6 pb-8">
        {step === 'name' ? <NameFields {...fields} /> : null}
        {step === 'phone' && phoneReady ? (
          <PhoneFields
            category={item.category}
            access={item.operationalInfo?.access}
            phone={phone}
            onChange={setPhone}
          />
        ) : null}
        {step === 'photos' ? <ListingPhotosField images={images} onChange={setImages} /> : null}
        {step === 'about' ? <AboutFields {...fields} /> : null}
        {step === 'where' ? <WhereFields {...fields} /> : null}
        {step === 'details' ? <DetailsFields {...fields} /> : null}
        {step === 'contacts' ? <ContactsFields {...fields} /> : null}
        {missing.length > 0 ? (
          <p className="px-1 text-[13px] text-ink/70">
            {t('partnerGuide.page.missing', { fields: labels.fields(missing) })}
          </p>
        ) : null}
        {message ? (
          <p role="alert">
            <StatusText tone="danger">{message}</StatusText>
          </p>
        ) : null}
        {saving ? (
          <p role="status" className="px-1 text-[13px] text-ink/70">
            {t('partnerGuide.page.saving')}
          </p>
        ) : null}
        {mode === 'guide' && position >= 0 ? (
          <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 px-1 text-[13px] text-ink/60">
            <span className="tabular-nums">
              {t('partnerGuide.page.progress', { current: position + 1, total: order.length })}
            </span>
            <span>
              {nextId === 'publish'
                ? t('partnerGuide.page.nextPublish')
                : nextId
                  ? t('partnerGuide.page.next', { step: labels.step(nextId) })
                  : null}
            </span>
          </div>
        ) : null}
      </div>
    </NoneOfTheseContext.Provider>
  );
}
