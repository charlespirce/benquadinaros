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

const shopSound = new Audio(normalizeUrl("../../../assets/podracer_shop.wav"));

function playShopSound() {
    const playback = shopSound.play();

    playback.catch(error => {
        if (error.name !== "NotAllowedError") {
            console.error("Unable to play shop audio:", error);
            return;
        }

        const playAfterInteraction = () => {
            document.removeEventListener("pointerdown", playAfterInteraction);
            document.removeEventListener("keydown", playAfterInteraction);
            shopSound.play().catch(playError => {
                console.error("Unable to play shop audio:", playError);
            });
        };

        document.addEventListener("pointerdown", playAfterInteraction, { once: true });
        document.addEventListener("keydown", playAfterInteraction, { once: true });
    });
}

playShopSound();

// Podracer images
const bt310Quadra = normalizeUrl("../../../assets/bt310_quadra.png");
const ordPedrovia = normalizeUrl("../../../assets/ord_pedrovia.webp");
const T9B_Wasp = normalizeUrl("../../../assets/9T9-B_wasp.png");
const vulptereen327 = normalizeUrl("../../../assets/vulptereen327.webp");

// Racer images
const benQuadinaros = normalizeUrl("../../../assets/ben.png");
const rattsTyerell = normalizeUrl("../../../assets/rattstyerell.png");
const aldarBeedo = normalizeUrl("../../../assets/aldar_beedo.png");
const odyMandrell = normalizeUrl("../../../assets/ody_mandrell.png");
const teemtoPagalies = normalizeUrl("../../../assets/teemto_pagalies.png");
const wanSandage = normalizeUrl("../../../assets/wan_sandage.png");
const marsGuo = normalizeUrl("../../../assets/mars_guo.png");
const ebeeEndocott = normalizeUrl("../../../assets/ebe_e_endocott.png");
const dudBolt = normalizeUrl("../../../assets/Dud_Bolt.png");
const mawhonic = normalizeUrl("../../../assets/mawhonic.png");
const gasgano = normalizeUrl("../../../assets/gasgano.png");
const sebulba = normalizeUrl("../../../assets/sebulba.png");
const goldBen = normalizeUrl("../../../assets/gold_ben.png");

const podracers = [bt310Quadra, ordPedrovia, T9B_Wasp, vulptereen327];
const podracerLabels = ["BT310-Quadra", "Ord Pedrovia", "9T9-B Wasp", "Vulptereen 327"];
const racers = [benQuadinaros, rattsTyerell, aldarBeedo, odyMandrell, teemtoPagalies, wanSandage, marsGuo, ebeeEndocott, dudBolt, mawhonic, gasgano, sebulba, goldBen];
const racerLabels = ["Ben Quadinaros", "Ratts Tyerell", "Aldar Beedo", "Ody Mandrell", "Teemto Pagalies", "Wan Sandage", "Mars Guo", "Ebe E. Endocott", "Dud Bolt", "Mawhonic", "Gasgano", "Sebulba", "Gold Ben"];
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