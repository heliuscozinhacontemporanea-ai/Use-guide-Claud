export type ReviewReportErrorCode =
  | 'NOT_FOUND'
  | 'FORBIDDEN'
  | 'NO_RESPONSE_TO_REPORT'
  | 'ALREADY_REPORTED'
  | 'ALREADY_DECIDED'
  | 'REPORT_LIMIT_REACHED';

const STATUS: Record<ReviewReportErrorCode, number> = {
  NOT_FOUND: 404,
  FORBIDDEN: 403,
  NO_RESPONSE_TO_REPORT: 422,
  ALREADY_REPORTED: 409,
  ALREADY_DECIDED: 409,
  REPORT_LIMIT_REACHED: 429,
};

export class ReviewReportError extends Error {
  readonly statusCode: number;

  constructor(
    public readonly code: ReviewReportErrorCode,
    message: string
  ) {
    super(message);
    this.name = 'ReviewReportError';
    this.statusCode = STATUS[code];
  }
}
