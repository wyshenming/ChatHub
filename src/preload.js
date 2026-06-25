const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("aiChatHub", {
  clearServiceData: (partitions) => ipcRenderer.invoke("clear-service-data", partitions),
  getCloseSettings: () => ipcRenderer.invoke("get-close-settings"),
  setCloseSettings: (settings) => ipcRenderer.invoke("set-close-settings", settings),
  version: "0.4.4"
});
