import * as d3 from "d3";
import dagreD3 from "dagre-d3";

export class Graph {

	constructor() {
		this.g = new dagreD3.graphlib.Graph()
			.setGraph({ rankdir: 'LR' })
			.setDefaultEdgeLabel(function () { return {}; }); // FIXME: Is it needed ?
		this.render = new dagreD3.render();
		this.$svg = document.querySelector("#canvas");
		this.setup();
		this.render(this.svgG, this.g);
		this.center();
	}

	setup() {
		// TODO: A récupérer depuis main
		const data = {
			id: "videoId",
			url: "https://www.youtube.com/watch?v=______",
			title: "The video title",
			imageUrl: "https://picsum.photos/480/360",
			channelName: "Channel name",
			channelUrl: "https://picsum.photos/36/36",
			// TODO: Maybe more data later
		};
		this.g.setNode(0, this.getNodeLabel(data));
		this.g.setNode(1, this.getNodeLabel(data));
		this.g.setNode(2, this.getNodeLabel(data));
		this.g.setNode(3, this.getNodeLabel(data));
		this.g.setNode(4, this.getNodeLabel(data));
		this.g.setNode(5, this.getNodeLabel(data));
		this.g.setNode(6, this.getNodeLabel(data));
		this.g.setNode(7, this.getNodeLabel(data));
		this.g.setNode(8, this.getNodeLabel(data));
		this.g.setNode(9, this.getNodeLabel(data));
		this.g.setNode(10, this.getNodeLabel(data));
		this.g.setNode(11, this.getNodeLabel(data));
		this.g.setNode(12, this.getNodeLabel(data));
		this.g.setNode(13, this.getNodeLabel(data));
		this.g.setNode(14, this.getNodeLabel(data));

		this.g.nodes().forEach((v) => {
			var node = this.g.node(v);
			node.rx = node.ry = 5;
		});

		this.g.setEdge(3, 4);
		this.g.setEdge(2, 3);
		this.g.setEdge(1, 2);
		this.g.setEdge(6, 7);
		this.g.setEdge(5, 6);
		this.g.setEdge(9, 10);
		this.g.setEdge(8, 9);
		this.g.setEdge(11, 3);
		this.g.setEdge(8, 5);
		this.g.setEdge(5, 8);
		this.g.setEdge(1, 5);
		this.g.setEdge(13, 14);
		this.g.setEdge(12, 8);
		this.g.setEdge(1, 14);
		this.g.setEdge(0, 1);


		this.svg = d3.select(this.$svg);
		this.svgG = this.svg.append("g");
		const zoom = d3.zoom()
			.scaleExtent([0.5, 2])
			.on("zoom", (event) => {
				this.svgG.attr("transform", event.transform);
			});
		this.svg.call(zoom);
	}

	center() {
		const scale = 0.5;
		const xCenterOffset = (this.$svg.getBoundingClientRect().width - this.svgG.node().getBBox().width) / 2;
		const yCenterOffset = (this.$svg.getBoundingClientRect().height - this.svgG.node().getBBox().height) / 2;
		// FIXME: Smthing wrong with larger node

		// Applying translate a second time to correct the translation applied by the scale
		this.svg.call(d3.zoom().transform, d3.zoomIdentity.translate(xCenterOffset, yCenterOffset).scale(scale).translate(xCenterOffset, yCenterOffset));
		this.svgG.attr("transform", `translate(${xCenterOffset}, ${yCenterOffset}) scale(${scale}) translate(${xCenterOffset}, ${yCenterOffset})`);
	}

	getNodeLabel(data) {
		return {
			labelType: "html",
			label: this.getNodeHtml(data)
		}
	}

	getNodeHtml(data) {
		const nodeTemplate = document.querySelector("template#node");
		const template = document.importNode(nodeTemplate.content, true);

		const title = template.querySelector(".node-title");
		title.textContent = data.title;
		console.log(data.url);
		title.setAttribute('href', data.url);
		const img = template.querySelector(".node-image");
		img.setAttribute("src", data.imageUrl);

		const channelImg = template.querySelector(".node-channelImage");
		channelImg.setAttribute("src", data.channelUrl);

		return template;
	}

}