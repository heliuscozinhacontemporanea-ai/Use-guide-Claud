import { ContentPort, AppVersionInfo } from '../../ports/contentPort';

export class GetAppVersionUseCase {
  constructor(private contentPort: ContentPort) {}

  async execute(): Promise<AppVersionInfo> {
    return this.contentPort.getAppVersion();
  }
}
