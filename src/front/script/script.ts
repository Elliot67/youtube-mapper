import { Card } from "./class/Card";
import { Graph } from "./class/Graph"
import { Search } from "./class/Search";

interface _App {
	mapId(id: string): object,
	stopMapping(id: string): object,
	on(channel: string, func: (event: any, ...args: any[]) => void): any;
}

declare global {
	interface Window {
		_app: _App;
	}
}

Graph.init();

Search.init();
Card.init();