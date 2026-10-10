export interface NotificationSettingsPatch {
  reviewNotifications?: boolean;
  planExpiringNotifications?: boolean;
}

const ALLOWED_KEYS = new Set(['reviewNotifications', 'planExpiringNotifications']);

export class UpdateNotificationSettingsDTO {
  readonly reviewNotifications?: boolean;
  readonly planExpiringNotifications?: boolean;

  constructor(data: NotificationSettingsPatch) {
    if (!data || typeof data !== 'object') {
      throw new Error('Dados inválidos para UpdateNotificationSettingsDTO');
    }

    for (const key of Object.keys(data)) {
      if (!ALLOWED_KEYS.has(key)) {
        throw new Error(`Propriedade não permitida: ${key}`);
      }
    }

    if (data.reviewNotifications !== undefined) {
      if (typeof data.reviewNotifications !== 'boolean') {
        throw new Error('reviewNotifications deve ser um booleano');
      }
      this.reviewNotifications = data.reviewNotifications;
    }

    if (data.planExpiringNotifications !== undefined) {
      if (typeof data.planExpiringNotifications !== 'boolean') {
        throw new Error('planExpiringNotifications deve ser um booleano');
      }
      this.planExpiringNotifications = data.planExpiringNotifications;
    }
  }

  toFirestorePayload(): Record<string, boolean> {
    const payload: Record<string, boolean> = {};
    if (this.reviewNotifications !== undefined) {
      payload.reviewNotifications = this.reviewNotifications;
    }
    if (this.planExpiringNotifications !== undefined) {
      payload.planExpiringNotifications = this.planExpiringNotifications;
    }
    return payload;
  }

  static fromRaw(data: any): UpdateNotificationSettingsDTO {
    return new UpdateNotificationSettingsDTO(data);
  }
}
