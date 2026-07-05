const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("aiChatHub", {
  clearServiceData: (partitions) => ipcRenderer.invoke("clear-service-data", partitions),
  clearServiceCache: (partitions) => ipcRenderer.invoke("clear-service-cache", partitions),
  appendWebViewPerformanceLog: (entry) => ipcRenderer.invoke("append-webview-performance-log", entry),
  getCloseSettings: () => ipcRenderer.invoke("get-close-settings"),
  setCloseSettings: (settings) => ipcRenderer.invoke("set-close-settings", settings),
  version: "0.7.0"
});
