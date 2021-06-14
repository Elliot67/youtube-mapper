const STATE = {
	hidden: "hidden",
	loading: "loading",
	visible: "",
};

export class Card {

	constructor() {
		this.$card = document.querySelector(".Card-container-JS");
	}

	setState(state) {
		this.$card.dataset.state = state;
	}

	updateCard(cardData) {

	}
}