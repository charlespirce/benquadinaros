 const backButton = document.getElementById('backButton');
 const playButton = document.getElementById('playButton');
 const menuButton = document.getElementById('menuButton');
 const tatooine = document.getElementById("tatooine");
 const podracer = document.getElementById("pod");
 const racer = document.getElementById("ben");
 const racerShopButton = document.getElementById("racerShopButton");
 const podShopButton = document.getElementById("podShopButton");
 const obstacle = document.getElementById("obstacle");
 const gameOverScreen = document.getElementById("gameOver");
 const restartButton = document.getElementById("restartButton");
 const raceScoreDisplay = document.getElementById("raceScore");
 let raceScore = 0;
 const highScore = 0;
 const score = 0;
 const coins = 0;

 const equippedPodracer = localStorage.getItem("equippedPodracer");
 if (podracer && equippedPodracer) {
    podracer.src = equippedPodracer;
 }

 const equippedRacer = localStorage.getItem("equippedRacer");
 if (racer && equippedRacer) {
    racer.src = equippedRacer;
 }

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

racerShopButton?.addEventListener('click', () => {
    window.location.href = 'shops/racer_shop.html';
});

podShopButton?.addEventListener('click', () => {
    window.location.href = 'shops/pod_shop.html';
});

const movementKeys = new Set(['arrowleft', 'a', 'arrowright', 'd']);
const pressedMovementKeys = new Set();
let movementFrame = null;
let lastMovementTime = 0;
const movementSpeed = 1000;
let raceFrame = null;
let nextObstacleTime = 0;
let obstacleExpiresAt = 0;
let obstacleCollisionStartsAt = 0;
let raceOver = false;
const obstacleVisibleDuration = 1800;
const obstacleCollisionDelay = 1000;

function movePodracer(timestamp) {
    if (!podracer || raceOver || pressedMovementKeys.size === 0) {
        movementFrame = null;
        lastMovementTime = 0;
        return;
    }

    const elapsed = lastMovementTime ? Math.min((timestamp - lastMovementTime) / 1000, 0.05) : 0;
    lastMovementTime = timestamp;

    const direction = Number(pressedMovementKeys.has('arrowright') || pressedMovementKeys.has('d'))
        - Number(pressedMovementKeys.has('arrowleft') || pressedMovementKeys.has('a'));
    if (direction !== 0) {
        const bounds = podracer.getBoundingClientRect();
        const halfWidth = bounds.width / 2;
        const currentCenter = bounds.left + halfWidth;
        const nextCenter = Math.max(
            halfWidth,
            Math.min(window.innerWidth - halfWidth, currentCenter + direction * movementSpeed * elapsed)
        );
        podracer.style.left = `${nextCenter}px`;
        racer.style.left = `${nextCenter - 84}px`;
    }

    movementFrame = requestAnimationFrame(movePodracer);
}

function endRace() {
    raceOver = true;
    pressedMovementKeys.clear();
    if (movementFrame !== null) {
        cancelAnimationFrame(movementFrame);
        movementFrame = null;
    }
    if (raceFrame !== null) {
        cancelAnimationFrame(raceFrame);
        raceFrame = null;
    }
    if (gameOverScreen) {
        gameOverScreen.hidden = false;
    }
}

function updateRace(timestamp) {
    if (raceOver || !obstacle || !podracer) {
        return;
    }

    if (!obstacle.classList.contains("is-active") && timestamp >= nextObstacleTime) {
        obstacle.style.left = `${Math.random() * Math.max(0, window.innerWidth - obstacle.offsetWidth)}px`;
        obstacle.classList.add("is-active");
        obstacleExpiresAt = timestamp + obstacleVisibleDuration;
        obstacleCollisionStartsAt = timestamp + obstacleCollisionDelay;
    }

    if (obstacle.classList.contains("is-active")) {
        const obstacleBounds = obstacle.getBoundingClientRect();
        const podBounds = podracer.getBoundingClientRect();
        const collides = obstacleBounds.left < podBounds.right
            && obstacleBounds.right > podBounds.left
            && obstacleBounds.top < podBounds.bottom
            && obstacleBounds.bottom > podBounds.top;

        if (collides && timestamp >= obstacleCollisionStartsAt) {
            endRace();
            return;
        }

        if (timestamp >= obstacleExpiresAt) {
            obstacle.classList.remove("is-active");
            raceScore += 100;
            if (raceScoreDisplay) {
                raceScoreDisplay.textContent = String(raceScore);
            }
            nextObstacleTime = timestamp + 700 + Math.random() * 800;
        }
    }

    raceFrame = requestAnimationFrame(updateRace);
}

if (obstacle && podracer && window.location.pathname.endsWith("racing.html")) {
    nextObstacleTime = performance.now() + 1000;
    raceFrame = requestAnimationFrame(updateRace);
}

restartButton?.addEventListener("click", () => {
    window.location.href = 'podracing_game.html';
});

window.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    if (!podracer || raceOver || !window.location.pathname.endsWith('racing.html') || !movementKeys.has(key)) {
        return;
    }

    event.preventDefault();
    pressedMovementKeys.add(key);
    if (movementFrame === null) {
        movementFrame = requestAnimationFrame(movePodracer);
    }
});

window.addEventListener('keyup', (event) => {
    pressedMovementKeys.delete(event.key.toLowerCase());
});

window.addEventListener('blur', () => {
    pressedMovementKeys.clear();
    if (movementFrame !== null) {
        cancelAnimationFrame(movementFrame);
        movementFrame = null;
        lastMovementTime = 0;
    }
});
