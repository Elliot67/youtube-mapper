export interface Mapping {
	searchId: string;
	authorizedToRun: boolean;
	mainId: string | null;
	data: MappingVideos;
	startDate: Date | null;
	lastUpdateDate: Date | null;
	errors: MappingError[];
}

export interface MappingError {
	publicResponse: string;
	debug: any;
	errorCode?: number;
}

export type MappingVideos = Map<string, MappingVideo | PartialMappingVideo>;

export interface PartialMappingVideo {
	state: MappingVideoState;
	id: string;
}

export interface MappingVideo extends PartialMappingVideo {
	linkedIds: string[];
	author: MappingVideoAuthor;
	title: string;
	uploadDate: Date;
	videoUrl: string;
	viewCounter: string;
	lengthSeconds: string;
	thumbnailUrl: string;
}

type MappingVideoState = 'done' | 'loading' | 'waiting';

export interface MappingVideoAuthor {
	id: string;
	name: string;
	verified: boolean;
	channelUrl: string;
	thumbnailUrl: string;
}

export interface _App {
	mapVideo(query: string, searchId: string): void,
	stopMapping(): void,
	notListening(searchId: string): void,
	on(channel: string, func: (event: any, ...args: any[]) => void): any;
}
