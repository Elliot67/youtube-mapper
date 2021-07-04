import { Logs } from "./Logs";
import { isDef } from "../utils/general";

enum STATE {
	HIDDEN = "hidden",
	VISIBLE = "",
};

export class Search {

	public static log: Logs;
	public static $form: HTMLFormElement;
	public static $input: HTMLInputElement;
	public static $button: HTMLButtonElement;
	public static $error: HTMLInputElement;

	public static init() {
		this.log = new Logs('Search', true);

		this.$form = document.querySelector(".JS-Search-form");
		this.$input = this.$form.querySelector("input");
		this.$button = this.$form.querySelector('.JS-Search-button')
		this.$error = this.$form.querySelector(".JS-Search-error");
		this.events();
	}

	public static events() {
		this.$form.addEventListener('submit', (e) => {
			e.preventDefault();
			this.clearError();

			const query = this.$input.value;
			if (!isDef(query)) {
				this.showError('The URL or ID is required');
				return;
			}

			this.$button.disabled = true;
			this.$input.disabled = true;

			this.log.log(['Searching video with', query]);
			window._app.mapVideo(query);
		});
	}

	public static showError(text: string) {
		this.$error.innerText = text;
		this.$error.dataset.state = STATE.VISIBLE;
	}

	public static clearError() {
		this.$error.dataset.state = STATE.HIDDEN;
	}

	public static unblockSearch() {
		this.$input.value = "";
		this.$button.disabled = false;
		this.$input.disabled = false;
	}
}
