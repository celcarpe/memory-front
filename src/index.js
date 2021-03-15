import _ from 'lodash';
import './index.css';

class Game {

	constructor(){
		this.firstCard = '';
		this.gameID = this._generateGameID(10);

		this.cards = this._generateCards(5)

		this.boardElement = document.getElementById("board");
	}

	initializeBoard(){

		//Génération du HTML des cartes
		var cardsString = this.cards.reduce((accumulator, card) => {
			return accumulator += '<div class="card" value="'+card.number+'">'+card.number+'</div>'
		}, "")

		//Insertion des cartes dans le plateau
		this.boardElement.insertAdjacentHTML("beforeend", cardsString );

		this.boardElement.addEventListener("click", (e) => console.log(e.target));

	}

	set setFirstCard(card){
		this.firstCard = card;
	}

	_generateGameID(length) {
		var result           = '';
		var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		var charactersLength = characters.length;

		for ( var i = 0; i < length; i++ ) {
			result += characters.charAt(Math.floor(Math.random() * charactersLength));
		}

		return result;
	}

	_generateCards(cardsNb) {

		let cards = [];

		for(var i = 1; i<=cardsNb; i++){
			cards.push(new Card(i));
			cards.push(new Card(i));
		}

		//Mélange
		cards.sort(() => Math.random() - 0.5);

		return cards;
	}
}

class Card{

	constructor(number){
		this.number = number;
	}

}


// Attendre le chargement du DOM
document.addEventListener('DOMContentLoaded', ()=>{
	const game = new Game();
	game.initializeBoard();
})
