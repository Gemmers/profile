// Sélectionne toutes les cartes
let cards = document.querySelectorAll('.card');
let container = document.querySelector('.container');

// Cacher toutes les cartes au début
cards.forEach((card) => {
  card.style.display = 'none';
});

// Afficher la première carte
let currentCard = 0;
cards[currentCard].style.display = 'block';

// Ajouter un écouteur d'événements au conteneur
container.addEventListener('click', () => {
  // Cacher la carte actuelle
  cards[currentCard].style.display = 'none';

  // Passer à la carte suivante
  currentCard = (currentCard + 1) % cards.length;

  // Afficher la nouvelle carte actuelle
  cards[currentCard].style.display = 'block';
});
