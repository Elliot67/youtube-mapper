import { Logs } from "./Logs";
import { generateUniqueId, isDef } from "../utils/general";
import { Errors } from "./Errors";

export class Search {

	public static log: Logs;
	public static $form: HTMLFormElement;
	public static $input: HTMLInputElement;
	public static $button: HTMLButtonElement;
	public static $buttonStop: HTMLButtonElement;
	public static searchId: string | null = null;

	public static init() {
		this.log = new Logs('Search', true);

		this.$form = document.querySelector(".JS-Search-form");
		this.$input = this.$form.querySelector("input");
		this.$button = this.$form.querySelector('.JS-Search-button');
		this.$buttonStop = this.$form.querySelector('.JS-Search-button-stop');
		this.events();
	}

	public static events() {
		this.$form.addEventListener('submit', (e) => {
			e.preventDefault();
			Errors.resetErrors();

			const query = this.$input.value;
			if (!isDef(query)) {
				Errors.showErrors([{
					publicResponse: 'The URL or ID is required',
					debug: 'Invalid seach item',
				}]);
				return;
			}

			this.$button.disabled = true;
			this.$buttonStop.disabled = false;
			this.$input.disabled = true;

			this.log.log(['Searching video with', query]);
			this.searchId = generateUniqueId();
			window._app.mapVideo(query, this.searchId);
		});

		this.$buttonStop.addEventListener('click', () => {
			window._app.stopMapping();
			this.unblockSearch();
		});
	}

	public static unblockSearch() {
		this.$button.disabled = false;
		this.$buttonStop.disabled = true;
		this.$input.disabled = false;
	}
}
