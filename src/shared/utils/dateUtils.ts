import { format, formatDistanceToNow, isAfter, isBefore, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Formata uma data para exibição amigável em Português (Ex: "30 de Julho de 2026").
 */
export function formatDate(date: string | Date, pattern = "dd 'de' MMMM 'de' yyyy"): string {
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(d)) return '';
    return format(d, pattern, { locale: ptBR });
  } catch {
    return '';
  }
}

/**
 * Retorna o tempo decorrido relativo (Ex: "há 5 minutos", "há 2 dias").
 */
export function formatRelativeTime(date: string | Date): string {
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(d)) return '';
    return formatDistanceToNow(d, { addSuffix: true, locale: ptBR });
  } catch {
    return '';
  }
}

/**
 * Verifica se a data atual já ultrapassou a data limite especificada.
 */
export function isDateExpired(expirationDate: string | Date): boolean {
  try {
    const d = typeof expirationDate === 'string' ? parseISO(expirationDate) : expirationDate;
    if (!isValid(d)) return false;
    return isBefore(d, new Date());
  } catch {
    return false;
  }
}

/**
 * Formata hora (Ex: "14:30").
 */
export function formatTime(date: string | Date): string {
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(d)) return '';
    return format(d, 'HH:mm', { locale: ptBR });
  } catch {
    return '';
  }
}
