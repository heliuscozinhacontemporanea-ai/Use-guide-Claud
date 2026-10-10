import { describe, expect, it } from 'vitest';
import { UpdateNotificationSettingsDTO } from './UpdateNotificationSettingsDTO';

describe('UpdateNotificationSettingsDTO', () => {
  it('deve aceitar configurações válidas', () => {
    const dto = UpdateNotificationSettingsDTO.fromRaw({
      reviewNotifications: false,
      planExpiringNotifications: true,
    });

    expect(dto.reviewNotifications).toBe(false);
    expect(dto.planExpiringNotifications).toBe(true);

    expect(dto.toFirestorePayload()).toEqual({
      reviewNotifications: false,
      planExpiringNotifications: true,
    });
  });

  it('deve aceitar atualização parcial', () => {
    const dto = UpdateNotificationSettingsDTO.fromRaw({
      reviewNotifications: false,
    });

    expect(dto.reviewNotifications).toBe(false);
    expect(dto.planExpiringNotifications).toBeUndefined();

    expect(dto.toFirestorePayload()).toEqual({
      reviewNotifications: false,
    });
  });

  it('deve rejeitar propriedades desconhecidas', () => {
    expect(() =>
      UpdateNotificationSettingsDTO.fromRaw({
        reviewNotifications: false,
        unknownField: true,
      })
    ).toThrow();
  });

  it('deve rejeitar valores que não sejam booleanos', () => {
    expect(() =>
      UpdateNotificationSettingsDTO.fromRaw({
        reviewNotifications: 'false',
      })
    ).toThrow();
  });
});
