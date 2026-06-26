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

  async clearServiceData(targets) {
    return this.systemApi.clearServiceData(targets);
  }

  async clearServiceCache(targets) {
    return this.systemApi.clearServiceCache(targets);
  }
}
