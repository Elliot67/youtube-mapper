import { ipcMain } from "electron"
import fetch from "node-fetch";
import { Scraper } from "./Scraper";
import { isDef } from "../utils/general";
import { chord } from "d3";

interface Mapping {
	authorizedToRun: boolean,
	mainId: string | null,
	linkedIds: string[],
	data: object | null,
	startDate: Date | null,
	lastUpdateDate: Date | null,
	errors: string[],
}

export class Mapper {

	public static mappingState: any; // TODO: Add type
	public static mapping: Mapping;

	public static init() {
		Mapper.events();
		Mapper.resetMapping();
	}

	public static events() {

		ipcMain.on('map-id', async (e, mainId) => {
			Mapper.mapping.authorizedToRun = true;
			Mapper.mapping.mainId = mainId;
			Mapper.mapping.linkedIds.push(mainId);
			Mapper.mapping.startDate = new Date();
			Mapper.mapping.lastUpdateDate = new Date();

			Mapper.findLinkedIdsRecursively(mainId, mainId);
		});


		ipcMain.on('stop-mapping', (e) => {
			Mapper.resetMapping();
		});

	}

	public static async findLinkedIdsRecursively(mainId: string, id: string) {
		try {
			const linkedIds = await Mapper.getLinkedIds(id);
			const nextIds = Mapper.updateMapping(mainId, linkedIds);

			if (Mapper.shouldStopMapping(mainId)) {
				return;
			}

			nextIds.forEach((id) => {
				Mapper.findLinkedIdsRecursively(mainId, id);
			});
		} catch (error) {
			console.log(error, 'Error while finding ids');
			Mapper.mapping.errors.push('Error while finding ids');
		}
	}

	public static async getLinkedIds(id: string): Promise<any> {
		console.log(`searching video : ${id}`);
		try {
			const page = await fetch(Scraper.getYoutubeUrl(id)).then((response) => response.text());
			const linkedVideosIds = Scraper.getLinkedVideosId(page);
			console.log('found ids', linkedVideosIds);
			return Promise.resolve(linkedVideosIds);
		} catch (error) {
			console.log(error, 'Error while finding ids');
			return Promise.reject();
		}
	}

	public static updateMapping(mainId: string, idsFound: string[]): string[] {
		if (Mapper.shouldStopMapping(mainId)) {
			return [];
		}

		const newIds: string[] = [];
		idsFound.forEach((idFound) => {
			if (!Mapper.mapping.linkedIds.includes(idFound)) {
				newIds.push(idFound);
			}
		})
		Mapper.mapping.linkedIds.push(...newIds);
		Mapper.mapping.lastUpdateDate = new Date();


		// TODO: Update front
		/*
			e.reply('map-id', {
			data: mappingState.get(mainId),
			errors,
		})
		*/

		return newIds;
	}

	public static resetMapping() {
		Mapper.mapping = {
			authorizedToRun: false,
			mainId: null,
			linkedIds: [],
			data: null,
			startDate: null,
			lastUpdateDate: null,
			errors: [],
		};
	}

	public static shouldStopMapping(mainId: string): boolean {
		const shouldStop = !Mapper.mapping.authorizedToRun || Mapper.mapping.mainId !== mainId;
		if (shouldStop) {
			console.log('stopping the search');
		}
		return shouldStop;
	}
}