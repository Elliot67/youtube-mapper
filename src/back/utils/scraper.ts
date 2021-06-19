// @ts-nocheck
function getLinkedVideosId(page) {
	const regex = new RegExp(/"image":{"thumbnails":\[{"url":"https:\/\/i\.ytimg\.com\/vi\/([A-Za-z0-9_\-]{11})\/hqdefault\.jpg\?sqp=/g)
	return [...page.matchAll(regex)].map((captures) => captures[1])
}


module.exports = {
	getLinkedVideosId,
};