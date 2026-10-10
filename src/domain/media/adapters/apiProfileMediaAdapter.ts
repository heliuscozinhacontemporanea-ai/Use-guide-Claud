import { ProfileMediaPort } from '../ports/profileMediaPort';
import { firebaseApiFetch } from '../../../shared/infrastructure/firebase/firebaseApiFetch';

export class ApiProfileMediaAdapter implements ProfileMediaPort {
  async uploadProfilePhoto(_userId: string, imageBlob: Blob): Promise<string> {
    const photoBase64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Erro ao converter imagem em base64'));
        }
      };
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsDataURL(imageBlob);
    });

    const response = await firebaseApiFetch(
      '/api/users/me/photo',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          photoBase64,
          mimeType: imageBlob.type || 'image/jpeg',
        }),
      },
      { requireAuth: true }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Falha no upload da foto de perfil');
    }

    const data = await response.json();
    return data.photoURL;
  }

  async deleteProfilePhoto(_userId: string): Promise<void> {
    // Foto é gerenciada pelo ciclo de vida do backend
  }
}
