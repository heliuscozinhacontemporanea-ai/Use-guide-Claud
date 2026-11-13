import { INPUT } from '../../../../ui/styles/controls';

/** Classes do cadastro de parceiro (V2): tokens do app, roxo só na seleção e no avanço (DESIGN.md §2.2). */
export const SIGNUP_LABEL = 'block mb-1.5 px-1 text-[14px] font-semibold text-ink';
export const SIGNUP_INPUT = `${INPUT} min-h-12 px-4 text-[15px] placeholder:text-ink/50`;
export const SIGNUP_TEXTAREA = `${SIGNUP_INPUT} py-3 resize-none`;
export const SIGNUP_ERROR = 'mt-1.5 px-1 text-[13px] text-danger';
export const SIGNUP_HINT = 'mt-1.5 px-1 text-[13px] text-ink/70';
/** Opção que se escolhe tocando (categoria, comodidade, idioma). */
export const SIGNUP_CHOICE =
  'press min-h-14 px-3 py-2.5 rounded-2xl border flex items-center gap-2.5 text-left text-[15px] font-medium focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none disabled:opacity-40 disabled:cursor-not-allowed';
export const SIGNUP_CHOICE_ON = 'bg-partner-soft border-partner text-ink';
export const SIGNUP_CHOICE_OFF = 'bg-surface border-line text-ink';
