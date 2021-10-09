import { Mapping, _App } from "../../sharedTypes";
import { Card } from "./class/Card";
import { Graph } from "./class/Graph"
import { Search } from "./class/Search";
import { Logs } from "./class/Logs";
import { Errors } from "./class/Errors";

const log = new Logs('script', true);

Graph.init();
Search.init();
Card.init();
Errors.init();

window._app.on('map-video', (e, data: Mapping) => {
	log.log(['Got response from map-video', data]);

	if (data.searchId !== Search.searchId) {
		log.log(['The response was not from the last search']);
		window._app.notListening(data.searchId);
		return;
	}

	if (data.errors.length > 0) {
		Errors.showErrors(data.errors);
	}

	Graph.mapIt(data);
	Card.globalUpdate(data);
});
