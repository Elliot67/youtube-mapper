export class Logs {

	public static allowLogs: boolean = false;

	constructor(private name: string, private showLog: boolean = false) {
	}

	private show(data, groupTitle) {
		if (!(Logs.allowLogs && this.showLog)) {
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
