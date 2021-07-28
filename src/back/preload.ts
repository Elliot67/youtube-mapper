import { contextBridge, ipcRenderer } from "electron"
import { _App } from "../sharedTypes";

const endpoints: _App = {
	mapVideo: (id) => ipcRenderer.send('map-video', id),
	stopMapping: () => ipcRenderer.send('stop-mapping'),
	on: (channel, func) => ipcRenderer.on(channel, func),
}

contextBridge.exposeInMainWorld('_app', endpoints);
