export const CONTENT_IMAGE_FOLDERS = ['guia_local', 'agenda_eventos', 'partners'] as const;
export type ContentImageFolder = (typeof CONTENT_IMAGE_FOLDERS)[number];
export const MAX_IMAGE_BYTES = 6 * 1024 * 1024;
