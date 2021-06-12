const { contextBridge, ipcRenderer } = require('electron')


const mapUrl = (url) => ipcRenderer.send('map-url', url)
const stopMapping = (url) => ipcRenderer.send('stop-mapping', url)

contextBridge.exposeInMainWorld(
	'_app',
	{
		mapUrl,
		stopMapping,
	}
)

