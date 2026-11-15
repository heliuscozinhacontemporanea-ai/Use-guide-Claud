import { type PartnerJoinDraft, parsePartnerJoinDraft } from '../utils/partnerJoinDraft';

// Só neste aparelho, enquanto a pessoa cria a conta e confirma o e-mail (D34). Classe Confidencial
// (telefone): sai do aparelho quando o painel é criado.
const KEY = 'useguide.partnerJoinDraft';

export function readPartnerJoinDraft(): PartnerJoinDraft | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? parsePartnerJoinDraft(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export function savePartnerJoinDraft(draft: PartnerJoinDraft): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(draft));
  } catch {
    // Sem armazenamento (aba anônima, bloqueio): o cadastro segue, só não sobrevive ao recarregar.
  }
}

export function clearPartnerJoinDraft(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // Nada guardado para apagar.
  }
}
