/** Classes dos controles do design system (D17): botões e campos têm um lugar só. */
const FOCUS = 'focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none';
const BUTTON_BASE = `press min-h-11 px-4 rounded-xl text-sm disabled:opacity-50 disabled:cursor-not-allowed ${FOCUS}`;

/** A ação principal da tela; só uma por tela (AGENTS.md §11.1). */
export const BUTTON_PRIMARY = `${BUTTON_BASE} bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold`;
export const BUTTON_SECONDARY = `${BUTTON_BASE} bg-surface border border-line hover:bg-accent-soft text-ink font-semibold`;
export const BUTTON_DANGER = `${BUTTON_BASE} bg-danger-soft border border-danger-line text-danger font-semibold`;
export const BUTTON_POSITIVE = `${BUTTON_BASE} bg-success-soft border border-success-line text-success font-semibold`;
export const INPUT = `w-full min-h-11 px-3 rounded-xl bg-surface border border-line text-sm text-ink ${FOCUS}`;
