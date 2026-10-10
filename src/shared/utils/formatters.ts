/**
 * Interface que representa as coordenadas e dimensões para o recorte de imagens.
 */
interface PixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Amplia ou adiciona parâmetros para otimizar URLs de imagens do Unsplash,
 * ou retorna o valor em Base64/outros formatos diretamente caso não suportarem parâmetros.
 */
export function optimizeImage(url: string, width: number = 800): string {
  if (!url) return '';

  // Retorna base64 diretamente (pois não aceita parâmetros de query de otimização)
  if (url.startsWith('data:')) return url;

  // Para URLs padrões do Unsplash, anexamos parâmetros de largura e qualidade
  if (url.includes('unsplash.com') || url.includes('images.unsplash.com')) {
    const separator = url.includes('?') ? '&' : '?';
    if (!url.includes('w=')) {
      return `${url}${separator}w=${width}&q=80&auto=format`;
    }
  }

  return url;
}

/**
 * Recorta uma imagem utilizando o Canvas e retorna um Blob gerado em formato JPEG de alta qualidade.
 */
export async function getCroppedImg(imageSrc: string, pixelCrop: PixelCrop): Promise<Blob> {
  // Criação de uma promessa para carga assíncrona da imagem
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', (err) => reject(err));
    img.setAttribute('crossOrigin', 'anonymous'); // Evita problemas de CORS com servidores de imagens externos
    img.src = imageSrc;
  });

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Não foi possível obter o contexto 2D do Canvas.');
  }

  const { width, height, x, y } = pixelCrop;
  // Garante que as dimensões recebidas são válidas antes de realizar o desenho do recorte
  if (width <= 0 || height <= 0) {
    throw new Error('As dimensões de recorte fornecidas são inválidas.');
  }

  // Define os tamanhos do canvas para equivaler exatamente às dimensões de recorte desejadas
  canvas.width = width;
  canvas.height = height;

  // Desenha a seção recortada mapeando as coordenadas correspondentes da imagem de origem para o canvas
  ctx.drawImage(image, x, y, width, height, 0, 0, width, height);

  // Retorna uma nova promessa contendo a imagem convertida para Blob (JPEG com 95% de fidelidade)
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Falha ao processar o recorte no canvas.'));
          return;
        }
        resolve(blob);
      },
      'image/jpeg',
      0.95
    );
  });
}

export function getUserInitials(name?: string | null, email?: string | null): string {
  const cleanName = (name || '').trim();
  if (cleanName) {
    const parts = cleanName.split(/\s+/).filter(Boolean);
    const first = parts[0];
    const second = parts[1];
    if (first && second) {
      return (first.charAt(0) + second.charAt(0)).toUpperCase();
    }
    if (first && first.length >= 2) {
      return first.slice(0, 2).toUpperCase();
    }
    if (first && first.length === 1) {
      return first.charAt(0).toUpperCase();
    }
  }

  const emailUser = (email || '').split('@')[0] ?? '';
  const cleanEmail = emailUser.replace(/[^a-zA-Z0-9]/g, ' ').trim();
  if (cleanEmail) {
    const parts = cleanEmail.split(/\s+/).filter(Boolean);
    const first = parts[0];
    const second = parts[1];
    if (first && second) {
      return (first.charAt(0) + second.charAt(0)).toUpperCase();
    }
    return cleanEmail.slice(0, 2).toUpperCase();
  }

  return '';
}

export function formatRelativeTime(dateInput: string | number | Date): string {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return '';

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'agora mesmo';
  }
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `há ${diffInMinutes} ${diffInMinutes === 1 ? 'minuto' : 'minutos'}`;
  }
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `há ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`;
  }
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `há ${diffInDays} ${diffInDays === 1 ? 'dia' : 'dias'}`;
  }
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `há ${diffInMonths} ${diffInMonths === 1 ? 'mês' : 'meses'}`;
  }
  return date.toLocaleDateString('pt-BR');
}
