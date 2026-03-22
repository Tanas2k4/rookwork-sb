const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  //custom title
  minimize: () => ipcRenderer.send("minimize-window"),
  maximize: () => ipcRenderer.send("maximize-window"),
  close: () => ipcRenderer.send("close-window"),
  //login logout form
  loginSuccess: () => ipcRenderer.send("login-success"),
  logout: () => ipcRenderer.send("logout"),
});
