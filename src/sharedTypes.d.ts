export interface Mapping {
	authorizedToRun: boolean;
	mainId: string | null;
	linkedIds: string[];
	data: MappingVideo[];
	startDate: Date | null;
	lastUpdateDate: Date | null;
	error: MappingError;
}

export interface MappingError {
	isError: boolean;
	publicResponse: string;
	debug: any[];
}

export interface MappingVideo {
	id: string;
	linkedIds: string[];
	author: MappingVideoAuthor;
	title: string;
	uploadDate: Date;
	videoUrl: string;
	viewCountr: string;
	lengthSeconds: string;
}

export interface MappingVideoAuthor {
	id: string;
	name: string;
	verified: boolean;
	channelUrl: string;
	thumbnailUrl: string;
}

export interface _App {
	mapVideo(query: string): void,
	stopMapping(id: string): void,
	on(channel: string, func: (event: any, ...args: any[]) => void): any;
}