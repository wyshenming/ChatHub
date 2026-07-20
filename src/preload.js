const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("aiChatHub", {
  clearServiceData: (partitions) => ipcRenderer.invoke("clear-service-data", partitions),
  clearServiceCache: (partitions) => ipcRenderer.invoke("clear-service-cache", partitions),
  appendWebViewPerformanceLog: (entry) => ipcRenderer.invoke("append-webview-performance-log", entry),
  getCloseSettings: () => ipcRenderer.invoke("get-close-settings"),
  setCloseSettings: (settings) => ipcRenderer.invoke("set-close-settings", settings),
  onWebViewOpenTab: (callback) => {
    const listener = (_event, payload) => callback(payload);
    ipcRenderer.on("webview-open-tab", listener);
    return () => ipcRenderer.removeListener("webview-open-tab", listener);
  },
  version: "1.2.6"
});
