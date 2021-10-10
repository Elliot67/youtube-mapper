import { app, BrowserWindow, shell } from "electron";
import * as path from "path";
import { Mapper } from "./class/Mapper";

function createWindow() {
	const win = new BrowserWindow({
		show: false,
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
		}
	})
	win.maximize();
	if (process.env.NODE_ENV === 'dev') {
		win.webContents.openDevTools();
	}
	win.setMenu(null);
	win.show();
	win.loadFile(path.join(__dirname, '../../front/dist/index.html'))
		.catch((error) => console.log(error));

	win.webContents.setWindowOpenHandler(({ url }) => {
		shell.openExternal(url);
		return { action: 'deny' };
	});
}

app.on('window-all-closed', function () {
	if (process.platform !== 'darwin') app.quit();
});


app.whenReady().then(() => {
	createWindow();

	app.on('activate', function () {
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	});
});

Mapper.init();
