// @ts-nocheck
const { app, BrowserWindow } = require('electron')
const path = require('path')


function createWindow() {
	const win = new BrowserWindow({
		show: false,
		webPreferences: {
			preload: path.join(__dirname, 'preload.js')
		}
	})
	win.maximize()
	win.show = true
	win.openDevTools();
	win.loadFile(path.join(__dirname, '../../front/dist/index.html')).catch((error) => console.log(error))
}

app.on('window-all-closed', function () {
	if (process.platform !== 'darwin') app.quit()
})


app.whenReady().then(() => {
	createWindow()

	app.on('activate', function () {
		if (BrowserWindow.getAllWindows().length === 0) createWindow()
	})
})

require('./mapper');