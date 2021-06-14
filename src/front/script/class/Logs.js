export class Logs {

	constructor(name, currentLog = false) {
		this.cutLog = true;

		this.name = name;
		this.showLog = currentLog;

		return this;
	}

	_show(data, groupTitle) {
		if (!(this.cutLog && this.showLog)) {
			return;
		}

		console.group(...groupTitle);
		console.log(...data);
		console.groupEnd();
	}

	log(data) {
		this._show(data, [`💡%c ${this.name}`, 'color: #bada55']);
	}

	error(data) {
		this._show(data, [`🚨%c ${this.name}`, 'color: red']);
	}
}