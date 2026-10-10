import { firebaseApiFetch } from '../../../shared/infrastructure/firebase/firebaseApiFetch';
import { ContentPort, AppVersionInfo } from '../ports/contentPort';

export class ApiContentAdapter implements ContentPort {
  async getAppVersion(): Promise<AppVersionInfo> {
    try {
      const res = await firebaseApiFetch(
        '/api/version',
        { method: 'GET' },
        { requireAuth: false, requireAppCheck: true }
      );
      const data = await res.json();
      return {
        version: data?.version || '1.0.0',
        revision: data?.revision || 'local-dev',
      };
    } catch {
      return {
        version: '1.0.0',
        revision: 'local-dev',
      };
    }
  }
}
