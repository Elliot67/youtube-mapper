import * as d3 from "d3";
import dagreD3 from "dagre-d3";

export class Graph {

	public static g: dagreD3.graphlib.Graph;
	public static render;
	public static $svg: SVGElement;
	public static svg: d3.Selection<SVGElement, unknown, null, undefined>;
	public static svgG: d3.Selection<SVGGElement, unknown, null, undefined>;

	public static nodePredecessors = [];

	public static init() {
		this.g = new dagreD3.graphlib.Graph()
			.setGraph({ rankdir: 'LR' })
			.setDefaultEdgeLabel(() => ({}));
		this.render = new dagreD3.render();
		this.$svg = document.querySelector("#canvas");
		this.draw();
		this.center();
	}

	public static draw() {
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
		this.g.setNode('hehe', this.getNodeLabel(data));
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
			node.rx = node.ry = 4;
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
		this.g.setEdge('hehe', 1);

		this.svg = d3.select(this.$svg);
		this.svgG = this.svg.append("g");
		const zoom = d3.zoom()
			.scaleExtent([0.5, 2])
			.on("zoom", (event) => {
				this.svgG.attr("transform", event.transform);
			});
		this.svg.call(zoom);

		this.render(this.svgG, this.g);


		this.addHighlightPredecessors();
	}

	public static addHighlightPredecessors() {
		this.svgG.selectAll("svg .node")
			.on("mouseenter", (event, nodeName) => {
				this.nodePredecessors.push(nodeName);
				this.updateNodePredecessorsRecursively(nodeName);
				const nodes = d3.selectAll(".node").filter((datum, index) => this.nodePredecessors.includes(datum));
				nodes.style('stroke', 'var(--primary-color)');
				this.nodePredecessors = [];
			})
			.on("mouseleave", (event, nodeName) => {
				d3.selectAll(".node").style('stroke', 'none');
			})
	}

	public static updateNodePredecessorsRecursively(nodeName) {
		const predecessors = this.g.predecessors(nodeName);
		predecessors.forEach((predecessorNodeName) => {
			if (!this.nodePredecessors.includes(predecessorNodeName)) {
				this.nodePredecessors.push(predecessorNodeName);
				this.updateNodePredecessorsRecursively(predecessorNodeName)
			}
		})
	}

	public static center() {
		// Scale
		const scale = 0.5;
		this.svg.call(d3.zoom().transform, d3.zoomIdentity.scale(scale));
		this.svgG.attr("transform", `scale(${scale})`);

		// Center
		const xCenterOffset = (this.$svg.getBoundingClientRect().width - this.svgG.node().getBoundingClientRect().width) / 2;
		const yCenterOffset = (this.$svg.getBoundingClientRect().height - this.svgG.node().getBoundingClientRect().height) / 2;
		this.svg.call(d3.zoom().transform, d3.zoomIdentity.translate(xCenterOffset, yCenterOffset).scale(scale));
		this.svgG.attr("transform", `translate(${xCenterOffset}, ${yCenterOffset}) scale(${scale})`);
	}

	public static getNodeLabel(data) {
		return {
			labelType: "html",
			label: this.getNodeHtml(data)
		}
	}

	public static getNodeHtml(data) {
		const nodeTemplate: HTMLTemplateElement = document.querySelector("template#node");
		const template = document.importNode(nodeTemplate.content, true);

		template.querySelector(".node-container").setAttribute('data-id', data.id);


		const title = template.querySelector(".node-title");
		title.textContent = data.title;
		const img = template.querySelector(".node-image");
		img.setAttribute("src", data.imageUrl);

		const channelImg = template.querySelector(".node-channelImage");
		channelImg.setAttribute("src", data.channelUrl);

		return template;
	}

}