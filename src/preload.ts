// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron";
import { channels } from "./shared/constants";

contextBridge.exposeInMainWorld("electron", {
  installCLI: () => ipcRenderer.invoke(channels.INSTALL_CLI),
  startCLI: (flags?: string[]) => ipcRenderer.invoke(channels.START_CLI, flags),
  stopCLI: () => ipcRenderer.invoke(channels.STOP_CLI),
  quit: () => ipcRenderer.invoke(channels.QUIT),
  openExternalLink: (url: string) =>
    ipcRenderer.invoke(channels.OPEN_EXTERNAL_LINK, url),
});

export interface ElectronAPI {
  installCLI: () => Promise<void>;
  openExternalLink: (url: string) => Promise<void>;
  startCLI: (
    flags?: string[]
  ) => Promise<{ success: boolean; message?: string }>;
  stopCLI: () => Promise<{ success: boolean; message?: string }>;
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}
