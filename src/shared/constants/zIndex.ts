/**
 * Escala fixa de z-index do sistema. Nunca usar valores numéricos soltos
 * em componentes — sempre importar destas constantes.
 */
export const Z_INDEX = {
  base: 0,
  card: 10,
  header: 100,
  bottomNav: 110,
  dropdown: 200,
  overlay: 1000,
  modal: 1100,
  modalNested: 1200,
  toast: 2000,
  criticalAlert: 9999,
} as const;
