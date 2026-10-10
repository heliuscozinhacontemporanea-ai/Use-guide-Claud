export interface ProfileMediaPort {
  /**
   * Faz upload de uma imagem de perfil e retorna a URL pública de download.
   */
  uploadProfilePhoto(userId: string, imageBlob: Blob): Promise<string>;

  /**
   * Remove a foto de perfil do usuário, se existir. Não lança erro se não houver foto.
   */
  deleteProfilePhoto(userId: string): Promise<void>;
}
