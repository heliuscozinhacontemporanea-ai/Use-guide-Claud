/**
 * Uma ação de admin no registro de auditoria (AGENTS.md §7.10, A09; escolhas da F4): quem fez, o
 * quê e quando. Classe Interna: só o servidor lê e grava. Não guarda o corpo do pedido (pode ter PII).
 */
export interface AdminAuditEntry {
  /** uid de quem tem a claim `admin`. */
  actorUid: string;
  /** Método e rota, com os parâmetros como no roteador (ex.: `PUT /api/partners/items/:id`). */
  action: string;
  /** Ids dos parâmetros da rota (anúncio, evento, sessão). */
  targets: Record<string, string>;
  status: number;
  requestId?: string;
  at: string;
}
