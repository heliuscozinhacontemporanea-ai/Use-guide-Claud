/** Check-in feito sem internet, guardado no aparelho até a conexão voltar (D20). */
export interface PendingCheckIn {
  id: string;
  offerId: string;
  slotId: string;
  kind: 'code' | 'entry';
  /** O QR lido ou o código digitado, com a hora do aparelho. */
  payload: { code?: string; qrToken?: string; participantsPresent: number; capturedAt: string };
}

const KEY = 'useguide.pendingCheckIns';

// Armazenamento pode faltar (modo privado, bloqueio): sem ele, a fila fica vazia e nada quebra.
function read(): PendingCheckIn[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as PendingCheckIn[]) : [];
  } catch {
    return [];
  }
}

function write(items: PendingCheckIn[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    // Sem armazenamento o check-in não fica guardado; a tela já avisou que está sem internet.
  }
}

export const pendingCheckIns = {
  list(offerId: string): PendingCheckIn[] {
    return read().filter((item) => item.offerId === offerId);
  },
  add(item: Omit<PendingCheckIn, 'id'>): PendingCheckIn {
    const saved = { ...item, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` };
    write([...read(), saved]);
    return saved;
  },
  remove(id: string): void {
    write(read().filter((item) => item.id !== id));
  },
};
