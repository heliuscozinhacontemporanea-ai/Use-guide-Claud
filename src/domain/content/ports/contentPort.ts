export interface AppVersionInfo {
  version: string;
  revision: string;
}

export interface ContentPort {
  getAppVersion(): Promise<AppVersionInfo>;
}
