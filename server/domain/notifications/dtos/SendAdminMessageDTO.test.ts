import { describe, expect, it } from 'vitest';
import { SendAdminMessageDTO } from './SendAdminMessageDTO';

describe('SendAdminMessageDTO', () => {
  it('deve normalizar recipients, title e message', () => {
    const dto = SendAdminMessageDTO.fromRaw({
      recipientIds: [' partner-1 ', ' ', 'partner-2'],
      title: '  Aviso  ',
      message: '  Mensagem importante  ',
    });

    expect(dto.recipientIds).toEqual(['partner-1', 'partner-2']);

    expect(dto.title).toBe('Aviso');
    expect(dto.message).toBe('Mensagem importante');
  });

  it('deve aceitar o destinatário especial all', () => {
    const dto = SendAdminMessageDTO.fromRaw({
      recipientIds: 'all',
      title: 'Aviso',
      message: 'Mensagem',
    });

    expect(dto.recipientIds).toBe('all');
  });

  it('deve rejeitar título vazio', () => {
    expect(() =>
      SendAdminMessageDTO.fromRaw({
        recipientIds: ['partner-1'],
        title: '',
        message: 'Mensagem',
      })
    ).toThrow();
  });

  it('deve rejeitar mensagem vazia', () => {
    expect(() =>
      SendAdminMessageDTO.fromRaw({
        recipientIds: ['partner-1'],
        title: 'Aviso',
        message: '',
      })
    ).toThrow();
  });
});
