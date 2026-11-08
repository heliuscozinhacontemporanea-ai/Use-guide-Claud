import type {
  NotificationLink,
  NotificationParams,
  NotificationType,
} from '../types/notificationTypes';

export interface PushDevice {
  id: string;
  token: string;
  locale: string;
}

/** Aparelhos com push ligado (D25). Só o backend lê; apagados ao sair, ao excluir a conta ou se o FCM recusar. */
export interface PushDevicePort {
  register(uid: string, token: string, locale: string): Promise<void>;
  unregister(uid: string, token: string): Promise<void>;
  listForUser(uid: string): Promise<PushDevice[]>;
  remove(deviceIds: string[]): Promise<void>;
  deleteAllForUser(uid: string): Promise<void>;
}

export interface PushMessage {
  title: string;
  body: string;
  link: NotificationLink | null;
  /** Mesmo aviso substitui o anterior no aparelho em vez de empilhar. */
  tag: string;
}

export interface PushSenderPort {
  /** Devolve os tokens que o FCM recusou de vez (aparelho desinstalado, permissão retirada). */
  send(tokens: string[], message: PushMessage): Promise<{ invalidTokens: string[] }>;
}

export interface OutboxEntry {
  id: string;
  recipientUid: string;
  type: NotificationType;
  params: NotificationParams;
  link: NotificationLink | null;
  attempts: number;
}

/**
 * Fila do push (outbox, §5.6). O aviso e a entrada nascem na mesma escrita; `notBefore` serve de
 * prazo e de trava: quem pega a entrada empurra o prazo, e outra execução do job não a repete.
 */
export interface NotificationOutboxPort {
  claimDue(now: Date, limit: number, leaseMs: number): Promise<OutboxEntry[]>;
  enqueue(entry: Omit<OutboxEntry, 'attempts'>, notBefore: Date): Promise<boolean>;
  complete(id: string): Promise<void>;
  defer(id: string, notBefore: Date): Promise<void>;
  retryLater(id: string, attempts: number, notBefore: Date): Promise<void>;
  deleteAllForUser(uid: string): Promise<void>;
}
