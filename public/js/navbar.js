// Selektovanje dugmeta i liste linkova
const toggleButton = document.querySelector('.toggle-button');
const navbarLinks = document.querySelector('.navbar-links');

// Dodavanje event listenera za otvaranje/zatvaranje menija
toggleButton.addEventListener('click', () => {
  navbarLinks.classList.toggle('open');
});

