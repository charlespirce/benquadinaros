 const backButton = document.getElementById('backButton');
 const playButton = document.getElementById('playButton');
 const menuButton = document.getElementById('menuButton');
 const tatooine = document.getElementById("tatooine");
 const podracer = document.getElementById("pod");
 const racer = document.getElementById("ben");
 const racerShopButton = document.getElementById("racerShopButton");
 const podShopButton = document.getElementById("podShopButton");

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

function movePodracer(timestamp) {
    if (!podracer || pressedMovementKeys.size === 0) {
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

window.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    if (!podracer || !window.location.pathname.endsWith('racing.html') || !movementKeys.has(key)) {
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