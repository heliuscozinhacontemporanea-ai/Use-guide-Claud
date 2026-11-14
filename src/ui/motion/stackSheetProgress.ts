import { motionValue } from 'motion/react';

/**
 * Progresso da folha em pilha (0 fechada, 1 aberta). A folha move este valor (também durante o arraste) e
 * o fundo do app o lê para virar cartão no mesmo movimento. Só existe uma folha em pilha por vez (o perfil).
 */
export const stackSheetProgress = motionValue(0);
