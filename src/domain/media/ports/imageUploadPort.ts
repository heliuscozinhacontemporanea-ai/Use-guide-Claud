export type ImageUploadFolder = 'guia_local' | 'agenda_eventos' | 'partners';

export interface ImageUploadPort {
  uploadImage(file: File, folder: ImageUploadFolder): Promise<string>;
}
