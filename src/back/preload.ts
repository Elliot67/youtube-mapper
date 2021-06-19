import { contextBridge, ipcRenderer } from "electron"

const mapId = (id: string) => ipcRenderer.send('map-id', id)
const stopMapping = (id: string) => ipcRenderer.send('stop-mapping', id)

contextBridge.exposeInMainWorld(
	'_app',
	{
		mapId,
		stopMapping,
	}
)

