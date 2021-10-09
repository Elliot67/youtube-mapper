import { MappingError } from "../../../sharedTypes";
import { clearChildrenNodes, getHtmlTemplate } from "../utils/general";
import { Logs } from "./Logs";

enum STATE {
	VISIBLE = '',
	HIDDEN = 'hidden',
};

export class Errors {

	public static log: Logs;
	public static errors: MappingError[] = [];
	public static $container: HTMLElement;
	public static $ulContainer: HTMLElement;

	public static init() {
		this.log = new Logs('Search', true);
		this.$container = document.querySelector('.JS-Errors-container');
		this.$ulContainer = this.$container.querySelector('ul');
	}

	public static showErrors(errors: MappingError[]) {
		Errors.resetErrors();
		this.errors = errors;

		this.errors.forEach((error) => {
			const $li = this.getHtmlErrorItem(error);
			this.$ulContainer.appendChild($li);
		});

		this.$container.dataset.state = STATE.VISIBLE;
	}

	public static resetErrors() {
		this.$container.dataset.state = STATE.HIDDEN;
		this.errors = [];
		clearChildrenNodes(this.$ulContainer);
	}

	public static getHtmlErrorItem(error: MappingError): DocumentFragment {
		const template = getHtmlTemplate('template#errors-item');
		const $li = template.querySelector('li');
		$li.innerText = error.publicResponse;
		return template;
	}
}
