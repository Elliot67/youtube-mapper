import { ipcMain } from "electron"
import fetch from "node-fetch";
import { isDef } from "./utils/general";
import { getLinkedVideosId } from "./utils/scraper";


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
		//errors.push(error)
		// FIXME: 
	}
})


ipcMain.on('stop-mapping', (e, mainId) => {
	const config = mappingState.get(mainId)
	mappingState.set(mainId, {
		...config,
		authorizedToRun: false,
	})
})


async function getLinkedIds(mainId: string, id: string) {
	console.log('searching ids for', id)
	const config = mappingState.get(mainId)
	if (!config.authorizedToRun) {
		return Promise.reject('Has been stopped');
	}

	try {
		const page = await fetch(getYoutubeUrl(id)).then((response) => response.text());
		const linkedVideosIds = getLinkedVideosId(page)
		console.log('found ids', linkedVideosIds)
		return Promise.resolve(linkedVideosIds)
	} catch (error) {
		console.log(error, 'Error when fetching the url')
		return Promise.reject();
	}
}

async function findLinkedIdsRecursively(mainId: string, id: string) {
	const linkedIds = await getLinkedIds(mainId, id)
	const nextIds = updateMappingState(mainId, id, linkedIds)

	nextIds.forEach((id) => {
		findLinkedIdsRecursively(mainId, id)
	})
}

function updateMappingState(mainId: string, id: string, idsFound: string[]) {
	const currentState = mappingState.get(mainId)

	console.log('linkedIds in state', currentState.linkedIds)

	let newIds: string[] = []
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

function getYoutubeUrl(id: string) {
	return `https://www.youtube.com/watch?v=${id}`
}