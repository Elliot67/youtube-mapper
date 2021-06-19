import { Logs } from "./Logs";
import { isDef } from "../../../back/utils/general";

enum STATE {
	HIDDEN = "hidden",
	VISIBLE = "",
};

export class Search {

	public static log: Logs;
	public static $form: HTMLFormElement;
	public static $input: HTMLInputElement;
	public static $error: HTMLInputElement;

	public static init() {
		this.log = new Logs('Search', true);

		this.$form = document.querySelector(".JS-Search-form");
		this.$input = this.$form.querySelector("input");
		this.$error = this.$form.querySelector(".JS-Search-error");
		this.events();
	}

	public static events() {
		this.$form.addEventListener('submit', (e) => {
			e.preventDefault();
			this.clearError();

			const searchInput = this.$input.value;
			const videoIdRegex = new RegExp(/^[A-Za-z0-9_\-]{11}$/);

			let id = "";
			if (searchInput.match(videoIdRegex)) {
				id = searchInput;
			} else {
				try {
					const url = new URL(searchInput);
					id = url.searchParams.get('v');
				} catch (error) {
					this.log.error(['Error while converting input to URL', error]);
				}
			}
			this.log.log(['id', id]);
			this.$input.value = "";

			if (!isDef(id)) {
				this.showError('Could not find the id');
				return;
			}


			try {
				// TODO: Trigger _APP function


			} catch (error) {
				this.showError('Error when searching the video');
				this.log.error([error]);
			}
		});
	}

	public static showError(text: string) {
		this.$error.innerText = text;
		this.$error.dataset.state = STATE.VISIBLE;
	}

	public static clearError() {
		this.$error.dataset.state = STATE.HIDDEN;
	}
}