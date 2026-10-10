export type ReviewItemCollection = 'items' | 'events';

export interface CreateReviewDTOData {
  itemId: string;
  itemCollection: ReviewItemCollection;
  userId: string;
  rating: number;
  comment: string;
  occurrenceId?: string;
  ticketId?: string;
}

export class CreateReviewDTO {
  readonly itemId: string;
  readonly itemCollection: ReviewItemCollection;
  readonly userId: string;
  readonly rating: number;
  readonly comment: string;
  readonly occurrenceId?: string;
  readonly ticketId?: string;

  constructor(data: CreateReviewDTOData) {
    this.itemId = data.itemId.trim();
    this.itemCollection = data.itemCollection;
    this.userId = data.userId.trim();
    this.rating = Number(data.rating);
    this.comment = data.comment.trim();
    this.occurrenceId = data.occurrenceId?.trim() || undefined;
    this.ticketId = data.ticketId?.trim() || undefined;
  }

  static fromRaw(data: CreateReviewDTOData): CreateReviewDTO {
    return new CreateReviewDTO(data);
  }
}
