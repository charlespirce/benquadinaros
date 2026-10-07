 const backButton = document.getElementById('backButton');
 const playButton = document.getElementById('playButton');
 const menuButton = document.getElementById('menuButton');
 const tatooine = document.getElementById("tatooine");

 backButton?.addEventListener('click', () => {
        window.location.href = '../../index.html';
    });

 playButton?.addEventListener('click', () => {
   window.location.href = 'podracing_game.html';
    });

menuButton?.addEventListener('click', () => {
    window.location.href = 'podracing.html';
});

tatooine?.addEventListener('click', () => {
    window.location.href = 'racing.html';
});
