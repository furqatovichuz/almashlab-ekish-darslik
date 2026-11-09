const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  getToc: () => ipcRenderer.invoke("toc"),
  readPdf: (file) => ipcRenderer.invoke("pdf", file),
});
