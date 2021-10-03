import { MappingVideo, PartialMappingVideo } from "../../../sharedTypes";

enum MappingVideoState {
	DONE = 'done',
	LOADING = 'loading',
	WAITING = 'waiting',
}

export function isVideoMappingDone(video: MappingVideo | PartialMappingVideo): video is MappingVideo {
	return video.state === MappingVideoState.DONE;
}

export function isVideoMappingLoading(video: MappingVideo | PartialMappingVideo): video is PartialMappingVideo {
	return video.state === MappingVideoState.LOADING;
}

export function isVideoMappingWaiting(video: MappingVideo | PartialMappingVideo): video is PartialMappingVideo {
	return video.state === MappingVideoState.WAITING;
}

export function getHtmlTemplate(selector: string): DocumentFragment {
	const nodeTemplate: HTMLTemplateElement = document.querySelector(selector);
	const template = document.importNode(nodeTemplate.content, true);

	return template;
}
