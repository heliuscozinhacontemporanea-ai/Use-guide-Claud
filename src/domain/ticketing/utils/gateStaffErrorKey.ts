const KNOWN = new Set([
  'GATE_STAFF_ALREADY_INVITED',
  'GATE_STAFF_SELF',
  'GATE_STAFF_LIMIT',
  'GATE_STAFF_NOT_FOUND',
  'GATE_STAFF_WRONG_STATUS',
  'USERNAME_NOT_FOUND',
]);

/** Chave de tradução do erro da equipe da portaria, pelo `code` do servidor (§12.5). */
export function gateStaffErrorKey(error: unknown): string {
  const code = error instanceof Error ? error.message : '';
  return `gateStaff.errors.${KNOWN.has(code) ? code : 'generic'}`;
}
