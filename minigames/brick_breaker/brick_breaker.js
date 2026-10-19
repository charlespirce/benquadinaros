const canvas = document.getElementById("gameCanvas");
const context = canvas.getContext("2d");
const startButton = document.getElementById("startButton");
const scoreDisplay = document.getElementById("score");
const livesDisplay = document.getElementById("lives");
const gameMessage = document.getElementById("gameMessage");
const benImage = new Image();
benImage.src = "../../assets/ben.png";

const width = 960;
const height = 640;
const brickRows = 3;
const brickColumns = 10;
const brickGap = 8;
const brickMargin = 24;
const brickWidth = (width - brickMargin * 2 - brickGap * (brickColumns - 1)) / brickColumns;
const brickHeight = 105;
const paddle = { x: width / 2, y: height - 66, width: 112, height: 14, speed: 560 };
const ball = { x: width / 2, y: paddle.y - 18, radius: 12, vx: 210, vy: -340 };
const keys = new Set();
let bricks = [];
let score = 0;
let lives = 3;
let state = "ready";
let previousFrame = 0;
let animationFrame = null;

function createBricks() {
    bricks = [];
    for (let row = 0; row < brickRows; row += 1) {
        for (let column = 0; column < brickColumns; column += 1) {
            bricks.push({
                x: brickMargin + column * (brickWidth + brickGap),
                y: 34 + row * (brickHeight + brickGap),
                width: brickWidth,
                height: brickHeight,
                active: true
            });
        }
    }
}

function drawBen(x, y, drawWidth, drawHeight) {
    if (benImage.complete && benImage.naturalWidth) {
        context.drawImage(benImage, x, y, drawWidth, drawHeight);
    }
}

function draw() {
    context.clearRect(0, 0, width, height);
    context.strokeStyle = "rgba(200, 241, 105, 0.08)";
    context.lineWidth = 1;
    for (let x = 0; x < width; x += 48) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, height);
        context.stroke();
    }

    bricks.forEach((brick) => {
        if (brick.active) {
            drawBen(brick.x, brick.y, brick.width, brick.height);
        }
    });

    drawBen(paddle.x - paddle.width / 2, paddle.y - 52, paddle.width, 66);
    drawBen(ball.x - ball.radius, ball.y - ball.radius, ball.radius * 2, ball.radius * 2.5);
}

function updateDisplays() {
    scoreDisplay.textContent = String(score);
    livesDisplay.textContent = String(lives);
}

function resetGame() {
    score = 0;
    lives = 3;
    paddle.x = width / 2;
    ball.x = width / 2;
    ball.y = paddle.y - 18;
    ball.vx = 210;
    ball.vy = -340;
    createBricks();
    updateDisplays();
}

function finishGame(won) {
    state = won ? "won" : "lost";
    startButton.textContent = "Play again";
    gameMessage.textContent = won ? "Every Ben has been broken." : "Out of lives. Give it another go.";
}

function startGame() {
    resetGame();
    state = "playing";
    previousFrame = 0;
    startButton.textContent = "Restart";
    gameMessage.textContent = "Keep the Ben in play.";
    if (animationFrame === null) {
        animationFrame = requestAnimationFrame(gameLoop);
    }
}

function setPaddleFromPointer(event) {
    if (state !== "playing") {
        return;
    }

    const bounds = canvas.getBoundingClientRect();
    paddle.x = Math.max(
        paddle.width / 2,
        Math.min(width - paddle.width / 2, (event.clientX - bounds.left) * width / bounds.width)
    );
}

function update(delta) {
    const keyDirection = Number(keys.has("arrowright") || keys.has("d"))
        - Number(keys.has("arrowleft") || keys.has("a"));
    paddle.x += keyDirection * paddle.speed * delta;
    paddle.x = Math.max(paddle.width / 2, Math.min(width - paddle.width / 2, paddle.x));

    ball.x += ball.vx * delta;
    ball.y += ball.vy * delta;

    if (ball.x - ball.radius < 0 || ball.x + ball.radius > width) {
        ball.vx *= -1;
        ball.x = Math.max(ball.radius, Math.min(width - ball.radius, ball.x));
    }
    if (ball.y - ball.radius < 0) {
        ball.vy = Math.abs(ball.vy);
        ball.y = ball.radius;
    }

    if (ball.vy > 0
        && ball.y + ball.radius >= paddle.y
        && ball.y - ball.radius <= paddle.y + paddle.height
        && ball.x >= paddle.x - paddle.width / 2
        && ball.x <= paddle.x + paddle.width / 2) {
        const hitOffset = (ball.x - paddle.x) / (paddle.width / 2);
        const speed = Math.hypot(ball.vx, ball.vy);
        const angle = hitOffset * 1.05;
        ball.vx = Math.sin(angle) * speed;
        ball.vy = -Math.cos(angle) * speed;
        ball.y = paddle.y - ball.radius;
    }

    const hitBrick = bricks.find((brick) => brick.active
        && ball.x + ball.radius > brick.x
        && ball.x - ball.radius < brick.x + brick.width
        && ball.y + ball.radius > brick.y
        && ball.y - ball.radius < brick.y + brick.height);
    if (hitBrick) {
        hitBrick.active = false;
        ball.vy *= -1;
        score += 100;
        updateDisplays();
        if (bricks.every((brick) => !brick.active)) {
            finishGame(true);
        }
    }

    if (ball.y - ball.radius > height) {
        lives -= 1;
        updateDisplays();
        if (lives === 0) {
            finishGame(false);
        } else {
            ball.x = paddle.x;
            ball.y = paddle.y - 18;
            ball.vx = 210 * (Math.random() < 0.5 ? -1 : 1);
            ball.vy = -340;
        }
    }
}

function gameLoop(timestamp) {
    const delta = previousFrame ? Math.min((timestamp - previousFrame) / 1000, 0.025) : 0;
    previousFrame = timestamp;

    if (state === "playing") {
        update(delta);
    }
    draw();

    if (state === "playing") {
        animationFrame = requestAnimationFrame(gameLoop);
    } else {
        animationFrame = null;
    }
}

startButton.addEventListener("click", startGame);

canvas.addEventListener("pointermove", setPaddleFromPointer);
canvas.addEventListener("pointerdown", setPaddleFromPointer);
window.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    if (["arrowleft", "arrowright", "a", "d"].includes(key)) {
        if (state === "playing") {
            keys.add(key);
            event.preventDefault();
        }
    } else if (key === " " && (state === "ready" || state === "won" || state === "lost")) {
        startGame();
    }
});
window.addEventListener("keyup", (event) => keys.delete(event.key.toLowerCase()));
window.addEventListener("blur", () => keys.clear());

createBricks();
updateDisplays();
draw();
benImage.addEventListener("load", draw);