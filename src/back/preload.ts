import { contextBridge, ipcRenderer } from "electron"

const mapId = (id: string) => ipcRenderer.send('map-id', id);
const stopMapping = (id: string) => ipcRenderer.send('stop-mapping', id);
const on = (channel: string, func: (event: Electron.IpcRendererEvent, ...args: any[]) => void) => ipcRenderer.on(channel, func);

const endpoints = {
	mapId,
	stopMapping,
	on,
}

contextBridge.exposeInMainWorld('_app', endpoints);

