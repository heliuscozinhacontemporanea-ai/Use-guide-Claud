export interface ImageUploadPort {
  uploadImage(file: File, folder?: string): Promise<string>;
}
