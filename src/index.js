import _ from 'lodash';
import './index.css';


/*

TODO
- Timer
- Progress bar
- BDD

In progress
- mécanique de partie (début, victoire, etc...)


*/

class Game {

	constructor(){

		//récupération des éléments du DOM
		this.boardElement = document.getElementById("board");
		this.playButton = document.getElementById("playButton");
		this.restartButton = document.getElementById("restart")

	}

	initializeBoard(){

		//Réinitialisation de la board
		this.firstCard = undefined;
		this.gameID = this._generateGameID(10);

		this.cards = this._generateCards(5)
		this.pairNumber = 5;

		this.boardElement.innerHTML = "";
		this.restartButton.classList.add("hidden");
		this.playButton.classList.remove("hidden");

		this.boardData = {
			gameID 	: this.gameID,
			cards 	: []
		};

		this.canPlay = false;

		//Génération du HTML des cartes
		var cardsString = this.cards.reduce((accumulator, card) => {

			//Chaque carte est ajouté au tableau de données
			this.boardData.cards.push(card)

			return accumulator += '<div class="card" pair="'+card.pair+'">'+card.number+'</div>'
		}, "")

		//Insertion des cartes dans le plateau
		this.boardElement.insertAdjacentHTML("beforeend", cardsString );


		this.boardElement.addEventListener("click", this._checkClick.bind(this) );
		this.playButton.addEventListener("click", this.startGame.bind(this));
		this.restartButton.addEventListener("click", this.restartGame.bind(this));

	}

	startGame(e){
		this.playButton.classList.add("hidden")
		//start timer
		this.canPlay = true;

		this.pairFound = 0;
	}

	restartGame(e){
		this.initializeBoard();
	}


	set setFirstCard(card){
		this.firstCard = card;
	}


	_checkClick(e){
		if(e.target.getAttribute("class") == "card"){

			if(!this.canPlay)
				return;

			//Si aucune carte n'a été sélectionnée
			if(this.firstCard == undefined){
				e.target.classList.add("selected");

				//Mise à jour de la carte sélectionnée dans les données du jeu
				this.firstCard = _.find(this.boardData.cards, function(card){
					return card.number == e.target.innerHTML && card.pair == e.target.getAttribute("pair")
				})
				this.firstCard.selected = true;
			}else{

				//Si l'utilisateur clique sur la même carte
				if(e.target.getAttribute('pair') == this.firstCard.pair && e.target.innerHTML == this.firstCard.number){
					//Si même carte
					return;

				}else if(e.target.innerHTML == this.firstCard.number && e.target.getAttribute('pair') != this.firstCard.pair){
					//Si bonne carte
					this.canPlay = false;
					this.pairFound += 1;

					e.target.classList.add("selected");

					//validation de la première carte de la paire dans les données du jeu
					this.firstCard.found = true;

					//validation de la seconde carte de la paire dans les données du jeu
					_.find(this.boardData.cards, function(card){
						return card.number == e.target.innerHTML && card.pair == e.target.getAttribute("pair")
					}).found = true;

					//Les cartes restent affichées quelques secondes avant d'être retournées et grisées
					setTimeout(()=>{
						let card1 = document.getElementsByClassName('selected').item(0)
						card1.classList.remove("selected");
						card1.classList.add("hidden")

						let card2 = document.getElementsByClassName('selected').item(0)
						card2.classList.remove("selected");
						card2.classList.add("hidden")

						this.canPlay = true;

					}, 1000)

				}else {
					//Si mauvaise carte
					e.target.classList.add("selected");
					this.canPlay = false;

					//Les cartes restent affichées quelques secondes avant d'être retournées
					setTimeout(()=>{
						document.getElementsByClassName('selected').item(0).classList.remove("selected")
						document.getElementsByClassName('selected').item(0).classList.remove("selected")

						this.canPlay = true;
					}, 1000)

				}
				this.firstCard.selected = false;
				this.firstCard = undefined;
			}

			console.log(this.boardData.cards)

			if(this.pairFound == this.pairNumber){
				this._victory();
				this.canPlay = false;
			}
		}

	}

	_victory(){
		alert("Victoire");
		this.restartButton.classList.remove("hidden");
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
		this.found = false;
		this.selected = false;
	}

}


// Attendre le chargement du DOM
document.addEventListener('DOMContentLoaded', ()=>{
	const game = new Game();
	game.initializeBoard();
})
