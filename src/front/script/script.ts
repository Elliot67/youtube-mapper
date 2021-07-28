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

	if (data.searchId !== Search.searchId) {
		log.log(['The response was not from the last search']);
		return;
	}

	if (data.error.isError) {
		if (data.error.errorCode === 100) {
			Search.showError(data.error.publicResponse);
			return;
		} else {
			// TODO: Show error in a seperate block (inside sidebar)
		}
	}

	Graph.mapIt(data);
	Card.globalUpdate(data);
});


// FIXME: Temporary for debugging
window._app.on('log', (e, ...args: any) => {
	console.log('COMING FROM THE BACK', ...args);
});
