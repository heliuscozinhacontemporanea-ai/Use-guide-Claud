import { i18n } from '../../i18n';
import { useUIStore } from '../../stores/useUIStore';

const APP_CHECK_CODES = ['APP_CHECK_REQUIRED', 'APP_CHECK_INVALID'] as const;
let noticeShown = false;

/**
 * Recusa do App Check derruba todas as telas de uma vez; um aviso só, com a causa, evita que cada
 * tela mostre "não foi possível carregar" sem dizer por quê.
 */
export async function noticeAppCheckFailure(response: Response): Promise<void> {
  if (response.status !== 401 || noticeShown) return;
  const body = await response
    .clone()
    .json()
    .catch(() => null);
  const code = body?.error?.code;
  if (!APP_CHECK_CODES.includes(code)) return;
  noticeShown = true;
  useUIStore.getState().showToast(i18n.t(`errors.appCheck.${code}`), 'error');
}
