export class Logs {

	private cutLog: boolean;
	private name: string;
	private showLog: boolean;

	constructor(name, currentLog = false) {
		this.cutLog = true;

		this.name = name;
		this.showLog = currentLog;

		return this;
	}

	private show(data, groupTitle) {
		if (!(this.cutLog && this.showLog)) {
			return;
		}

		console.group(...groupTitle);
		console.log(...data);
		console.groupEnd();
	}

	public log(data) {
		this.show(data, [`💡%c ${this.name}`, 'color: #bada55']);
	}

	public error(data) {
		this.show(data, [`🚨%c ${this.name}`, 'color: red']);
	}
}