import {
  GuideCreateItemInput,
  GuideUpdateItemInput,
} from '../types/guide';

export interface GuideMutationPort {
  createItem(data: GuideCreateItemInput): Promise<string>;
  updateItem(id: string, data: GuideUpdateItemInput): Promise<void>;
  deleteItem(id: string): Promise<void>;
}
