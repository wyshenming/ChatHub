const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("aiChatHub", {
  clearServiceData: (partitions) => ipcRenderer.invoke("clear-service-data", partitions),
  clearServiceCache: (partitions) => ipcRenderer.invoke("clear-service-cache", partitions),
  appendWebViewPerformanceLog: (entry) => ipcRenderer.invoke("append-webview-performance-log", entry),
  getWebViewProcessMetrics: () => ipcRenderer.invoke("get-webview-process-metrics"),
  getCloseSettings: () => ipcRenderer.invoke("get-close-settings"),
  setCloseSettings: (settings) => ipcRenderer.invoke("set-close-settings", settings),
  setAppearance: (themeSource) => ipcRenderer.invoke("set-appearance", themeSource),
  onAppearanceUpdated: (callback) => {
    const listener = (_event, appearance) => callback(appearance);
    ipcRenderer.on("appearance-updated", listener);
    return () => ipcRenderer.removeListener("appearance-updated", listener);
  },
  onWebViewOpenTab: (callback) => {
    const listener = (_event, payload) => callback(payload);
    ipcRenderer.on("webview-open-tab", listener);
    return () => ipcRenderer.removeListener("webview-open-tab", listener);
  },
  version: "1.2.7"
});
