import _ from 'lodash';
import './index.css';

class Game {

	constructor(){
		this.firstCard = undefined;
		this.gameID = this._generateGameID(10);

		this.cards = this._generateCards(5)

		this.boardElement = document.getElementById("board");
	}

	initializeBoard(){

		//Génération du HTML des cartes
		var cardsString = this.cards.reduce((accumulator, card) => {
			return accumulator += '<div class="card" pair="'+card.pair+'">'+card.number+'</div>'
		}, "")

		//Insertion des cartes dans le plateau
		this.boardElement.insertAdjacentHTML("beforeend", cardsString );

		this.boardElement.addEventListener("click", this.checkClick );

	}

	set setFirstCard(card){
		this.firstCard = card;
	}


	checkClick(e){
		if(e.target.getAttribute("class") == "card"){

			//Si aucune carte n'a été sélectionnée
			if(this.firstCard == undefined){
				this.firstCard = {
					"pair"  : e.target.getAttribute("pair"),
					"value" : e.target.innerHTML
				}
			}else{
				//Si l'utilisateur clique sur la même carte
				if(e.target.getAttribute('pair') == this.firstCard.pair && e.target.innerHTML == this.firstCard.value){
					console.log("Même carte");
					return;

				}else if(e.target.innerHTML == this.firstCard.value && e.target.getAttribute('pair') != this.firstCard.pair){
					console.log("nice")

				}else if(e.target.innerHTML != this.firstCard.value && e.target.getAttribute('pair') != this.firstCard.pair){
					console.log("Mauvaise paire");
					
				}
				this.firstCard = undefined;
			}
			console.log(this.firstCard)
		}
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
			cards.push(new Card(i, "A"));
			cards.push(new Card(i, "B"));
		}

		//Mélange
		cards.sort(() => Math.random() - 0.5);

		return cards;
	}
}

class Card{

	constructor(number, pair){
		this.number = number;
		this.pair = pair;
	}

}


// Attendre le chargement du DOM
document.addEventListener('DOMContentLoaded', ()=>{
	const game = new Game();
	game.initializeBoard();
})
