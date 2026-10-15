const backButton = document.getElementById("backButton");
backButton?.addEventListener('click', () => {
    window.location.href = '../podracing_game.html';
});

const equipButton = document.getElementById("equipButton");
const previousButton = document.getElementById("previousButton");
const nextButton = document.getElementById("nextButton");
const racerImage = document.querySelector(".racer-image");
const podracerImage = document.querySelector(".podracer-image");
const racerLabel = document.querySelector(".racer-label");
const podracerLabel = document.querySelector(".podracer-label");

const normalizeUrl = (path) => new URL(path, window.location.href).href;

// Podracer images
const bt310Quadra = normalizeUrl("../../../assets/bt310_quadra.png");
const ordPedrovia = normalizeUrl("../../../assets/ord_pedrovia.webp");

// Racer images
const benQuadinaros = normalizeUrl("../../../assets/ben.png");
const rattsTyerell = normalizeUrl("../../../assets/rattstyerell.png");

const podracers = [bt310Quadra, ordPedrovia];
const podracerLabels = ["BT310-Quadra", "Ord Pedrovia"];
const racers = [benQuadinaros, rattsTyerell];
const racerLabels = ["Ben Quadinaros", "Ratts Tyerell"];
const activeImage = racerImage || podracerImage;
const activeArray = racerImage ? racers : podracers;
const activeLabels = racerImage ? racerLabels : podracerLabels;
const activeLabelElement = racerImage ? racerLabel : podracerLabel;
const equipmentKey = racerImage ? "equippedRacer" : "equippedPodracer";
const equipButtonLabel = racerImage ? "Equip Racer" : "Equip Podracer";

const equippedIndex = activeArray.indexOf(localStorage.getItem(equipmentKey));
if (activeImage && equippedIndex !== -1) {
    activeImage.src = activeArray[equippedIndex];
    activeLabelElement.textContent = activeLabels[equippedIndex];
}

function updateEquipButton() {
    if (!equipButton || !activeImage) {
        return;
    }

    equipButton.textContent = activeImage.src === localStorage.getItem(equipmentKey)
        ? "Equipped"
        : equipButtonLabel;
}

equipButton?.addEventListener('click', () => {
    if (!activeImage) {
        return;
    }

    localStorage.setItem(equipmentKey, activeImage.src);
    updateEquipButton();
});

function updateImageByDirection(direction) {
    if (!activeImage || !activeLabelElement) {
        return;
    }

    const currentIndex = activeArray.findIndex(src => src === activeImage.currentSrc);
    const safeIndex = currentIndex === -1 ? 0 : currentIndex;
    const nextIndex = (safeIndex + direction + activeArray.length) % activeArray.length;

    activeImage.src = activeArray[nextIndex];
    activeLabelElement.textContent = activeLabels[nextIndex] || "";
    updateEquipButton();
}

updateEquipButton();

nextButton?.addEventListener('click', () => {
    updateImageByDirection(1);
});

previousButton?.addEventListener('click', () => {
    updateImageByDirection(-1);
}); 