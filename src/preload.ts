import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('flyScreen', {
  exitApp: (): Promise<void> => ipcRenderer.invoke('app-exit'),
});
