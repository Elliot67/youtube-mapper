import { ipcMain } from "electron"
import { Scraper } from "./Scraper";
import * as ytdl from "ytdl-core";
import { Mapping, MappingVideo, PartialMappingVideo } from "../../sharedTypes";
import { isDef } from "../utils/general";


enum MappingVideoState {
	DONE = 'done',
	LOADING = 'loading',
	WAITING = 'waiting',
}

export class Mapper {

	public static mapping: Mapping;
	public static responseEvent: any;

	public static init() {
		Mapper.events();
		Mapper.resetMapping();
	}

	public static events() {

		ipcMain.on('map-video', async (e, query: string) => {
			Mapper.resetMapping();
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
			Mapper.mapping.startDate = new Date();
			Mapper.mapping.lastUpdateDate = new Date();

			Mapper.findLinkedIdsRecursively(mainId, mainId);
		});

		// TODO: Experimental, need to think how to build somthing robust
		ipcMain.on('stop-branch', async (e, videoId: string) => {
			if (!Mapper.mapping.data.has(videoId)) {
				Mapper.mapping.error.isError = true;
				Mapper.mapping.error.publicResponse = 'The video ID was not found';
				Mapper.mapping.error.debug.push('Can\'t stop branch of not found video');
				return;
			}

			const video = Mapper.mapping.data.get(videoId)

			// TODO: Remove all linkedIds of the videos recursively


			/* TODO: ADD before every update
			// Check if it has not been deleted
			if (!Mapper.mapping.data.has(id)) {
	
			}
			*/

			Mapper.mapping.lastUpdateDate = new Date();
		});


		ipcMain.on('stop-mapping', (e) => {
			Mapper.mapping.authorizedToRun = false;
		});

	}

	public static sendUpdate(): void {
		if (isDef(Mapper.responseEvent)) {
			Mapper.responseEvent.reply('map-video', Mapper.mapping);
		}
	}

	public static async findLinkedIdsRecursively(mainId: string, id: string) {
		if (Mapper.shouldStopMapping(mainId)) {
			return;
		}

		try {
			console.log(`searching video : ${id}`);
			const response = await Mapper.searchData(id);
			Mapper.updateVideoMapping(id, response);
			const nextIds = Mapper.getNextIds(id);

			Mapper.sendUpdate()
			if (Mapper.shouldStopMapping(mainId)) {
				return;
			}

			nextIds.forEach((id) => {
				console.log('going for new video : ', id);
				Mapper.findLinkedIdsRecursively(mainId, id);
				const video = Mapper.mapping.data.get(id);
				video.state = MappingVideoState.LOADING;
				Mapper.mapping.data.set(id, video);
			});
			Mapper.sendUpdate();

		} catch (error) {
			Mapper.mapping.error.isError = true;
			Mapper.mapping.error.debug.push(error);
			Mapper.mapping.error.publicResponse = 'An error occurred while finding linked video ids';
		}
	}

	public static async searchData(id: string): Promise<ytdl.videoInfo> {
		try {
			const response = await ytdl.getBasicInfo(Scraper.getYoutubeUrl(id));
			Mapper.responseEvent.reply('log', response);
			return Promise.resolve(response);
		} catch (error) {
			console.log(error, 'Error while finding the video : ', id);
			return Promise.reject();
		}
	}

	public static updateVideoMapping(id: string, r: ytdl.videoInfo): void {
		// @ts-ignore
		const linkedIdsElements: [] = r.player_response?.endscreen?.endscreenRenderer?.elements ?? [];
		const linkedIds: string[] = linkedIdsElements.reduce((acc: string[], el: any) => {
			const videoId = el?.endscreenElementRenderer?.endpoint?.watchEndpoint?.videoId ?? undefined;
			if (el?.endscreenElementRenderer?.style !== 'VIDEO' || !isDef(videoId)) {
				return acc;
			}
			return [...acc, videoId];
		}, []);

		const video: MappingVideo = {
			state: MappingVideoState.DONE,
			id: r.videoDetails.videoId,
			linkedIds: linkedIds,
			author: {
				id: r.videoDetails.author.id,
				name: r.videoDetails.author.name,
				verified: r.videoDetails.author.verified,
				channelUrl: r.videoDetails.author.channel_url,
				thumbnailUrl: r.videoDetails.author?.thumbnails?.[0]?.url ?? '', // TODO: Improve thumbnails picking method
			},
			title: r.videoDetails.title,
			uploadDate: new Date(r.videoDetails.uploadDate),
			videoUrl: r.videoDetails.video_url,
			viewCounter: r.videoDetails.viewCount,
			lengthSeconds: r.videoDetails.lengthSeconds,
			thumbnailUrl: r.videoDetails.thumbnails?.[0].url ?? '', // TODO: Improve thumbnails picking method
		};

		Mapper.mapping.data.set(id, video);
		video.linkedIds.forEach((linkedId) => {
			if (!Mapper.mapping.data.has(linkedId)) {
				const newVideo = {
					state: MappingVideoState.WAITING,
					id: linkedId,
				};
				Mapper.mapping.data.set(linkedId, newVideo);
			}
		});
		Mapper.mapping.lastUpdateDate = new Date();
	}

	public static getNextIds(id: string): string[] {
		const video = Mapper.mapping.data.get(id) as MappingVideo;
		const newIds: string[] = [];
		video.linkedIds.forEach((linkedId) => {
			const linkedVideo = Mapper.mapping.data.get(linkedId);
			if (Mapper.isVideoMappingWaiting(linkedVideo)) {
				newIds.push(linkedId);
			}
		});
		return newIds;
	}

	public static resetMapping() {
		Mapper.mapping = {
			authorizedToRun: false,
			mainId: null,
			data: new Map(),
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

	public static isVideoMappingDone(video: MappingVideo | PartialMappingVideo): video is MappingVideo {
		return video.state === MappingVideoState.DONE;
	}

	public static isVideoMappingLoading(video: MappingVideo | PartialMappingVideo): video is PartialMappingVideo {
		return video.state === MappingVideoState.LOADING;
	}

	public static isVideoMappingWaiting(video: MappingVideo | PartialMappingVideo): video is PartialMappingVideo {
		return video.state === MappingVideoState.WAITING;
	}
}
