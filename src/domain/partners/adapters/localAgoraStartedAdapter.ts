const KEY = 'useguide.agoraStarted';
// Só os horários recentes: o cartão some sozinho no fim do serviço, a lista não precisa crescer.
const MAX = 50;

// Armazenamento pode faltar (modo privado, bloqueio): sem ele, "Iniciar serviço" some só na sessão.
function read(): string[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

/** Horários em que o prestador tocou "Iniciar serviço" neste aparelho (D27). */
export const agoraStarted = {
  list: read,
  add(slotId: string): string[] {
    const next = [...read().filter((id) => id !== slotId), slotId].slice(-MAX);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // Sem armazenamento, vale até recarregar a página.
    }
    return next;
  },
};
