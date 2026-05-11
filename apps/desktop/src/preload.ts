import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("encrypt", {
  platform: process.platform,
  loadState: () => ipcRenderer.invoke("shell:load-state"),
  saveState: (state: string) => ipcRenderer.invoke("shell:save-state", state),
  openExternal: (url: string) => ipcRenderer.invoke("shell:open-external", url),
  onShortcut: (listener: (command: string) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, command: string) => listener(command);
    ipcRenderer.on("shell:shortcut", handler);
    return () => ipcRenderer.removeListener("shell:shortcut", handler);
  },
  onBrowserAction: (listener: (payload: { action: string; url: string; title: string }) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, payload: { action: string; url: string; title: string }) => listener(payload);
    ipcRenderer.on("browser:action", handler);
    return () => ipcRenderer.removeListener("browser:action", handler);
  },
});