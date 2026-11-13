export type GateStaffErrorCode =
  | 'GATE_STAFF_ALREADY_INVITED'
  | 'GATE_STAFF_SELF'
  | 'GATE_STAFF_LIMIT'
  | 'GATE_STAFF_NOT_FOUND'
  | 'GATE_STAFF_WRONG_STATUS';

const STATUS: Record<GateStaffErrorCode, number> = {
  GATE_STAFF_ALREADY_INVITED: 409,
  GATE_STAFF_SELF: 422,
  GATE_STAFF_LIMIT: 422,
  GATE_STAFF_NOT_FOUND: 404,
  GATE_STAFF_WRONG_STATUS: 409,
};

/** Erros da equipe da portaria (C1), com `code` estável para a tela traduzir (§10.2). */
export class GateStaffError extends Error {
  readonly status: number;
  constructor(
    public readonly code: GateStaffErrorCode,
    message: string
  ) {
    super(message);
    this.name = 'GateStaffError';
    this.status = STATUS[code];
  }
}
