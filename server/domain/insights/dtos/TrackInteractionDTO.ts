export interface TrackInteractionDTOData {
  itemId: string;
  itemCollection: 'items' | 'events';
  type: 'view' | 'whatsapp_click' | 'share' | 'favorite';
  partnerId?: string | undefined;
  userId?: string | undefined;
}

export class TrackInteractionDTO {
  readonly itemId: string;
  readonly itemCollection: 'items' | 'events';
  readonly type: 'view' | 'whatsapp_click' | 'share' | 'favorite';
  readonly partnerId?: string | undefined;
  readonly userId?: string | undefined;

  constructor(data: TrackInteractionDTOData) {
    this.itemId = data.itemId.trim();
    this.itemCollection = data.itemCollection;
    this.type = data.type;
    if (data.partnerId && data.partnerId.trim()) {
      this.partnerId = data.partnerId.trim();
    }
    if (data.userId && data.userId.trim()) {
      this.userId = data.userId.trim();
    }
  }

  static fromRaw(data: TrackInteractionDTOData): TrackInteractionDTO {
    return new TrackInteractionDTO(data);
  }
}
