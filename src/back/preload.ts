// @ts-nocheck
const { contextBridge, ipcRenderer } = require('electron')


const mapId = (id) => ipcRenderer.send('map-id', id)
const stopMapping = (id) => ipcRenderer.send('stop-mapping', id)

contextBridge.exposeInMainWorld(
	'_app',
	{
		mapId,
		stopMapping,
	}
)

