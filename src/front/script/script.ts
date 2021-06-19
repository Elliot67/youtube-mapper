import { Card } from "./class/Card";
import { Graph } from "./class/Graph"
import { Search } from "./class/Search";

interface _App {
	mapId(id: string): object,
	stopMapping(id: string): object,
}

declare global {
	interface Window {
		_app: _App;
	}
}

Graph.init();

Search.init();
Card.init();