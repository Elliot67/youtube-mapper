// @ts-nocheck
function isUndefined(data) {
	return typeof data === "undefined";
}

function isNull(data) {
	return data === null;
}

function isDef(data) {
	return !isUndefined(data) && !isNull(data) && data !== "";
}


module.exports = {
	isUndefined,
	isNull,
	isDef,
};