import { GuideDomainError } from '../errors/guideDomainError';
import { GuidePort, GuideVerificationUpdate } from '../ports/guidePort';
import { AuthenticatedUserContext } from '../../../application/security/authenticatedUserContext';
import {
  GuideCreateItemInput,
  GuideUpdateItemInput,
} from '../types/guideTypes';

const ADMIN_CREATABLE_ITEM_CATEGORIES = [
  'sight',
  'tour',
  'tips',
] as const;

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
    if (
      !PARTNER_CREATABLE_ITEM_CATEGORIES.includes(
        category as never
      )
    ) {
      throw new GuideDomainError(
        'FORBIDDEN',
        'Parceiros não podem criar esta categoria de conteúdo'
      );
    }
    return;
  }
  throw new GuideDomainError(
    'FORBIDDEN',
    'Usuário sem permissão para criar conteúdo'
  );
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

export class GuideService {
  constructor(private readonly guidePort: GuidePort) {}

  async createItem(
    user: AuthenticatedUserContext,
    data: GuideCreateItemInput & { id?: string }
  ): Promise<string> {
    ensureCanManageGuide(user);
    ensureCreateItemCategory(user, data.category);
    return this.guidePort.createItem({
      ...data,
      ownerId: user.uid,
      isActive: data.isActive ?? true,
    });
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
    await this.guidePort.updateItem(id, data);
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

  async updateOwnerVerification(
    ownerId: string,
    verification: GuideVerificationUpdate
  ): Promise<void> {
    if (!ownerId.trim()) {
      throw new GuideDomainError('INVALID_ID', 'ID do proprietário é obrigatório');
    }
    await this.guidePort.updateVerificationByOwner(ownerId, verification);
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
}
