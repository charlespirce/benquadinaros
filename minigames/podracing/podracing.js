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
 const raceAudio = document.getElementById("raceAudio");
 const AudioContextClass = window.AudioContext || window.webkitAudioContext;
 const raceAudioContext = raceAudio && AudioContextClass ? new AudioContextClass() : null;
 const raceAudioBuffer = raceAudioContext
    ? fetch("../../assets/racing.wav")
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Could not load racing music: ${response.status}`);
            }
            return response.arrayBuffer();
        })
        .then((audioData) => raceAudioContext.decodeAudioData(audioData))
    : null;
 const raceScoreDisplay = document.getElementById("raceScore");
 let raceScore = 0;
 let highScore = parseInt(localStorage.getItem("highScore")) || 0;
 let coins = parseInt(localStorage.getItem("coins")) || 0;

 const equippedPodracer = localStorage.getItem("equippedPodracer");
 if (podracer && equippedPodracer) {
    podracer.src = equippedPodracer;
 }

 const equippedRacer = localStorage.getItem("equippedRacer");
 if (racer && equippedRacer) {
    racer.src = equippedRacer;
 }
const pod_speed = 10;

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
const movementSpeed = 50;
let raceFrame = null;
let nextObstacleTime = 0;
let obstacleExpiresAt = 0;
let obstacleCollisionStartsAt = 0;
let raceOver = false;
const obstacleVisibleDuration = 1800;
const obstacleCollisionDelay = 1000;
const raceBackground = new Image();
raceBackground.src = "../../assets/grid.png";
let obstacleBackgroundPoint = null;
let raceAudioSource = null;
let raceAudioStartPromise = null;

function playRaceAudio() {
    if (raceOver || raceAudioSource || raceAudioStartPromise) {
        return;
    }

    if (!raceAudioContext) {
        raceAudio?.play().catch((error) => {
            if (error.name !== "NotAllowedError") {
                console.error("Failed to play racing music:", error);
            }
        });
        return;
    }

    const resumePromise = raceAudioContext.resume();
    raceAudioStartPromise = Promise.all([raceAudioBuffer, resumePromise])
        .then(([audioBuffer]) => {
            if (raceOver || raceAudioSource || raceAudioContext.state !== "running") {
                return;
            }

            raceAudioSource = raceAudioContext.createBufferSource();
            raceAudioSource.buffer = audioBuffer;
            raceAudioSource.loop = true;
            raceAudioSource.connect(raceAudioContext.destination);
            raceAudioSource.start();
        })
        .catch((error) => {
            if (error.name !== "NotAllowedError") {
                console.error("Failed to play racing music:", error);
            }
        })
        .finally(() => {
            raceAudioStartPromise = null;
        });
}

function getRaceBackgroundLayout() {
    const scale = Math.max(
        window.innerWidth / raceBackground.naturalWidth,
        window.innerHeight / raceBackground.naturalHeight
    );
    const width = raceBackground.naturalWidth * scale;
    const height = raceBackground.naturalHeight * scale;

    return {
        scale,
        left: (window.innerWidth - width) / 2,
        top: (window.innerHeight - height) / 2
    };
}

function positionObstacleOnBackground() {
    if (!obstacle || !obstacleBackgroundPoint || !raceBackground.naturalWidth) {
        return;
    }

    const background = getRaceBackgroundLayout();
    const centerX = background.left + obstacleBackgroundPoint.x * background.scale;
    const centerY = background.top + obstacleBackgroundPoint.y * background.scale;
    obstacle.style.left = `${centerX - obstacle.offsetWidth / 2}px`;
    obstacle.style.top = `${centerY}px`;
}

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
        const sprites = [podracer, racer].filter(Boolean);
        const bounds = sprites.map((sprite) => sprite.getBoundingClientRect());
        const leftEdge = Math.min(...bounds.map((spriteBounds) => spriteBounds.left));
        const rightEdge = Math.max(...bounds.map((spriteBounds) => spriteBounds.right));
        const requestedPercent = direction * movementSpeed * elapsed;
        const requestedPixels = requestedPercent / 100 * window.innerWidth;
        const movementPixels = Math.max(
            -leftEdge,
            Math.min(window.innerWidth - rightEdge, requestedPixels)
        );

        sprites.forEach((sprite, index) => {
            const center = bounds[index].left + bounds[index].width / 2 + movementPixels;
            sprite.style.left = `${center / window.innerWidth * 100}%`;
        });
    }

    movementFrame = requestAnimationFrame(movePodracer);
}

function endRace() {
    raceOver = true;
    if (raceScore > highScore) {
        localStorage.setItem("highScore", String(raceScore));
    }
    coins += Math.floor(raceScore / 500);
    localStorage.setItem("coins", String(coins));
    raceAudio?.pause();
    raceAudioSource?.stop();
    raceAudioSource?.disconnect();
    raceAudioSource = null;
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
        if (!raceBackground.naturalWidth) {
            raceFrame = requestAnimationFrame(updateRace);
            return;
        }

        const background = getRaceBackgroundLayout();
        const centerX = obstacle.offsetWidth / 2
            + Math.random() * Math.max(0, window.innerWidth - obstacle.offsetWidth);
        const centerY = window.innerHeight * 0.7;
        obstacleBackgroundPoint = {
            x: (centerX - background.left) / background.scale,
            y: (centerY - background.top) / background.scale
        };
        positionObstacleOnBackground();
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

window.addEventListener("resize", positionObstacleOnBackground);

if (obstacle && podracer && window.location.pathname.endsWith("racing.html")) {
    playRaceAudio();
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
    playRaceAudio();
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
