import { contextBridge, ipcRenderer } from "electron"
import { _App } from "../sharedTypes";

const endpoints: _App = {
	mapVideo: (id) => ipcRenderer.send('map-video', id),
	stopMapping: (id) => ipcRenderer.send('stop-mapping', id),
	on: (channel, func) => ipcRenderer.on(channel, func),
}

contextBridge.exposeInMainWorld('_app', endpoints);
