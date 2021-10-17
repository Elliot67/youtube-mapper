import { Mapping, _App } from "../../sharedTypes";
import { Card } from "./class/Card";
import { Graph } from "./class/Graph"
import { Search } from "./class/Search";
import { Logs } from "./class/Logs";
import { Errors } from "./class/Errors";
import { throttle as _throttle } from "lodash";

const log = new Logs('script', true);

Graph.init();
Search.init();
Card.init();
Errors.init();

const throttleMappingRender = _throttle((data: Mapping) => {
	Graph.mapIt(data);
	Card.globalUpdate(data);
}, 1500);

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

	throttleMappingRender(data);
});
