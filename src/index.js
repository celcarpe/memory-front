import _ from 'lodash';

import './test.scss';

//Importing images

function importAll(r) {
  return r.keys().map(r);
}

const IMAGE_POOL = importAll(require.context('./images/cards', false, /\.(png|jpe?g|svg)$/));
const PAIR_NUMBER = IMAGE_POOL.length;
const TIME_LIMIT = 180;

var CONF = {};
CONF.BACKEND_HOST = "http://localhost"
CONF.BACKEND_PORT = 3000;


class Game {

	constructor(){

		//récupération des éléments du DOM
		this.boardElement = document.getElementById("board");
		this.playButton = document.getElementById("playButton");
		this.restartButton = document.getElementById("restart");


		//Ajout des fonctions de gestion des événements
		this.boardElement.addEventListener("click", this._checkClick.bind(this) );
		this.playButton.addEventListener("click", this.startGame.bind(this));
		this.restartButton.addEventListener("click", this.restartGame.bind(this));

		//Initialisation du Timer
		this.timer = new Timer(TIME_LIMIT, this.defeat, this);

		//chargement du classement
		this.loadGames(function(data){
			console.log(data)
			var leaderboardString = data.reduce((accumulator, game) => {
				return accumulator += '<li>'+game.time+' secondes</li>';
			}, "")
			let leaderboardList = document.getElementById("leaderboard");
			leaderboardList.insertAdjacentHTML("afterBegin", leaderboardString)
		});
	}

	/*
	*	Fonction d'initialisation/réinitialisation du plateau de jeu
	*/
	initializeBoard(){

		//Réinitialisation de la board
		this.firstCard = undefined;
		this.gameID = this._generateGameID(24);
		this.cards = this._generateCards(PAIR_NUMBER)
		this.boardElement.innerHTML = ""; //
		this.restartButton.setAttribute("disabled","disabled"); //
		this.playButton.removeAttribute("disabled"); //

		//Réinitialisation du Timer
		this.timer.reset();

		this.canPlay = false; //

		//Génération du HTML des cartes
		var cardsString = this.cards.reduce((accumulator, card) => {

			return accumulator += '<div class="card" pair="'+card.pair+'" number="'+card.number+'">'+'<img alt="" src="'+card.source+'" />'+'</div>';
		}, "")

		//Insertion des cartes dans le plateau
		this.boardElement.insertAdjacentHTML("beforeend", cardsString );

	}

	startGame(e){
		this.timer.start();


		this.canPlay = true;
		this.gameStarted = true;

		this.pairFound = 0;
		this.playButton.setAttribute("disabled","disabled");
	}

	stopGame(){
		this.canPlay = false;
		this.gameStarted = false;
		this.restartButton.removeAttribute("disabled");

		//révéler toutes les cartes
		let cards = document.querySelectorAll(".card");
		cards.forEach(function(el){
			el.classList.remove("hidden");
			el.classList.add("selected");
		});
	}

	/*
	*	Fonction exécutée en cas de défaite
	*	Passée en fonction de callback au Timer
	*/
	defeat(){
		console.log(this)
		alert("perdu");
		this.stopGame();
	}

	victory(){
		alert("Victoire");
		
		this.timer.pause();
		this.stopGame();

		this.saveGame();
	}

	restartGame(e){
		this.initializeBoard();
	}

	_checkClick(e){
		if(!this.gameStarted){
			console.log("game not started")
			return;
		}

		if(e.target.parentElement.classList.contains('card')){

			let clickedCard = e.target.parentElement;

			if(!this.canPlay)
				return;

			//Si aucune carte n'a été sélectionnée
			if(this.firstCard == undefined){
				clickedCard.classList.add("selected");

				//Mise à jour de la carte sélectionnée dans les données du jeu
				this.firstCard = _.find(this.cards, function(card){
					return card.number == clickedCard.getAttribute("number") && card.pair == clickedCard.getAttribute("pair")
				})
				this.firstCard.selected = true;
			}else{

				//Si l'utilisateur clique sur la même carte
				if(clickedCard.getAttribute('pair') == this.firstCard.pair && clickedCard.getAttribute("number") == this.firstCard.number){
					//Si même carte
					return;

				}else if(clickedCard.getAttribute("number") == this.firstCard.number && clickedCard.getAttribute('pair') != this.firstCard.pair){
					//Si bonne carte
					this.canPlay = false;
					this.pairFound += 1;

					clickedCard.classList.add("selected");

					//validation de la première carte de la paire dans les données du jeu
					this.firstCard.found = true;

					//validation de la seconde carte de la paire dans les données du jeu
					_.find(this.cards, function(card){
						return card.number == clickedCard.getAttribute("number") && card.pair == clickedCard.getAttribute("pair")
					}).found = true;

					if(this.pairFound == PAIR_NUMBER){
						this.victory();
						this.canPlay = false;
						return;
					}

					//Les cartes restent affichées quelques secondes avant d'être retournées et grisées
					setTimeout(()=>{
						console.log("dazdazd")
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
					clickedCard.classList.add("selected");
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
		}

	}

	_generateGameID(length) {
		var result           = '';
		var characters       = 'ABCDEFabcdef0123456789';
		var charactersLength = characters.length;

		for ( var i = 0; i < length; i++ ) {
			result += characters.charAt(Math.floor(Math.random() * charactersLength));
		}

		return result;
	}

	_generateCards(cardsNb) {

		let cards = [];

		for(var i = 0; i<cardsNb; i++){
			cards.push(new Card(i, "A", IMAGE_POOL[i]));
			cards.push(new Card(i, "B", IMAGE_POOL[i]));
		}

		//Mélange
		cards.sort(() => Math.random() - 0.5);

		return cards;
	}

	saveGame(){

		this.time = this.timer.getTime();

		let conf = {
			headers: { "Content-Type": "application/json; charset=utf-8" },
			method : 'POST',
			body: JSON.stringify(this)
		}
		fetch(CONF.BACKEND_HOST+":"+CONF.BACKEND_PORT+"/games", conf)
		.then(response => response.json())
		.then(data => {
			console.log("GAME SAVED")
			console.log(data)
		})
	}

	loadGames(cb){
		let conf = {
			headers: { "Content-Type": "application/json; charset=utf-8" },
			method : 'GET'
		}
		fetch(CONF.BACKEND_HOST+":"+CONF.BACKEND_PORT+"/games/", conf)
		.then(response => response.json())
		.then(data => {
			cb(data.data)
		})
	}

}

class Card{

	constructor(number, pair, source){
		this.number = number;
		this.pair = pair;
		this.found = false;
		this.selected = false;
		this.source = source;
	}

}

class Timer{

	constructor(limit, lostCallback, game){

		this.progressDiv = document.getElementById("progress");

		this.time = 0;
		this.limit = limit;

		this.callback = lostCallback.bind(game); 
		this.start = function(){

			this.isRunning = true;

			this.interval = setInterval(() => {
				
				if(this.time == this.limit+1){
					this.time--;
					clearInterval(this.interval);
					this.pause();
				}

				if(this.time > 0){
					let percentage = (this.time / this.limit)*100
					this.progressDiv.style.width = percentage + "%";
				}

				this.time++;
			}, 1000);
		}

		this.pause = function(){
			this.isRunning = false;
			clearInterval(this.interval);
			this.callback();
		}

		this.reset = function(){
			this.time = 0;
			let percentage = (this.time / this.limit)*100
			this.progressDiv.style.width = percentage + "%";
		}

		this.getTime = function(){
			return this.time;
		}

		this.setTime = function(time){
			this.time = time;
			let percentage = (this.time / this.limit)*100
			this.progressDiv.style.width = percentage + "%";
		}	
	}


}


// Attendre le chargement du DOM
document.addEventListener('DOMContentLoaded', ()=>{
	const game = new Game();
	game.initializeBoard();
})
