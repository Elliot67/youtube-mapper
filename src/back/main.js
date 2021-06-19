const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const fetch = require('node-fetch')
const { isDef } = require('./utils/general')


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
	win.loadFile(path.join(__dirname, '../front/dist/index.html')).catch((error) => console.log(error))
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

//
// Start real work
//

const mappingState = new Map()

ipcMain.on('map-url', async (e, mainId) => {
	if (isDef(mappingState.get(mainId))) {
		e.reply('map-url', {
			error: 'Already running',
		})
		return;
	}

	mappingState.set(mainId, {
		authorizedToRun: true,
		data: null,
		linkedIds: [],
		startDate: new Date(),
		lastUpdateDate: new Date(),
		stoppedDate: null,
	})


	try {
		findLinkedIdsRecursively(mainId, mainId)
	} catch (error) {
		errors.push(error)
	}
})


ipcMain.on('stop-mapping', (e, mainId) => {
	const config = mappingState.get(mainId)
	mappingState.set(mainId, {
		...config,
		authorizedToRun: false,
	})
})


async function getLinkedIds(mainId, id) {
	console.log('searching ids for', id)
	const config = mappingState.get(mainId)
	if (!config.authorizedToRun) {
		return Promise.reject('Has been stopped');
	}

	try {
		const page = await fetch(getYoutubeUrl(id)).then((response) => response.text());
		const regex = new RegExp(/"image":{"thumbnails":\[{"url":"https:\/\/i\.ytimg\.com\/vi\/([A-Za-z0-9_\-]{11})\/hqdefault\.jpg\?sqp=/g)
		const linkedVideosIds = [...page.matchAll(regex)].map((captures) => captures[1])
		console.log('found ids', linkedVideosIds)
		return Promise.resolve(linkedVideosIds)
	} catch (error) {
		console.log(errror, 'Error when fetching the url')
		return Promise.reject();
	}
}

async function findLinkedIdsRecursively(mainId, id) {
	const linkedIds = await getLinkedIds(mainId, id)
	const nextIds = updateMappingState(mainId, id, linkedIds)

	nextIds.forEach((id) => {
		findLinkedIdsRecursively(mainId, id)
	})
}

function updateMappingState(mainId, id, idsFound) {
	const currentState = mappingState.get(mainId)

	console.log('linkedIds in state', currentState.linkedIds)

	let newIds = []
	idsFound.forEach((idFound) => {
		if (!currentState.linkedIds.includes(idFound)) {
			newIds.push(idFound)
		}
	})

	currentState.linkedIds.push(...newIds)
	mappingState.set(mainId, {
		...currentState,
		lastUpdateDate: new Date(),
	})

	/*

		e.reply('map-url', {
		data: mappingState.get(mainId),
		errors,
	})

	*/

	return newIds
}

function getYoutubeUrl(id) {
	return `https://www.youtube.com/watch?v=${id}`
}