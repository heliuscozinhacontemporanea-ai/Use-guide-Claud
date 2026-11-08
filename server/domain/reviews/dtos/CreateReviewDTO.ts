export type ReviewItemCollection = 'items' | 'events';

export interface CreateReviewDTOData {
  itemId: string;
  itemCollection: ReviewItemCollection;
  userId: string;
  rating: number;
  comment: string;
  occurrenceId?: string;
  ticketId?: string;
  /** Reserva usada, para o selo verificado em passeio, aluguel e translado (D20). */
  bookingId?: string;
}

export class CreateReviewDTO {
  readonly itemId: string;
  readonly itemCollection: ReviewItemCollection;
  readonly userId: string;
  readonly rating: number;
  readonly comment: string;
  readonly occurrenceId?: string;
  readonly ticketId?: string;
  readonly bookingId?: string;

  constructor(data: CreateReviewDTOData) {
    this.itemId = data.itemId.trim();
    this.itemCollection = data.itemCollection;
    this.userId = data.userId.trim();
    this.rating = Number(data.rating);
    this.comment = data.comment.trim();
    this.occurrenceId = data.occurrenceId?.trim() || undefined;
    this.ticketId = data.ticketId?.trim() || undefined;
    this.bookingId = data.bookingId?.trim() || undefined;
  }

  static fromRaw(data: CreateReviewDTOData): CreateReviewDTO {
    return new CreateReviewDTO(data);
  }
}
