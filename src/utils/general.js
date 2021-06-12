function isUndefined(data) {
	return typeof data === "undefined";
}

function isNull(data) {
	return data === null;
}

function isDef(data) {
	return !isUndefined(data) && !isNull(data) && data !== "";
}


// FIXME: Unexpected token export
module.exports = {
	isUndefined,
	isNull,
	isDef,
};