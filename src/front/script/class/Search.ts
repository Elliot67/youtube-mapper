import { Logs } from "./Logs";

export class Search {

	public static log: Logs;
	public static $form: HTMLFormElement;
	public static $input: HTMLInputElement;

	public static init() {
		this.log = new Logs('Search', true);

		this.$form = document.querySelector(".Search-form-JS");
		this.$input = this.$form.querySelector("input");
		this.events();
	}

	public static events() {
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