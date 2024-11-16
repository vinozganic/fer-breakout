//** Igra se prikazuje u Canvas objektu koji pokriva cijeli prozor web preglednika. Pozadina Canvas može biti crne ili bijele boje, ili neke druge boje po vašem
//** odabiru s dovoljnim kontrastom za bolji prikaz.

//** Canvas objekt mora imati vidljivi rub.

//** Igra započinje odmah nakon učitavanja web stranice. Na početku igre generira se određen broj objekata (cigli) koje igrač treba razbiti pomoću loptice koja se
//** odbija o palicu koju igrač kontrolira na dnu ekrana. Loptica se inicijalno generira na središtu palice i počinje se kretati prema gore pod slučajnim kutem.

//** Igrač upravlja palicom obavezno pomoću tipkovnice. Npr. tipke strelice - lijevo i desno, ili neke druge dvije tipke po vašem izboru.

//** Novi objekti cigli su raspoređeni u nekoliko redova na vrhu ekrana, dok se loptica i palica nalaze na dnu. Loptica se kreće konstantnom brzinom, a smjer mijenja
//** prilikom udara o palicu, cigle ili rubove ekrana. Odabrane vrijednosti za brzinu loptice i veličinu palice moraju biti takve da je igru moguće igrati, odnosno
//** da nije preteška.

//** Parametri igre - broj cigli i početna brzina loptice su predefinirani (konstantne u vašem programskom kodu). Opcionalno, parametri igre mogu se konfigurirati kroz
//** HTML5 web stranicu prije pokretanja igre.

//** Objekt koji predstavlja ciglu je pravokutnik odabrane boje. Umjesto pravokutnika dozvoljeno je koristiti prikladnu sliku (JPG, PNG) cigle.

//** Slično, objekt koji predstavlja palicu na dnu ekrana je pravokutnik crvene boje s obaveznim sjenčanjem ruba. Dozvoljeno je koristiti neku sliku (npr. platformu)
//** umjesto pravokutnika.

//** Cigle i palica obavezno moraju imati sjenčanje ruba i biti prikazani korištenjem HTML5 Canvas API-a.

//** Ako loptica izađe izvan donjeg ruba ekrana, igra završava, te se obavezno preko sredine Canvasa (vertikalno i horizontalno centrirano) prikazuje tekstualna
//** obavijest (npr. "GAME OVER"), velikih slova u definiranom fontu.

//** Ako je igrač dovoljno vješt i uspije uništiti sve cigle, igra završava uz obavezni ispis prikladne poruke na isti način.

//** U svakom koraku animacije mora se detektirati kolizija (sudar) loptice s ciglama, palicom i rubovima ekrana. Nakon svakog sudara s ciglom, cigla nestaje, a igrač
//** dobiva bodove (1 uništena cigla = 1 bod).

//** Moguće je (nije obavezno) generirati zvuk prilikom kolizije loptice i cigle, loptice i palice, ili loptice i gornjeg, lijevo i desnog ruba Canvasa. Također,
//** moguće je generirati odgovarajuće zvuk na početku i kraju igre, te kada igrač pređe neki okrugli broj bodova.

// Igra mora mjeriti broj bodova, a cilj igrača je postići što više bodova razbijanjem svih cigli bez gubitka loptice.

// Najbolje ostvareni rezultat, od kad je igra prvi put pokrenuta, mora se pohranjivati koristeći local storage pomoću HTML5 Web Storage API-ja.

// U gornjem desnom rubu Canvasa mora se prikazivati trenutni broj bodova i maksimalni broj bodova.

// Deklaracije struktura, objekata, funkcija kao i pozivi funkcija moraju biti detaljno komentirani i precizno objašnjeni u HTML5 i JavaScript izvornom kodu vašim
// riječima.

/*======================
Number constants
========================*/
const BALL_RADIUS = 10;
const BALL_SPEED = 8;
const BALL_Y_OFFSET = 10;

const STICK_WIDTH = 250;
const STICK_HEIGHT = 10;
const STICK_SPEED = 10;
const STICK_MOVE_MULTIPLIER = 5;
const STICK_Y_OFFSET = 20;

const BRICK_ROW_COUNT = 2;
const BRICK_COLUMN_COUNT = 1;
const BRICK_WIDTH_OFFSET = 11;
const BRICK_HEIGHT = 20;
const BRICK_PADDING = 10;
const BRICK_OFFSET_TOP = 50;
const BRICK_OFFSET_LEFT = 10;

/*======================
Class definitions
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
}

/*======================
Global variables
========================*/
let score = 0;
let isGameRunning = false;
let animationFrameId = null;

/*======================
Main program setup
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

let ball = createBall();

const bricks = [];
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
Game control functions
========================*/
function resetGame() {
    stick.x = (canvas.width - stick.width) / 2;
    ball = createBall();
    bricks.forEach(brick => (brick.status = "intact"));
    score = 0;
    document.getElementById("score").innerText = `Score: ${score}`;
}

function gameLost() {
    isGameRunning = false;
    cancelAnimationFrame(animationFrameId);
    displayMessage("GAME OVER", "red");
}

function gameWon() {
    isGameRunning = false;
    cancelAnimationFrame(animationFrameId);
    displayMessage("YOU WON", "green");
}

function displayMessage(message, color) {
    context.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    context.font = "150px Arial";
    context.fillStyle = color;
    context.textAlign = "center";
    context.fillText(message, canvas.width / 2, canvas.height / 2);
    context.font = "30px Arial";
    context.fillStyle = "darkblue";
    context.fillText("Press any key to restart", canvas.width / 2, canvas.height / 2 + 100);
    document.addEventListener("keydown", restartListener, { once: true });
}

function restartListener() {
    resetGame();
    isGameRunning = true;
    infiniteGameLoop();
}

/*======================
Main game loop
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
    drawBricks();
    requestAnimationFrame(infiniteGameLoop);
}

function drawBricks() {
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
                document.getElementById("score").innerText = `Score: ${score}`;
            }
        }
    });
}

/*======================
Key listeners
========================*/
document.addEventListener("keydown", event => {
    if (event.key === "ArrowLeft") stick.move(-1);
    if (event.key === "ArrowRight") stick.move(1);
});

/*======================
Image patterns
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