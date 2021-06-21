import { Mapping, _App } from "../../sharedTypes";
import { Card } from "./class/Card";
import { Graph } from "./class/Graph"
import { Search } from "./class/Search";
import { Logs } from "./class/Logs";

declare global {
	interface Window {
		_app: _App;
	}
}

const log = new Logs('script', true);

Graph.init();
Search.init();
Card.init();

window._app.on('map-video', (e, data: Mapping) => {
	log.log(['Got response from map-video', data]);

	if (data.error.isError) {
		Search.showError(data.error.publicResponse);
	}
});


// FIXME: Temporary for debugging
window._app.on('log', (e, ...args: any) => {
	console.log(...args);
});