const backButton = document.getElementById("backButton");
backButton?.addEventListener('click', () => {
    window.location.href = '../podracing_game.html';
});

const previousButton = document.getElementById("previousButton");
const nextButton = document.getElementById("nextButton");
const racerImage = document.querySelector(".racer-image");
const podracerImage = document.querySelector(".podracer-image");
const racerLabel = document.querySelector(".racer-label");
const podracerLabel = document.querySelector(".podracer-label");

const normalizeUrl = (path) => new URL(path, window.location.href).href;

// Podracer images
const bt310Quadra = normalizeUrl("../../../assets/bt310_quadra.png");

// Racer images
const benQuadinaros = normalizeUrl("../../../assets/ben.png");
const rattsTyerell = normalizeUrl("../../../assets/rattstyerell.png");

const podracers = [bt310Quadra];
const podracerLabels = ["BT310-Quadra"];
const racers = [benQuadinaros, rattsTyerell];
const racerLabels = ["Ben Quadinaros", "Ratts Tyerell"];

function updateImageByDirection(direction) {
    const activeImage = racerImage || podracerImage;
    const activeArray = racerImage ? racers : podracers;
    const activeLabels = racerImage ? racerLabels : podracerLabels;
    const activeLabelElement = racerImage ? racerLabel : podracerLabel;

    if (!activeImage || !activeLabelElement) {
        return;
    }

    const currentIndex = activeArray.findIndex(src => src === activeImage.currentSrc);
    const safeIndex = currentIndex === -1 ? 0 : currentIndex;
    const nextIndex = (safeIndex + direction + activeArray.length) % activeArray.length;

    activeImage.src = activeArray[nextIndex];
    activeLabelElement.textContent = activeLabels[nextIndex] || "";
}

nextButton?.addEventListener('click', () => {
    updateImageByDirection(1);
});

previousButton?.addEventListener('click', () => {
    updateImageByDirection(-1);
}); 