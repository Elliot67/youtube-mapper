import * as d3 from "d3";
import { graphlib, render } from "dagre-d3";
import { Mapping, MappingVideo, MappingVideos, PartialMappingVideo } from "../../../sharedTypes";
import { isDef, isNull, getHtmlTemplate } from "../utils/general";
import { isVideoMappingDone, isVideoMappingLoading } from "../utils/specific";
import { Card } from "./Card";

export class Graph {

	public static g: graphlib.Graph;
	public static render;
	public static $svg: SVGElement;
	public static svg: d3.Selection<SVGElement, unknown, null, undefined>;
	public static svgG: d3.Selection<SVGGElement, unknown, null, undefined>;

	public static mapping: Mapping | null = null;

	public static nodePredecessors = [];
	public static selectedNode: string | null = null;

	public static searchId: string | null = null;

	public static init() {
		this.g = new graphlib.Graph()
			.setGraph({ rankdir: 'LR' })
			.setDefaultEdgeLabel(() => ({}));
		this.render = new render();
		this.$svg = document.querySelector("#canvas");
		this.svg = d3.select(this.$svg);
		this.setSvgEvents();
		this.svgG = this.svg.append("g");

		const zoom = d3.zoom()
			.scaleExtent([0.125, 2])
			.on("zoom", (event) => {
				this.svgG.attr("transform", event.transform);
			});
		// @ts-ignore
		this.svg.call(zoom);
		this.transform(1, 1, 0.25);
	}

	public static renew(searchId: string): void {
		this.searchId = searchId;
		this.g = new graphlib.Graph()
			.setGraph({ rankdir: 'LR' })
			.setDefaultEdgeLabel(() => ({}));
	}

	public static mapIt(mapping: Mapping): void {
		if (this.searchId !== mapping.searchId) {
			this.renew(mapping.searchId);
		}

		this.draw(mapping.data);
		if (isNull(this.mapping)) {
			this.center();
		}
		this.mapping = mapping;
		if (isDef(this.selectedNode)) {
			this.selectNode(this.selectedNode);
		}
	}

	public static draw(videos: MappingVideos) {
		videos.forEach((video) => {
			this.g.setNode(video.id, this.getNodeLabel(video));
		});

		// Round nodes
		this.g.nodes().forEach((v) => {
			const node = this.g.node(v);
			node.rx = node.ry = 4;
		});

		videos.forEach((video) => {
			if (isVideoMappingDone(video)) {
				video.linkedIds.forEach((linkedId) => this.g.setEdge(video.id, linkedId));
			}
		});


		// Reset zoom
		const currentTransform = d3.zoomTransform(this.svgG.node());
		this.transform(currentTransform.x, currentTransform.y, 1);
		this.render(this.svgG, this.g);
		this.transform(currentTransform.x, currentTransform.y, currentTransform.k);
		this.setNodeEvents();
	}

	public static setSvgEvents() {
		this.svg.on('click', (event: MouseEvent) => {
			this.clearSelectedNodeAndGraphStyle();
			Card.updateCard();
		});
	}

	public static setNodeEvents() {
		this.svgG.selectAll("svg .node").on("click", (event: MouseEvent, nodeName) => {
			event.stopPropagation();
			this.selectNode(nodeName);
		});
	}

	public static selectNode(nodeName) {
		this.clearSelectedNodeAndGraphStyle();
		this.selectedNode = nodeName;
		Card.updateCard(this.mapping.data.get(nodeName));
		this.highlightPossiblePaths(nodeName);
		this.highlightShortestPath(nodeName);
		this.highlightNode(nodeName);
	}

	public static highlightPossiblePaths(nodeName): void {
		this.nodePredecessors.push(nodeName);
		this.updateNodePredecessorsRecursively(nodeName);
		const $nodes = d3.selectAll(".node").filter((datum) => this.nodePredecessors.includes(datum));
		$nodes.style('stroke', 'var(--secondary-color)');
		this.nodePredecessors = [];
	}

	public static highlightShortestPath(nodeName) {
		const mainName = this.mapping.mainId;
		const nodesName = [mainName, nodeName];
		const paths = graphlib.alg.dijkstra(this.g, mainName);
		if (!isDef(paths[nodeName]) || paths[nodeName].distance === Infinity) {
			return;
		}

		while (paths[nodeName].distance > 0 && paths[nodeName].predecessor !== mainName) {
			nodeName = paths[nodeName].predecessor;
			nodesName.push(nodeName);
		}
		const $nodes = d3.selectAll(".node").filter((datum) => nodesName.includes(datum));
		$nodes.style('stroke', 'var(--primary-color)').style('stroke-width', '3px');

		const selectedLinksLine: d3.Selection<d3.BaseType, unknown, null, undefined>[] = [];
		const selectedLinksArrow: d3.Selection<d3.BaseType, unknown, null, undefined>[] = [];
		const $links = d3.selectAll('g.edgePath');
		$links.each(function (data) {
			const { v: parentId, w: childId } = data as { v: string, w: string };
			if (nodesName.includes(parentId) && nodesName.includes(childId)) {
				const $selection = d3.select(this);
				selectedLinksLine.push($selection.select('.path'));
				selectedLinksArrow.push($selection.select('defs > marker > path'));
			}
		});
		selectedLinksLine.forEach($el => $el.style('stroke', 'var(--primary-color)'));
		selectedLinksArrow.forEach($el => $el.style('stroke', 'var(--primary-color)').style('fill', 'var(--primary-color)'));
	}

	public static highlightNode(nodeName) {
		const $node = d3.selectAll(".node").filter((datum) => nodeName === datum);
		$node.style('stroke', 'var(--primary-color)').style('--stroke-width', '5px');
	}

	public static updateNodePredecessorsRecursively(nodeName) {
		const predecessors = this.g.predecessors(nodeName) || [];
		predecessors.forEach((predecessorNodeName) => {
			if (!this.nodePredecessors.includes(predecessorNodeName)) {
				this.nodePredecessors.push(predecessorNodeName);
				this.updateNodePredecessorsRecursively(predecessorNodeName)
			}
		})
	}

	public static clearSelectedNodeAndGraphStyle() {
		this.selectedNode = null;
		d3.selectAll(".node").style('stroke', 'none').style('--stroke-width', '1.5px');

		const $links = d3.selectAll('g.edgePath')
		$links.select('.path').style('stroke', 'var(--border-color)');
		$links.select('defs > marker > path').style('stroke', 'var(--border-color)').style('fill', 'var(--border-color)');
	}

	public static center() {
		const currentTransform = d3.zoomTransform(this.svgG.node());
		const xCenterOffset = (this.$svg.getBoundingClientRect().width - this.svgG.node().getBoundingClientRect().width) / 2;
		const yCenterOffset = (this.$svg.getBoundingClientRect().height - this.svgG.node().getBoundingClientRect().height) / 2;
		this.transform(xCenterOffset, yCenterOffset, currentTransform.k);
	}

	public static transform(translateX: number, transalteY: number, scale: number): void {
		// @ts-ignore
		this.svg.call(d3.zoom().transform, d3.zoomIdentity.translate(translateX, transalteY).scale(scale));
		this.svgG.attr("transform", `translate(${translateX}, ${transalteY}) scale(${scale})`);
	}

	public static getNodeLabel(video: MappingVideo | PartialMappingVideo) {
		const label = isVideoMappingDone(video) ?
			this.getNodeHtmlDone(video) :
			isVideoMappingLoading(video) ? this.getNodeHtmlLoading(video) : this.getNodeHtmlWaiting(video);

		return {
			labelType: "html",
			label,
		}
	}

	public static getNodeHtmlDone(video: MappingVideo): DocumentFragment {
		const template = getHtmlTemplate("template#node-done");
		template.querySelector(".node-container").setAttribute('data-id', video.id);


		const title = template.querySelector(".node-title");
		title.textContent = video.title;
		const img = template.querySelector(".node-image");
		img.setAttribute("src", video.thumbnailUrl);

		const channelImg = template.querySelector(".node-channelImage");
		channelImg.setAttribute("src", video.author.thumbnailUrl);

		return template;
	}

	public static getNodeHtmlLoading(video: PartialMappingVideo): DocumentFragment {
		return getHtmlTemplate("template#node-loading");
	}

	public static getNodeHtmlWaiting(video: PartialMappingVideo): DocumentFragment {
		return getHtmlTemplate("template#node-waiting");
	}
}
