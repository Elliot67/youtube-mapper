import { contextBridge, ipcRenderer } from "electron"
import { _App } from "../sharedTypes";

const endpoints: _App = {
	mapVideo: (id, searchId) => ipcRenderer.send('map-video', id, searchId),
	stopMapping: () => ipcRenderer.send('stop-mapping'),
	notListening: () => ipcRenderer.send('not-listening'),
	on: (channel, func) => ipcRenderer.on(channel, func),
}

contextBridge.exposeInMainWorld('_app', endpoints);
