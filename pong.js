const arena = document.querySelector(".pong-arena");
const ball = document.querySelector("#pong-ball");
const playerPaddle = document.querySelector("#player-paddle");
const cpuPaddle = document.querySelector("#cpu-paddle");
const playerScoreLabel = document.querySelector("#player-score");
const cpuScoreLabel = document.querySelector("#cpu-score");
const statusLabel = document.querySelector("#pong-status");
const restartButton = document.querySelector("#restart-pong");

const game = {
	width: 0,
	height: 0,
	paddleWidth: 0,
	paddleHeight: 0,
	ballSize: 0,
	playerY: 0,
	cpuY: 0,
	ballX: 0,
	ballY: 0,
	ballSpeedX: 0,
	ballSpeedY: 0,
	playerScore: 0,
	cpuScore: 0,
	paused: false,
	keys: new Set(),
	lastFrame: performance.now(),
};

function resizeGame() {
	const bounds = arena.getBoundingClientRect();
	game.width = bounds.width;
	game.height = bounds.height;
	game.paddleWidth = playerPaddle.offsetWidth;
	game.paddleHeight = playerPaddle.offsetHeight;
	game.ballSize = ball.offsetWidth;
	game.playerY = clamp(game.playerY || game.height / 2 - game.paddleHeight / 2, 0, game.height - game.paddleHeight);
	game.cpuY = clamp(game.cpuY || game.height / 2 - game.paddleHeight / 2, 0, game.height - game.paddleHeight);
	render();
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}

function resetBall(direction) {
	game.ballX = game.width / 2 - game.ballSize / 2;
	game.ballY = game.height / 2 - game.ballSize / 2;
	game.ballSpeedX = direction * Math.max(280, game.width * 0.42);
	game.ballSpeedY = (Math.random() * 2 - 1) * 180;
}

function resetMatch() {
	game.playerScore = 0;
	game.cpuScore = 0;
	game.paused = false;
	game.playerY = game.height / 2 - game.paddleHeight / 2;
	game.cpuY = game.playerY;
	resetBall(Math.random() < 0.5 ? -1 : 1);
	statusLabel.textContent = "First to 3";
	render();
}

function movePlayer(delta) {
	game.playerY = clamp(game.playerY + delta, 0, game.height - game.paddleHeight);
}

function overlapsPaddle(paddleY, movingRight) {
	const ballRight = game.ballX + game.ballSize;
	const ballBottom = game.ballY + game.ballSize;
	const paddleX = movingRight ? game.width - game.paddleWidth : 0;
	const ballIsAtPaddle = movingRight
		? ballRight >= paddleX && game.ballX <= game.width
		: game.ballX <= game.paddleWidth && ballRight >= 0;

	return ballIsAtPaddle && ballBottom >= paddleY && game.ballY <= paddleY + game.paddleHeight;
}

function update(delta) {
	const playerDirection = (game.keys.has("s") || game.keys.has("arrowdown") ? 1 : 0)
		- (game.keys.has("w") || game.keys.has("arrowup") ? 1 : 0);
	movePlayer(playerDirection * 440 * delta);

	const cpuTarget = game.ballY - game.paddleHeight / 2;
	game.cpuY += clamp(cpuTarget - game.cpuY, -250 * delta, 250 * delta);
	game.cpuY = clamp(game.cpuY, 0, game.height - game.paddleHeight);

	game.ballX += game.ballSpeedX * delta;
	game.ballY += game.ballSpeedY * delta;

	if (game.ballY <= 0 || game.ballY + game.ballSize >= game.height) {
		game.ballY = clamp(game.ballY, 0, game.height - game.ballSize);
		game.ballSpeedY *= -1;
	}

	if (game.ballSpeedX < 0 && overlapsPaddle(game.playerY, false)) {
		game.ballX = game.paddleWidth;
		game.ballSpeedX = Math.abs(game.ballSpeedX) * 1.2;
		game.ballSpeedY += (game.ballY + game.ballSize / 2 - (game.playerY + game.paddleHeight / 2)) * 10;
	}

	if (game.ballSpeedX > 0 && overlapsPaddle(game.cpuY, true)) {
		game.ballX = game.width - game.paddleWidth - game.ballSize;
		game.ballSpeedX = -Math.abs(game.ballSpeedX) * 1.2;
		game.ballSpeedY += (game.ballY + game.ballSize / 2 - (game.cpuY + game.paddleHeight / 2)) * 10;
	}

	if (game.ballX + game.ballSize < 0) {
		game.cpuScore += 1;
		scorePoint(-1);
	} else if (game.ballX > game.width) {
		game.playerScore += 1;
		scorePoint(1);
	}
}

function scorePoint(direction) {
	if (game.playerScore >= 3 || game.cpuScore >= 3) {
		game.paused = true;
		statusLabel.textContent = game.playerScore > game.cpuScore ? "You win" : "Evil Ben wins";
		return;
	}
	resetBall(direction);
}

function render() {
	playerPaddle.style.transform = `translateY(${game.playerY}px)`;
	cpuPaddle.style.transform = `translateY(${game.cpuY}px)`;
	ball.style.transform = `translate(${game.ballX}px, ${game.ballY}px)`;
	playerScoreLabel.textContent = game.playerScore;
	cpuScoreLabel.textContent = game.cpuScore;
}

function frame(now) {
	const delta = Math.min((now - game.lastFrame) / 1000, 0.03);
	game.lastFrame = now;
	if (!game.paused) update(delta);
	render();
	requestAnimationFrame(frame);
}

window.addEventListener("keydown", (event) => {
	const key = event.key.toLowerCase();
	if (["w", "s", "arrowup", "arrowdown", " "].includes(key)) event.preventDefault();
	if (key === " ") game.paused = !game.paused;
	game.keys.add(key);
});

window.addEventListener("keyup", (event) => {
	game.keys.delete(event.key.toLowerCase());
});

arena.addEventListener("pointermove", (event) => {
	const bounds = arena.getBoundingClientRect();
	game.playerY = clamp(event.clientY - bounds.top - game.paddleHeight / 2, 0, game.height - game.paddleHeight);
});

restartButton.addEventListener("click", resetMatch);
window.addEventListener("resize", resizeGame);

resizeGame();
resetMatch();
requestAnimationFrame(frame);
