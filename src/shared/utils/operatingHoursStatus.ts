import { GuideItemOperationalInfo } from '../../domain/guide';

export const DAY_KEYS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
export const DAY_LABELS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export interface OperatingStatus {
  isOpen: boolean;
  label: string; // "Aberto agora" | "Fechado agora" | "Horário não informado"
  detail: string; // "Fecha às 22:00" | "Abre às 08:00" | ""
}

/**
 * Calcula se o estabelecimento está aberto agora, com base no dia e hora atuais
 * e no operatingHours cadastrado pelo parceiro/admin.
 */
export function getOperatingStatus(
  operatingHours: GuideItemOperationalInfo['operatingHours'] | undefined
): OperatingStatus {
  if (!operatingHours || Object.keys(operatingHours).length === 0) {
    return { isOpen: false, label: 'Horário não informado', detail: '' };
  }

  const now = new Date();
  const todayKey = DAY_KEYS[now.getDay()];
  if (!todayKey) {
    return { isOpen: false, label: 'Horário não informado', detail: '' };
  }
  const todayHours = operatingHours[todayKey];

  if (!todayHours || todayHours.closed) {
    return { isOpen: false, label: 'Fechado hoje', detail: '' };
  }

  const [openH = 0, openM = 0] = todayHours.open.split(':').map(Number);
  const [closeH = 0, closeM = 0] = todayHours.close.split(':').map(Number);

  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  // Suporta horário que passa da meia-noite (ex: 18:00 às 02:00)
  const isOvernight = closeMinutes < openMinutes;
  const isOpenNow = isOvernight
    ? nowMinutes >= openMinutes || nowMinutes < closeMinutes
    : nowMinutes >= openMinutes && nowMinutes < closeMinutes;

  if (isOpenNow) {
    return { isOpen: true, label: 'Aberto agora', detail: `Fecha às ${todayHours.close}` };
  }

  return { isOpen: false, label: 'Fechado agora', detail: `Abre às ${todayHours.open}` };
}
