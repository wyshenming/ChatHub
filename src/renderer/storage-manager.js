export class StorageManager {
  constructor({ localStorage, systemApi }) {
    this.localStorage = localStorage;
    this.systemApi = systemApi;
  }

  readJson(key) {
    try {
      return JSON.parse(this.localStorage.getItem(key) || "null");
    } catch {
      return null;
    }
  }

  writeJson(key, value) {
    this.localStorage.setItem(key, JSON.stringify(value));
  }

  readString(key) {
    return this.localStorage.getItem(key);
  }

  writeString(key, value) {
    this.localStorage.setItem(key, String(value));
  }

  async getCloseSettings() {
    return this.systemApi.getCloseSettings();
  }

  async setCloseSettings(settings) {
    return this.systemApi.setCloseSettings(settings);
  }

  async setAppearance(themeSource) {
    return this.systemApi.setAppearance(themeSource);
  }

  onAppearanceUpdated(callback) {
    return this.systemApi.onAppearanceUpdated(callback);
  }

  getPerformanceSettings() {
    const stored = this.readJson("chathub.performanceSettings.v1") || {};
    return {
      maxWebViewPoolSize: this.normalizeMaxWebViewPoolSize(stored.maxWebViewPoolSize),
    };
  }

  setPerformanceSettings(settings) {
    const nextSettings = {
      maxWebViewPoolSize: this.normalizeMaxWebViewPoolSize(settings?.maxWebViewPoolSize),
    };
    this.writeJson("chathub.performanceSettings.v1", nextSettings);
    return nextSettings;
  }

  getUiSettings() {
    const stored = this.readJson("chathub.uiSettings.v1") || {};
    return {
      sidebarCollapsed: Boolean(stored.sidebarCollapsed),
      startupTaskId: typeof stored.startupTaskId === "string" ? stored.startupTaskId : "",
      themeSource: this.normalizeThemeSource(stored.themeSource),
    };
  }

  setUiSettings(settings) {
    const current = this.getUiSettings();
    const nextSettings = {
      sidebarCollapsed:
        typeof settings?.sidebarCollapsed === "boolean" ? settings.sidebarCollapsed : current.sidebarCollapsed,
      startupTaskId:
        typeof settings?.startupTaskId === "string" ? settings.startupTaskId : current.startupTaskId,
      themeSource: this.normalizeThemeSource(settings?.themeSource ?? current.themeSource),
    };
    this.writeJson("chathub.uiSettings.v1", nextSettings);
    return nextSettings;
  }

  normalizeMaxWebViewPoolSize(value) {
    const parsed = Number(value);
    return [2, 3, 4, 5, 6].includes(parsed) ? parsed : 4;
  }

  normalizeThemeSource(value) {
    return ["system", "light", "dark"].includes(value) ? value : "system";
  }

  async clearServiceData(targets) {
    return this.systemApi.clearServiceData(targets);
  }

  async clearServiceCache(targets) {
    return this.systemApi.clearServiceCache(targets);
  }
}
