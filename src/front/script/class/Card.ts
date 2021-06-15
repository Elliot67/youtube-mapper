enum STATE {
	HIDDEN = "hidden",
	LOADING = "loading",
	VISIBLE = "",
};

export class Card {

	public static $card: HTMLElement;

	public static init() {
		this.$card = document.querySelector(".Card-container-JS");
	}

	public static setState(state) {
		this.$card.dataset.state = state;
	}

	public static updateCard(cardData) {

	}
}