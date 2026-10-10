export interface SendAdminMessageDTOData {
  recipientIds: string[] | 'all';
  title: string;
  message: string;
}

export class SendAdminMessageDTO {
  readonly recipientIds: string[] | 'all';
  readonly title: string;
  readonly message: string;

  constructor(data: SendAdminMessageDTOData) {
    if (!data || typeof data !== 'object') {
      throw new Error('Dados inválidos para SendAdminMessageDTO');
    }

    const title = typeof data.title === 'string' ? data.title.trim() : '';
    const message = typeof data.message === 'string' ? data.message.trim() : '';

    if (!title) {
      throw new Error('Título é obrigatório');
    }
    if (!message) {
      throw new Error('Mensagem é obrigatória');
    }

    if (data.recipientIds === 'all') {
      this.recipientIds = 'all';
    } else if (Array.isArray(data.recipientIds)) {
      this.recipientIds = data.recipientIds
        .filter((id): id is string => typeof id === 'string')
        .map((id) => id.trim())
        .filter((id) => id.length > 0);
    } else {
      throw new Error('Destinatários inválidos');
    }

    this.title = title;
    this.message = message;
  }

  static fromRaw(data: any): SendAdminMessageDTO {
    return new SendAdminMessageDTO(data);
  }
}
