import { Mapping, MappingVideo, MappingVideoState, PartialMappingVideo } from "../../../sharedTypes";
import { Graph } from "./Graph";
import { formatTime, isDef } from "../utils/general";
import { isVideoMappingDone, isVideoMappingLoading } from "../utils/specific";

type CardStateType = 'hidden' | MappingVideoState;

enum CardState {
	NONE = 'hidden',
	DONE = 'done',
	LOADING = 'loading',
	WAITING = 'waiting',
}

export class Card {

	public static $card: HTMLElement;
	public static currentState: CardStateType = CardState.NONE;

	public static init() {
		this.$card = document.querySelector(".Card-container-JS");
	}

	public static setState(state: CardStateType) {
		this.currentState = state;
		this.$card.dataset.state = state;
	}

	public static globalUpdate(data: Mapping) {
		if (!isDef(Graph.selectedNode) || (this.currentState !== CardState.WAITING && this.currentState !== CardState.LOADING)) {
			return;
		}
		const selectedData = data.data.get(Graph.selectedNode);
		if (!isDef(selectedData) || selectedData.state === this.currentState) {
			return;
		}

		this.updateCard(selectedData);
	}

	public static updateCard(video?: MappingVideo | PartialMappingVideo) {
		if (!isDef(video)) {
			this.setState(CardState.NONE);
			return;
		}

		const html = isVideoMappingDone(video) ?
			this.getCardHtmlDone(video) :
			isVideoMappingLoading(video) ? this.getCardHtmlLoading(video) : this.getCardHtmlWaiting(video);

		// @ts-ignore
		this.$card.replaceChildren(html);
		this.setState(video.state);
	}

	public static getCardHtmlDone(video: MappingVideo): DocumentFragment {
		const nodeTemplate: HTMLTemplateElement = document.querySelector("template#card-done");
		const template = document.importNode(nodeTemplate.content, true);

		template.querySelector(".card-image").setAttribute("src", video.thumbnailUrl);
		const duration = formatTime(parseInt(video.lengthSeconds));
		template.querySelector(".card-imageTimer").textContent = duration;
		template.querySelector(".card-title").textContent = video.title;
		const viewCounter = parseInt(video.viewCounter).toLocaleString();
		template.querySelector(".card-viewCounter").textContent = viewCounter;
		template.querySelector(".card-uploadDate").textContent = video.uploadDate.toLocaleDateString();
		template.querySelector(".card-channelImage").setAttribute("src", video.author.thumbnailUrl);
		template.querySelector(".card-channelName").textContent = video.author.name;

		return template;
	}

	public static getCardHtmlLoading(video: PartialMappingVideo): DocumentFragment {
		const nodeTemplate: HTMLTemplateElement = document.querySelector("template#card-loading");
		const template = document.importNode(nodeTemplate.content, true);

		return template;
	}

	public static getCardHtmlWaiting(video: PartialMappingVideo): DocumentFragment {
		const nodeTemplate: HTMLTemplateElement = document.querySelector("template#card-waiting");
		const template = document.importNode(nodeTemplate.content, true);

		return template;
	}
}
