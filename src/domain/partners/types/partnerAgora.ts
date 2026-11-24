/** A lista sem internet (evento) ou a portaria (atração) neste aparelho (C5), em termos neutros. */
export interface AgoraOfflineState {
  kind: 'list' | 'keys';
  status: 'missing' | 'ready' | 'no_connection';
  /** Só na lista: ingressos guardados e quando foi a última atualização. */
  count: number | null;
  updatedAt: string | null;
  online: boolean;
  busy: boolean;
  failed: boolean;
  download: () => void;
}
