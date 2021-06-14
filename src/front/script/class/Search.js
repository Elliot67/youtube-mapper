import { Logs } from "./Logs";

export class Search {

	constructor() {
		this.$form = document.querySelector(".Search-form-JS");
		this.$input = this.$form.querySelector("input");
		this.events();

		this.log = new Logs('Search', true);
	}

	events() {
		this.$form.addEventListener('submit', (e) => {
			e.preventDefault();

			try {
				const url = new URL(this.$input.value);
				const id = url.searchParams.get('v');
				this.log.log([id]);

				// TODO: Trigger _APP function

				this.$input.value = "";

			} catch (error) {
				this.log.error([error]);
			}
		});
	}
}