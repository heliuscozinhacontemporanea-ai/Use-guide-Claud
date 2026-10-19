/** Transforma a identidade de quem visitou (uid ou IP) numa chave opaca, sem guardar o original. */
export interface ViewerKeyPort {
  keyFor(viewer: string): string;
}
