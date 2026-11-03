import { firebaseApiFetch } from '../../../shared/infrastructure/firebase/firebaseApiFetch';
import { AppVersionInfo, ContentPort } from '../ports/contentPort';

export class ApiContentAdapter implements ContentPort {
  async getAppVersion(): Promise<AppVersionInfo> {
    const res = await firebaseApiFetch(
      '/api/version',
      { method: 'GET' },
      { requireAuth: false, requireAppCheck: true }
    );
    if (!res.ok) throw new Error('VERSION_UNAVAILABLE');
    const data = (await res.json()) as Partial<AppVersionInfo>;
    // Sem versão de verdade, a tela não mostra nenhuma (nada de número inventado, AGENTS.md §11.10).
    if (!data.version) throw new Error('VERSION_UNAVAILABLE');
    return { version: data.version, revision: data.revision ?? '' };
  }
}
