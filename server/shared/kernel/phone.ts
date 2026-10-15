/**
 * Telefone em E.164: "+" e de 8 a 15 dígitos, o primeiro diferente de zero (AGENTS.md §12.4).
 * Ex: +5588999999999. O link do WhatsApp é montado a partir dele na exibição.
 */
export const E164_PATTERN = /^\+[1-9]\d{7,14}$/;

export const E164_MESSAGE = 'Telefone deve estar no formato internacional, ex: +5588999999999.';
