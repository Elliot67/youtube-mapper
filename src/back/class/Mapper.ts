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

		/**
		 * Start a new mapping
		 */
		ipcMain.on('map-video', async (e, query: string, searchId: string) => {
			Mapper.resetMapping();
			Mapper.responseEvent = e;
			Mapper.mapping.searchId = searchId;

			let mainId: string;
			try {
				mainId = ytdl.getVideoID(query);
			} catch (error) {
				Mapper.mapping.errors.push({
					publicResponse: 'Error while finding the video id',
					debug: error,
					errorCode: 100,
				});
				Mapper.responseEvent.reply('map-video', Mapper.mapping);
				return;
			}

			Mapper.mapping.authorizedToRun = true;
			Mapper.mapping.mainId = mainId;
			Mapper.mapping.startDate = new Date();
			Mapper.mapping.lastUpdateDate = new Date();

			Mapper.findLinkedIdsRecursively(searchId, mainId);
		});

		/**
		 * Stop the search tree one a specific video | WIP
		 * TODO: Need to think how to build somthing robust
		 */
		ipcMain.on('stop-branch', async (e, videoId: string) => {
			if (!Mapper.mapping.data.has(videoId)) {
				Mapper.mapping.errors.push({
					publicResponse: 'The video ID was not found',
					debug: 'Can\'t stop branch of not found video',
					errorCode: 101,
				});
				return;
			}

			const video = Mapper.mapping.data.get(videoId)

			// Remove all linkedIds of the videos recursively


			/* ADD before every update
			// Check if it has not been deleted
			if (!Mapper.mapping.data.has(id)) {
	
			}
			*/

			Mapper.mapping.lastUpdateDate = new Date();
		});


		/**
		 * Stop the current mapping
		 */
		ipcMain.on('stop-mapping', (e) => {
			Mapper.mapping.authorizedToRun = false;
		});


		/**
		 * Stop the mapping for a running searchId
		 * Should only be used when the front didn't ask to stop but is not listening to the answers
		 */
		ipcMain.on('not-listening', (e, searchId: string) => {
			if (searchId === Mapper.mapping.searchId && Mapper.mapping.authorizedToRun) {
				Mapper.mapping.authorizedToRun = false;
			}
		});

	}

	public static sendUpdate(): void {
		if (isDef(Mapper.responseEvent)) {
			Mapper.responseEvent.reply('map-video', Mapper.mapping);
		}
	}

	public static async findLinkedIdsRecursively(searchId: string, videoId: string) {
		if (Mapper.shouldStopMapping(searchId)) {
			console.log('stopping the search');
			return;
		}

		try {
			console.log(`searching video : ${videoId}`);
			const response = await Mapper.searchData(videoId);
			Mapper.updateVideoMapping(videoId, response);
			const nextVideosId = Mapper.nextVideosId(videoId);

			Mapper.sendUpdate()
			if (Mapper.shouldStopMapping(searchId)) {
				console.log('stopping the search');
				return;
			}

			nextVideosId.forEach((nextVideoId) => {
				console.log('going for new video : ', nextVideoId);
				Mapper.findLinkedIdsRecursively(searchId, nextVideoId);
				const video = Mapper.mapping.data.get(nextVideoId);
				video.state = MappingVideoState.LOADING;
				Mapper.mapping.data.set(nextVideoId, video);
			});
			Mapper.sendUpdate();

		} catch (error) {
			Mapper.mapping.errors.push({
				publicResponse: 'An error occurred while finding linked video ids',
				debug: error,
			});
			Mapper.sendUpdate();
		}
	}

	public static async searchData(id: string): Promise<ytdl.videoInfo> {
		try {
			const response = await ytdl.getBasicInfo(Scraper.getYoutubeUrl(id));
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

		const authorThumbnailUrl = r.videoDetails.author?.thumbnails?.[r.videoDetails.author?.thumbnails.length - 1].url ?? '';
		const thumbnailUrl = r.videoDetails.thumbnails?.[r.videoDetails.thumbnails.length - 1].url ?? '';

		const video: MappingVideo = {
			state: MappingVideoState.DONE,
			id: r.videoDetails.videoId,
			linkedIds: linkedIds,
			author: {
				id: r.videoDetails.author.id,
				name: r.videoDetails.author.name,
				verified: r.videoDetails.author.verified,
				channelUrl: r.videoDetails.author.channel_url,
				thumbnailUrl: authorThumbnailUrl
			},
			title: r.videoDetails.title,
			uploadDate: new Date(r.videoDetails.uploadDate),
			videoUrl: r.videoDetails.video_url,
			viewCounter: r.videoDetails.viewCount,
			lengthSeconds: r.videoDetails.lengthSeconds,
			thumbnailUrl,
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

	public static nextVideosId(id: string): string[] {
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
			searchId: null,
			authorizedToRun: false,
			mainId: null,
			data: new Map(),
			startDate: null,
			lastUpdateDate: null,
			errors: [],
		};
	}

	public static shouldStopMapping(searchId: string): boolean {
		return !Mapper.mapping.authorizedToRun || Mapper.mapping.searchId !== searchId;
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
