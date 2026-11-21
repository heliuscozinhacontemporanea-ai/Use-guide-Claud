import type { PartnerContentRecord } from '../types/partnerContent';
import type { PartnerFirstStep } from '../types/partnerHome';

interface GuideStepTargets {
  items: ReadonlyArray<
    { id: string; name: string; category: string } & Pick<PartnerContentRecord, 'operationalInfo'>
  >;
  verify: (item: { id: string; name: string; category: string }) => void;
  openAccounts: () => void;
  openPlace: (item: { id: string; name: string }) => void;
  /** Primeira oferta do estabelecimento e horários dela, como páginas (F3, D34). */
  openNewOffer: (
    item: { id: string; category: string } & Pick<PartnerContentRecord, 'operationalInfo'>
  ) => void;
  openSlots: (offerId: string) => void;
  newEvent: () => void;
}

/** Para onde leva cada passo de "Para vender" do guia do Início (D34). */
export function openGuideStep(step: PartnerFirstStep, to: GuideStepTargets): void {
  const item = to.items.find((entry) => entry.id === step.itemId);
  if (step.id === 'account') to.openAccounts();
  else if (step.id === 'event') to.newEvent();
  else if (!item) return;
  else if (step.id === 'verify')
    to.verify({ id: item.id, name: item.name, category: item.category });
  else if (step.id === 'offer') to.openNewOffer(item);
  // Sem oferta ainda, o passo está travado; se chegar aqui, a página do estabelecimento resolve.
  else if (step.id === 'slots') step.offerId ? to.openSlots(step.offerId) : to.openPlace(item);
}
