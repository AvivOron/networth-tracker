import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  getData: (): Promise<unknown> => ipcRenderer.invoke('getData'),
  saveData: (data: unknown): Promise<boolean> => ipcRenderer.invoke('saveData', data),
  authenticateWithGoogle: (): Promise<string> => ipcRenderer.invoke('authenticateWithGoogle'),
  openExternal: (url: string): Promise<boolean> => ipcRenderer.invoke('shell:openExternal', url)
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
