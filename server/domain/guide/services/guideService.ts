import { AuthenticatedUserContext } from '../../../application/security/authenticatedUserContext';
import { findContactsInText } from '../../../shared/kernel/contactInText';
import { type BrState, timeZoneForBrazilianCity } from '../../../shared/kernel/timeZones';
import { GuideDomainError } from '../errors/guideDomainError';
import { GuideItemContact, GuidePort, GuideVerificationUpdate } from '../ports/guidePort';
import { GuideCreateItemInput, GuidePublication, GuideUpdateItemInput } from '../types/guideTypes';
import { type ListingStep, listingSetupSteps, stepsLost } from '../utils/listingSetupSteps';
import { sellsThroughApp } from '../utils/sellsThroughApp';

const ADMIN_CREATABLE_ITEM_CATEGORIES = ['sight', 'tour', 'tips'] as const;

const PARTNER_CREATABLE_ITEM_CATEGORIES = [
  'sight',
  'hotel',
  'restaurant',
  'tour',
  'transfer',
  'rental',
  'producer',
] as const;

function canManageGuide(user: AuthenticatedUserContext): boolean {
  return user.admin || user.role === 'partner';
}

function ensureCanManageGuide(user: AuthenticatedUserContext): void {
  if (!canManageGuide(user)) {
    throw new GuideDomainError(
      'FORBIDDEN',
      'Apenas parceiros ou administradores podem gerenciar conteúdo do guia'
    );
  }
}

function ensureCreateItemCategory(
  user: AuthenticatedUserContext,
  category: GuideCreateItemInput['category']
): void {
  if (user.admin) {
    if (!ADMIN_CREATABLE_ITEM_CATEGORIES.includes(category as never)) {
      throw new GuideDomainError(
        'FORBIDDEN',
        'Administradores não podem criar esta categoria de conteúdo'
      );
    }
    return;
  }
  if (user.role === 'partner') {
    if (!PARTNER_CREATABLE_ITEM_CATEGORIES.includes(category as never)) {
      throw new GuideDomainError(
        'FORBIDDEN',
        'Parceiros não podem criar esta categoria de conteúdo'
      );
    }
    return;
  }
  throw new GuideDomainError('FORBIDDEN', 'Usuário sem permissão para criar conteúdo');
}

function ensureValidId(id: string): void {
  if (!id.trim()) {
    throw new GuideDomainError('INVALID_ID', 'ID do conteúdo é obrigatório');
  }
}

function ensureOwnership(user: AuthenticatedUserContext, ownerId: string): void {
  if (!user.admin && ownerId !== user.uid) {
    throw new GuideDomainError(
      'FORBIDDEN',
      'Você não possui permissão para modificar este conteúdo'
    );
  }
}

type ContactFields = Pick<
  GuideCreateItemInput,
  'phone' | 'instagramLink' | 'websiteLink' | 'bookingLink'
>;

/** Separa o que vai para o anúncio público do que fica no contato privado. */
function splitContact<T extends ContactFields>(data: T): { item: T; contact: GuideItemContact } {
  const { phone, instagramLink: _i, websiteLink: _w, bookingLink: _b, ...item } = data;
  return { item: item as T, contact: phone === undefined ? {} : { phone } };
}

function ensureNoContactInText(data: {
  description?: string;
  operationalInfo?: GuideCreateItemInput['operationalInfo'];
}): void {
  const fields: Array<[string, string | undefined]> = [
    ['description', data.description],
    ['itinerary', data.operationalInfo?.itinerary],
    ['meetingPoint', data.operationalInfo?.meetingPoint],
    ['luggageInfo', data.operationalInfo?.luggageInfo],
  ];
  for (const [field, text] of fields) {
    const found = findContactsInText(text ?? '');
    if (found.length > 0) {
      throw new GuideDomainError(
        'CONTACT_IN_TEXT',
        'Tire telefone, e-mail, links, @ e chave Pix do texto.',
        { field, found }
      );
    }
  }
}

/** Fuso do lugar (D28): só com estado e cidade; o cliente nunca manda o fuso. */
function placeTimeZone(place: { state?: BrState; city?: string }): { timeZone?: string } {
  return place.state && place.city?.trim()
    ? { timeZone: timeZoneForBrazilianCity(place.state, place.city) }
    : {};
}

/**
 * Anúncio do parceiro nasce como rascunho, fora do guia (D34). O admin publica direto os lugares do
 * próprio guia, e o perfil de produtor não aparece no guia (D9), mas os eventos leem o nome dele.
 */
function initialPublication(
  user: AuthenticatedUserContext,
  category: GuideCreateItemInput['category']
): GuidePublication {
  return user.admin || category === 'producer' ? 'published' : 'draft';
}

function incomplete(message: string, steps: ListingStep[]): GuideDomainError {
  return new GuideDomainError('LISTING_INCOMPLETE', message, {
    steps: steps.map(({ id, missing }) => ({ id, missing })),
  });
}

export class GuideService {
  constructor(private readonly guidePort: GuidePort) {}

  async createItem(
    user: AuthenticatedUserContext,
    data: GuideCreateItemInput & { id?: string }
  ): Promise<string> {
    ensureCanManageGuide(user);
    ensureCreateItemCategory(user, data.category);
    const publication = initialPublication(user, data.category);
    if (!sellsThroughApp(data.category, data.operationalInfo?.access)) {
      return this.guidePort.createItem({
        ...data,
        ...placeTimeZone(data),
        ownerId: user.uid,
        isActive: data.isActive ?? true,
        publication,
      });
    }
    ensureNoContactInText(data);
    const { item, contact } = splitContact(data);
    const id = await this.guidePort.createItem({
      ...item,
      ...placeTimeZone(data),
      ownerId: user.uid,
      isActive: data.isActive ?? true,
      publication,
    });
    if (contact.phone) await this.guidePort.setItemContact(id, contact);
    return id;
  }

  async updateItem(
    user: AuthenticatedUserContext,
    id: string,
    data: GuideUpdateItemInput
  ): Promise<void> {
    ensureCanManageGuide(user);
    ensureValidId(id);
    const existing = await this.guidePort.getItemById(id);
    if (!existing) {
      throw new GuideDomainError('NOT_FOUND', 'Item não encontrado');
    }
    ensureOwnership(user, existing.ownerId);
    if (existing.publication === 'published') {
      // No guia, um passo completo não pode voltar a ficar incompleto (escolhas da F1, D34).
      const lost = stepsLost(
        listingSetupSteps(existing),
        listingSetupSteps({ ...existing, ...data })
      );
      if (lost.length > 0) {
        throw incomplete('O anúncio está no guia: complete o passo antes de salvar.', lost);
      }
    }
    const place =
      data.state !== undefined || data.city !== undefined
        ? placeTimeZone({ state: data.state ?? existing.state, city: data.city ?? existing.city })
        : {};
    const access = (data.operationalInfo ?? existing.operationalInfo)?.access;
    if (!sellsThroughApp(data.category ?? existing.category, access)) {
      await this.guidePort.updateItem(id, { ...data, ...place });
      return;
    }
    ensureNoContactInText(data);
    const { item, contact } = splitContact(data);
    await this.guidePort.updateItem(id, { ...item, ...place });
    if (data.phone !== undefined) await this.guidePort.setItemContact(id, contact);
  }

  /** Publica o rascunho no guia, depois de conferir os passos da categoria (D34). */
  async publishItem(user: AuthenticatedUserContext, id: string): Promise<void> {
    ensureCanManageGuide(user);
    ensureValidId(id);
    const existing = await this.guidePort.getItemById(id);
    if (!existing) {
      throw new GuideDomainError('NOT_FOUND', 'Item não encontrado');
    }
    ensureOwnership(user, existing.ownerId);
    if (existing.publication === 'published') return;
    const open = listingSetupSteps(existing).filter((step) => !step.done);
    if (open.length > 0) {
      throw incomplete('Complete os passos do guia antes de publicar.', open);
    }
    await this.guidePort.setPublication(id, 'published');
  }

  /**
   * Telefone do anúncio para o próprio dono (editor) ou para quem o servidor já autorizou (pedido
   * pago, C2). Anúncio de vitrine devolve o telefone público.
   */
  async getItemContact(id: string): Promise<GuideItemContact | null> {
    ensureValidId(id);
    const item = await this.guidePort.getItemById(id);
    if (!item) return null;
    if (!sellsThroughApp(item.category, item.operationalInfo?.access)) {
      return item.phone ? { phone: item.phone } : {};
    }
    return (await this.guidePort.getItemContact(id)) ?? {};
  }

  async getOwnItemContact(user: AuthenticatedUserContext, id: string): Promise<GuideItemContact> {
    ensureValidId(id);
    const item = await this.guidePort.getItemById(id);
    if (!item) throw new GuideDomainError('NOT_FOUND', 'Item não encontrado');
    ensureOwnership(user, item.ownerId);
    return (await this.getItemContact(id)) ?? {};
  }

  async deleteItem(user: AuthenticatedUserContext, id: string): Promise<void> {
    ensureCanManageGuide(user);
    ensureValidId(id);
    const existing = await this.guidePort.getItemById(id);
    if (!existing) {
      throw new GuideDomainError('NOT_FOUND', 'Item não encontrado');
    }
    ensureOwnership(user, existing.ownerId);
    await this.guidePort.deleteItem(id);
  }

  async updateItemVerification(
    itemId: string,
    verification: GuideVerificationUpdate
  ): Promise<void> {
    if (!itemId.trim()) {
      throw new GuideDomainError('INVALID_ID', 'ID do item é obrigatório');
    }
    await this.guidePort.updateItemVerification(itemId, verification);
  }

  async updateReviewAggregate(
    resourceType: 'items',
    resourceId: string,
    rating: number,
    reviewCount: number
  ): Promise<void> {
    ensureValidId(resourceId);
    await this.guidePort.updateReviewAggregate(resourceType, resourceId, rating, reviewCount);
  }

  async deleteResourcesByOwner(ownerId: string): Promise<void> {
    if (!ownerId.trim()) return;
    await this.guidePort.deleteResourcesByOwner(ownerId);
  }

  async getItemById(id: string) {
    ensureValidId(id);
    return this.guidePort.getItemById(id);
  }

  async getAllItems() {
    return this.guidePort.getAllItems();
  }

  async listItemsByOwner(ownerId: string) {
    ensureValidId(ownerId);
    return this.guidePort.listItemsByOwner(ownerId);
  }
}
