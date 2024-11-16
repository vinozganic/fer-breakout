/*======================
   Brojevne konstante
========================*/
const BALL_RADIUS = 10;
const BALL_SPEED = 8;
const BALL_Y_OFFSET = 10;

const STICK_WIDTH = 250;
const STICK_HEIGHT = 10;
const STICK_SPEED = 13;
const STICK_MOVE_MULTIPLIER = 2;
const STICK_Y_OFFSET = 20;

const BRICK_ROW_COUNT = 2;
const BRICK_COLUMN_COUNT = 1;
const BRICK_WIDTH_OFFSET = 11;
const BRICK_HEIGHT = 20;
const BRICK_PADDING = 10;
const BRICK_OFFSET_TOP = 50;
const BRICK_OFFSET_LEFT = 10;

const SCORE_X_OFFSET = 80;
const HIGHSCORE_X_OFFSET = 240;
const SCORE_HIGHSCORE_Y_OFFSET = 20;

/*======================
    Definicije klasa
========================*/
class Ball {
    constructor(x, y, radius, directionX, directionY, speed) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.directionX = directionX;
        this.directionY = directionY;
        this.speed = speed;
    }

    draw(context) {
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        context.fillStyle = "darkblue";
        context.fill();
        context.closePath();
    }

    update() {
        this.x += this.directionX * this.speed;
        this.y += this.directionY * this.speed;
    }
}

class Stick {
    constructor(x, y, width, height, speed) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
    }

    draw(context) {
        context.save();
        context.shadowColor = "rgba(0, 0, 0, 0.7)";
        context.shadowBlur = 3;
        context.shadowOffsetX = 2;
        context.shadowOffsetY = 2;
        const sX = (stickPatternImage.width - this.width) / 2;
        const sY = (stickPatternImage.height - this.height) / 2;
        context.drawImage(stickPatternImage, sX, sY, this.width, this.height, this.x, this.y, this.width, this.height);
        context.restore();
    }

    move(direction) {
        const x = this.x + this.speed * STICK_MOVE_MULTIPLIER * direction;
        if (x >= canvas.clientWidth - this.width || x <= 0) return;

        this.x += this.speed * STICK_MOVE_MULTIPLIER * direction;
    }
}

class Brick {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.status = "intact";
    }

    draw(context) {
        if (this.status === "intact") {
            context.save();
            context.shadowColor = "rgba(0, 0, 0, 0.7)";
            context.shadowBlur = 3;
            context.shadowOffsetX = 2;
            context.shadowOffsetY = 2;
            const sX = (brickPatternImage.width - this.width) / 2;
            const sY = (brickPatternImage.height - this.height) / 2;
            context.drawImage(
                brickPatternImage,
                sX,
                sY,
                this.width,
                this.height,
                this.x,
                this.y,
                this.width,
                this.height
            );
            context.restore();
        }
    }

    static drawBricks() {
        bricks.forEach(brick => {
            if (brick.status === "intact") {
                brick.draw(context);
                if (
                    ball.x - ball.radius < brick.x + brick.width &&
                    ball.x + ball.radius > brick.x &&
                    ball.y - ball.radius < brick.y + brick.height &&
                    ball.y + ball.radius > brick.y
                ) {
                    ball.directionY = -ball.directionY;
                    brick.status = "destroyed";
                    score++;
                }
            }
        });
    }
}

/*======================
    Globalne varijable
========================*/
let score = 0;
let isGameRunning = false;
let animationFrameId = null;

let ball;
const bricks = [];

/*======================
  Inicializacija platna
========================*/
const canvas = document.getElementById("breakout-canvas");
const context = canvas.getContext("2d");

canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

const stick = new Stick(
    canvas.width / 2 - STICK_WIDTH / 2,
    canvas.height - STICK_Y_OFFSET,
    STICK_WIDTH,
    STICK_HEIGHT,
    STICK_SPEED
);

function getRandomDirection() {
    let minAngle = (-3 * Math.PI) / 4;
    let maxAngle = -Math.PI / 4;
    let angle = Math.random() * (maxAngle - minAngle) + minAngle;
    return { x: Math.cos(angle), y: Math.sin(angle) };
}

function createBall() {
    let initialPositionX = stick.x + stick.width / 2;
    let initialPositionY = stick.y - BALL_Y_OFFSET;
    let randomDirection = getRandomDirection();
    return new Ball(initialPositionX, initialPositionY, BALL_RADIUS, randomDirection.x, randomDirection.y, BALL_SPEED);
}
ball = createBall();

function createBrickWall() {
    const brickWidth = canvas.width / BRICK_COLUMN_COUNT - BRICK_WIDTH_OFFSET;
    for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
        for (let r = 0; r < BRICK_ROW_COUNT; r++) {
            const x = c * (brickWidth + BRICK_PADDING) + BRICK_OFFSET_LEFT;
            const y = r * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_OFFSET_TOP;
            bricks.push(new Brick(x, y, brickWidth, BRICK_HEIGHT));
        }
    }
}
createBrickWall();

/*======================
    Najbolji rezultat
========================*/
function getHighscore() {
    const highScore = localStorage.getItem("highscore");
    if (highScore === null) {
        localStorage.setItem("highscore", score);
        return score;
    }
    return highScore;
}

function setHighscore() {
    const highScore = getHighscore();
    if (score > highScore) {
        localStorage.setItem("highscore", score);
    }
}

function renderScores() {
    setHighscore();

    context.font = "20px Arial";
    context.fillStyle = "darkblue";
    context.textAlign = "center";
    context.fillText(`Current score: ${score}`, canvas.width - SCORE_X_OFFSET, SCORE_HIGHSCORE_Y_OFFSET);
    context.fillText(`Highscore: ${getHighscore()}`, canvas.width - HIGHSCORE_X_OFFSET, SCORE_HIGHSCORE_Y_OFFSET);
}

/*======================
      Kontrole igre
========================*/
function resetGame() {
    stick.x = (canvas.width - stick.width) / 2;
    ball = createBall();
    bricks.forEach(brick => (brick.status = "intact"));
    score = 0;
    renderScores();
}

function gameLost() {
    isGameRunning = false;
    cancelAnimationFrame(animationFrameId);
    displayCentralMessage("GAME OVER", "red");
}

function gameWon() {
    isGameRunning = false;
    cancelAnimationFrame(animationFrameId);
    displayCentralMessage("YOU WON", "green");
}

function displayCentralMessage(message, color) {
    context.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    context.font = "150px Arial";
    context.fillStyle = color;
    context.textAlign = "center";
    context.fillText(message, canvas.width / 2, canvas.height / 2);
    context.font = "30px Arial";
    context.fillStyle = "darkblue";
    context.fillText("Press any keyboard key to restart", canvas.width / 2, canvas.height / 2 + 100);
    document.addEventListener("keydown", restartListener, { once: true });
}

function restartListener() {
    resetGame();
    isGameRunning = true;
    infiniteGameLoop();
}

/*======================
   Glavna petlja igre
========================*/
function infiniteGameLoop() {
    if (!isGameRunning) return;

    context.clearRect(0, 0, canvas.width, canvas.height);

    ball.update();
    ball.draw(context);

    if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) ball.directionX = -ball.directionX;
    if (ball.y - ball.radius < 0) ball.directionY = -ball.directionY;

    if (
        ball.x + ball.radius > stick.x &&
        ball.x - ball.radius < stick.x + stick.width &&
        ball.y + ball.radius > stick.y &&
        ball.y - ball.radius < stick.y + stick.height
    ) {
        ball.directionY = -ball.directionY;
        ball.y = stick.y - ball.radius;
    }

    if (ball.y - ball.radius > canvas.height) gameLost();
    if (bricks.every(brick => brick.status === "destroyed")) gameWon();

    stick.draw(context);
    Brick.drawBricks();
    renderScores();

    requestAnimationFrame(infiniteGameLoop);
}

/*======================
Claude: UNESI ISPRAVAN TEKST
========================*/
document.addEventListener("keydown", event => {
    if (event.key === "ArrowLeft") stick.move(-1);
    if (event.key === "ArrowRight") stick.move(1);
});

/*======================
    Učitavanje slika
========================*/
const brickPatternImage = new Image();
const stickPatternImage = new Image();
let imagesLoaded = 0;

brickPatternImage.onload = stickPatternImage.onload = function () {
    imagesLoaded++;
    if (imagesLoaded === 2) {
        resetGame();
        isGameRunning = true;
        infiniteGameLoop();
    }
};

brickPatternImage.src = "public/brick-pattern.jpg";
stickPatternImage.src = "public/wood-pattern.jpg";
