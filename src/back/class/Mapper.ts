import { ipcMain } from "electron"
import { Scraper } from "./Scraper";
import * as ytdl from "ytdl-core";
import { Mapping, MappingVideo } from "../../sharedTypes";
import { isDef } from "../utils/general";

export class Mapper {

	public static mapping: Mapping;
	public static responseEvent: any;

	public static init() {
		Mapper.events();
		Mapper.resetMapping();
	}

	public static events() {

		ipcMain.on('map-video', async (e, query) => {
			Mapper.responseEvent = e;

			let mainId: string;
			try {
				mainId = ytdl.getVideoID(query);
			} catch (error) {
				Mapper.mapping.error.isError = true;
				Mapper.mapping.error.publicResponse = 'Error while finding the video id';
				Mapper.mapping.error.debug.push(error);
				Mapper.responseEvent.reply('map-video', Mapper.mapping);
				return;
			}

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
		if (Mapper.shouldStopMapping(mainId)) {
			return;
		}

		try {
			console.log(`searching video : ${id}`);
			const nextIds = await Mapper.getNewLinkedIds(mainId, id);

			if (Mapper.shouldStopMapping(mainId)) {
				return;
			}

			nextIds.forEach((id) => {
				console.log('should go for', id);
				Mapper.findLinkedIdsRecursively(mainId, id);
			});
		} catch (error) {
			Mapper.mapping.error.isError = true;
			Mapper.mapping.error.debug.push(error);
			Mapper.mapping.error.publicResponse = 'An error occurred while finding linked video ids';
		}
	}

	public static async getNewLinkedIds(mainId: string, id: string): Promise<string[]> {
		try {
			const response = await ytdl.getBasicInfo(Scraper.getYoutubeUrl(id));
			Mapper.responseEvent.reply('log', response); // FIXME: For debug only
			if (Mapper.shouldStopMapping(mainId)) {
				return;
			}

			const videoMapping = Mapper.createCurrentVideoMapping(response);
			const newIds = Mapper.getNextIds(videoMapping.linkedIds);
			Mapper.updateMapping(videoMapping, newIds);

			return Promise.resolve(newIds);
		} catch (error) {
			console.log(error, 'Error while finding ids');
			return Promise.reject();
		}
	}

	public static createCurrentVideoMapping(r: ytdl.videoInfo): MappingVideo {
		// @ts-ignore
		const linkedIdsElements: [] = r.player_response?.endscreen?.endscreenRenderer?.elements ?? [];
		const linkedIds: string[] = linkedIdsElements.reduce((acc: string[], el: any) => {
			const videoId = el?.endscreenElementRenderer?.endpoint?.watchEndpoint?.videoId ?? undefined;
			if (el?.endscreenElementRenderer?.style !== 'VIDEO' || !isDef(videoId)) {
				return acc;
			}
			return [...acc, videoId];
		}, []);

		return {
			id: r.videoDetails.videoId,
			linkedIds: linkedIds,
			author: {
				id: r.videoDetails.author.id,
				name: r.videoDetails.author.name,
				verified: r.videoDetails.author.verified,
				channelUrl: r.videoDetails.author.channel_url,
				thumbnailUrl: r.videoDetails.author?.thumbnails[2]?.url ?? '',
			},
			title: r.videoDetails.title,
			uploadDate: new Date(r.videoDetails.uploadDate),
			videoUrl: r.videoDetails.video_url,
			viewCountr: r.videoDetails.viewCount,
			lengthSeconds: r.videoDetails.lengthSeconds,
		};
	}

	public static updateMapping(videoMapping: MappingVideo, newIds: string[]): void {
		Mapper.mapping.linkedIds.push(...newIds);
		Mapper.mapping.lastUpdateDate = new Date();
		Mapper.mapping.data.push(videoMapping);

		Mapper.responseEvent.reply('map-video', Mapper.mapping);
	}

	public static getNextIds(idsFound: string[]) {
		const newIds: string[] = [];
		idsFound.forEach((idFound) => {
			if (!Mapper.mapping.linkedIds.includes(idFound)) {
				newIds.push(idFound);
			}
		});
		return newIds;
	}

	public static resetMapping() {
		Mapper.mapping = {
			authorizedToRun: false,
			mainId: null,
			linkedIds: [],
			data: [],
			startDate: null,
			lastUpdateDate: null,
			error: {
				isError: false,
				publicResponse: "",
				debug: [],
			},
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