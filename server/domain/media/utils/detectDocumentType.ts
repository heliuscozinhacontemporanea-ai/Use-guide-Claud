import { detectImageType, type SupportedImageType } from './detectImageType';

export type SupportedDocumentType = SupportedImageType | 'application/pdf';

/** Tipo pelo conteúdo (magic bytes), nunca pela extensão (AGENTS.md §7.10). SVG e HTML são recusados. */
export function detectDocumentType(buffer: Buffer): SupportedDocumentType | null {
  if (buffer.length >= 5 && buffer.subarray(0, 5).toString('ascii') === '%PDF-') {
    return 'application/pdf';
  }
  return detectImageType(buffer);
}
