/*====================================================
 BROJČANE KONSTANTE ZA IGRU
 - Sve važne dimenzije i postavke na jednom mjestu
 - Lakše je mijenjati vrijednosti ovako nego u kodu
====================================================*/
const BALL_RADIUS = 10; // Polumjer loptice u pikselima
const BALL_SPEED = 8; // Brzina kretanja loptice
const BALL_Y_OFFSET = 10; // Razmak loptice od palice prema gore

const STICK_WIDTH = 250; // Širina palice kojom igrač upravlja
const STICK_HEIGHT = 10; // Visina palice
const STICK_SPEED = 6; // Osnovna brzina kretanja palice
const STICK_MOVE_MULTIPLIER = 2; // Množitelj brzine palice (za glađe kretanje)
const STICK_Y_OFFSET = 20; // Razmak palice od dna canvasa

const BRICK_ROW_COUNT = 4; // Broj redova cigli
const BRICK_COLUMN_COUNT = 8; // Broj stupaca cigli
const BRICK_WIDTH_OFFSET = 11; // Horizontalni razmak između cigli
const BRICK_HEIGHT = 20; // Visina jedne cigle
const BRICK_PADDING = 10; // Prostor između cigli
const BRICK_OFFSET_TOP = 40; // Razmak cigli od vrha
const BRICK_OFFSET_LEFT = 10; // Razmak cigli od lijeve strane

const SCORE_X_OFFSET = 90; // X pozicija na canvasu za prikaz trenutnog rezultata
const HIGHSCORE_X_OFFSET = 260; // X pozicija na canvasu za prikaz najboljeg rezultata
const SCORE_HIGHSCORE_Y_OFFSET = 25; // Y pozicija na canvasu za prikaz rezultata

/*====================================================
KLASE - Glavni gradivni blokovi igre
====================================================*/

/* 
Ball klasa - Upravlja ponašanjem loptice
- Sadrži poziciju (x,y), radius, smjer kretanja i brzinu
- Može se nacrtati i ažurirati svoju poziciju
*/
class Ball {
    constructor(x, y, radius, directionX, directionY, speed) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.directionX = directionX; // Smjer kretanja po X osi (-1 lijevo, 1 desno)
        this.directionY = directionY; // Smjer kretanja po Y osi (-1 gore, 1 dolje)
        this.speed = speed; // Brzina kretanja loptice
    }

    // Metoda za crtanje loptice na canvasu
    draw(context) {
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        context.fillStyle = "darkblue";
        context.fill();
        context.closePath();
    }

    // Ažurira poziciju loptice na temelju smjera i brzine
    update() {
        this.x += this.directionX * this.speed; // Pomicanje loptice po X osi
        this.y += this.directionY * this.speed; // Pomicanje loptice po Y osi
    }
}

/*
Stick klasa - Palica kojom igrač odbija lopticu
- Može se kretati lijevo-desno
- Ima svoju poziciju, dimenzije i brzinu
*/
class Stick {
    constructor(x, y, width, height, speed) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
    }

    // Crtanje palice s wood-pattern teksturom i sjenom
    draw(context) {
        context.save();

        // Postavljanje sjene
        context.shadowColor = "rgba(0, 0, 0, 0.7)";
        context.shadowBlur = 3;
        context.shadowOffsetX = 2;
        context.shadowOffsetY = 2;

        // Postavljanje teksture palice
        const sX = (stickPatternImage.width - this.width) / 2;
        const sY = (stickPatternImage.height - this.height) / 2;
        context.drawImage(stickPatternImage, sX, sY, this.width, this.height, this.x, this.y, this.width, this.height);

        context.restore();
    }

    // Pomicanje palice lijevo-desno, ali ne dozvoljava izlazak izvan canvasa
    move(direction) {
        const x = this.x + this.speed * STICK_MOVE_MULTIPLIER * direction;

        if (x >= canvas.clientWidth - this.width || x <= 0) return; // Ne dozvoljavanje izlaska izvan canvasa

        this.x += this.speed * STICK_MOVE_MULTIPLIER * direction; // Pomicanje palice
    }
}

/*
Brick klasa - Cigle koje igrač treba razbiti
- Ima poziciju, dimenzije i status (intact/destroyed)
- Sadrži i statičku metodu za crtanje svih cigli
*/
class Brick {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.status = "intact"; // Može biti "intact" ili "destroyed"
    }

    // Crta ciglu s teksturom i sjenom
    draw(context) {
        if (this.status === "intact") {
            context.save();

            // Postavljanje sjene
            context.shadowColor = "rgba(0, 0, 0, 0.7)";
            context.shadowBlur = 3;
            context.shadowOffsetX = 2;
            context.shadowOffsetY = 2;

            // Postavljanje teksture cigle
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

    // Statička metoda koja crta sve cigle i provjerava kolizije s lopticom
    static drawBricks() {
        bricks.forEach(brick => {
            if (brick.status === "intact") {
                brick.draw(context);

                // Provjera kolizije loptice i cigle
                if (
                    ball.x - ball.radius < brick.x + brick.width && // Je li desni rub loptice prešao lijevi rub cigle
                    ball.x + ball.radius > brick.x && // Je li lijevi rub loptice prešao desni rub cigle
                    ball.y - ball.radius < brick.y + brick.height && // Je li donji rub loptice prešao gornji rub cigle
                    ball.y + ball.radius > brick.y // Je li gornji rub loptice prešao donji rub cigle
                ) {
                    ball.directionY = -ball.directionY; // Odbij lopticu - promjnei smjer po Y osi
                    brick.status = "destroyed"; // Označi ciglu kao uništenu
                    score++; // Povećaj rezultat
                }
            }
        });
    }
}

/*====================================================
 GLOBALNE VARIJABLE I INICIJALIZACIJA
====================================================*/
let score = 0; // Trenutni rezultat
let isGameRunning = false; // Status igre (aktivna/pauzirana)
let animationFrameId = null; // ID animation frame-a za loop igre
let ball; // Instanca loptice
const bricks = []; // Array svih cigli u igri

// Dohvaćanje canvas elementa i njegovog konteksta
const canvas = document.getElementById("breakout-canvas");
const context = canvas.getContext("2d");

// Sinkronizacija stvarne veličine canvas elementa (width/height) s njegovom CSS veličinom (100%)
// Bez ovoga bi canvas mogao imati različitu internu rezoluciju od svoje prikazane veličine,
// što bi rezultiralo razvučenim (predimenzioniranim) sadržajem
// Različita dimenzija ekrana - različite width i height vrijednosti
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

// Kreiranje palice na sredini donjeg dijela canvasa
const stick = new Stick(
    canvas.width / 2 - STICK_WIDTH / 2,
    canvas.height - STICK_Y_OFFSET,
    STICK_WIDTH,
    STICK_HEIGHT,
    STICK_SPEED
);

/*====================================================
 POMOĆNE FUNKCIJE ZA KREIRANJE LOPTICE I ZIDA CIGLI
====================================================*/

// Generira random smjer za početno kretanje loptice (prema gore)
function getRandomDirection() {
    let minAngle = (-3 * Math.PI) / 4; // Minimalni kut (prema gore-lijevo)
    let maxAngle = -Math.PI / 4; // Maksimalni kut (prema gore-desno)
    let angle = Math.random() * (maxAngle - minAngle) + minAngle; // Izračun random kuta između min i max
    return { x: Math.cos(angle), y: Math.sin(angle) }; // Pretvaranje kuta u x/y koordinate smjera
}

// Kreira novu lopticu iznad palice
function createBall() {
    let initialPositionX = stick.x + stick.width / 2; // Pozicioniranje loptice na sredinu palice
    let initialPositionY = stick.y - BALL_Y_OFFSET;
    let randomDirection = getRandomDirection();
    return new Ball(initialPositionX, initialPositionY, BALL_RADIUS, randomDirection.x, randomDirection.y, BALL_SPEED);
}
ball = createBall(); // Prva inicijalizacija loptice

// Kreira zid od cigli (na početku igre)
function createBrickWall() {
    const brickWidth = canvas.width / BRICK_COLUMN_COUNT - BRICK_WIDTH_OFFSET;
    for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
        // Iteracija kroz stupce
        for (let r = 0; r < BRICK_ROW_COUNT; r++) {
            // Iteracija kroz redove
            const x = c * (brickWidth + BRICK_PADDING) + BRICK_OFFSET_LEFT;
            const y = r * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_OFFSET_TOP;
            bricks.push(new Brick(x, y, brickWidth, BRICK_HEIGHT));
        }
    }
}
createBrickWall(); // Prva inicijalizacija zida

/*====================================================
 FUNKCIJE ZA RAD S REZULTATOM I NAJBOLJIM REZULTATOM
====================================================*/

// Dohvaća najbolji rezultat iz localStorage-a
function getHighscore() {
    const highScore = localStorage.getItem("highscore");

    // Ako ne postoji u localStorage-u, postavi trenutni rezultat kao najbolji
    if (highScore === null) {
        localStorage.setItem("highscore", score);
        return score;
    }
    return highScore;
}

// Postavlja novi najbolji rezultat ako je trenutni bolji
function setHighscore() {
    const highScore = getHighscore();
    if (score > highScore) {
        localStorage.setItem("highscore", score);
    }
}

// Prikazuje trenutni rezultat i najbolji rezultat
function renderScores() {
    setHighscore();

    context.font = "20px Arial";
    context.fillStyle = "darkblue";
    context.textAlign = "center";
    context.fillText(
        `Current score: ${score}/${bricks.length}`,
        canvas.width - SCORE_X_OFFSET,
        SCORE_HIGHSCORE_Y_OFFSET
    );
    context.fillText(`Highscore: ${getHighscore()}`, canvas.width - HIGHSCORE_X_OFFSET, SCORE_HIGHSCORE_Y_OFFSET);
}

/*====================================================
 KONTROLE IGRE - Resetiranje, pobjeda, poraz
====================================================*/

// Resetira igru na početno stanje
function resetGame() {
    stick.x = (canvas.width - stick.width) / 2; // Palica se postavlja na sredinu ekrana
    ball = createBall(); // Ponovna kreacija loptice
    bricks.forEach(brick => (brick.status = "intact")); // Sve cigle su opet netaknute
    score = 0;
    renderScores();
}

// Funkcija koja se poziva kad igrač izgubi
function gameLost() {
    isGameRunning = false;
    cancelAnimationFrame(animationFrameId); // Prekini beskonačnu petlju igre
    displayCentralMessage("GAME OVER", "red");
}

// Funkcija koja se poziva kad igrač pobijedi
function gameWon() {
    isGameRunning = false;
    cancelAnimationFrame(animationFrameId); // Prekini beskonačnu petlju igre
    displayCentralMessage("YOU WON", "green");
}

// Prikazuje poruku u centru ekrana (za pobjedu/poraz)
function displayCentralMessage(message, color) {
    context.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

    context.font = "150px Arial";
    context.fillStyle = color;
    context.textAlign = "center";
    context.fillText(message, canvas.width / 2, canvas.height / 2);

    context.font = "30px Arial";
    context.fillStyle = "darkblue";
    context.fillText("Press any keyboard key to restart", canvas.width / 2, canvas.height / 2 + 100);

    // Sluša se pritisak bilo koje tipke na tipkovnici, ali samo jednom - za reset igre
    // Nakon pritiske tipke, pozive se restartListener() callback funkcija
    document.addEventListener("keydown", restartListener, { once: true });
}

// Event listener za restart igre
function restartListener() {
    resetGame();
    isGameRunning = true;
    infiniteGameLoop(); // Ponovno pokretanje igre
}

/*====================================================
 GLAVNA PETLJA IGRE
====================================================*/
function infiniteGameLoop() {
    if (!isGameRunning) return;

    // Čisti canvas za novi frame
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Provjera pritisnutih tipki za pomicanje palice
    // Na ovaj način se postiže glatko (smooth) kretanje palice. Umjesto korištenja najobičnijih listenera za keydown
    if (keyState.ArrowLeft) stick.move(-1);
    if (keyState.ArrowRight) stick.move(1);

    // Ažuriranje i crtanje loptice
    ball.update();
    ball.draw(context);

    // Odbijanje loptice od zidova
    if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) ball.directionX = -ball.directionX;
    if (ball.y - ball.radius < 0) ball.directionY = -ball.directionY;

    // Provjera kolizije loptice i palice
    if (
        ball.x + ball.radius > stick.x && // Lijevi rub palice dodirnut
        ball.x - ball.radius < stick.x + stick.width && // Desni rub palice dodirnut
        ball.y + ball.radius > stick.y && // Gornji rub palice dodirnut
        ball.y - ball.radius < stick.y + stick.height // Donji rub palice dodirnut
    ) {
        ball.directionY = -ball.directionY; // Odbijanje loptice od palice
        ball.y = stick.y - ball.radius; // Postavljanje lopticu točno iznad palice (sprječavanje zaglavljivanja)
    }

    // Provjera je li loptica pala ispod palice - igrač je izgubio
    if (ball.y - ball.radius > canvas.height) gameLost();
    // Provjera jesu li sve cigle uništene - igrač je pobijedio
    if (bricks.every(brick => brick.status === "destroyed")) gameWon();

    // Crtanje ostalih elemenata
    stick.draw(context);
    Brick.drawBricks();
    renderScores();

    // Govori browseru da nacrtata novi frame kad bude spreman (najčešće 60 puta u sekundi - 60FPS)
    requestAnimationFrame(infiniteGameLoop);
}

/*====================================================
 EVENT LISTENERI ZA TIPKOVNICU
====================================================*/
const keyState = {
    ArrowLeft: false,
    ArrowRight: false,
};

// Handler za pritisak tipke
document.addEventListener("keydown", event => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        if (!keyState[event.key]) {
            // Ažuriranje stanja tipke SAMO AKO već NIJE pritisnuta
            keyState[event.key] = true;
        }
        event.preventDefault(); // Sprječavanje defaultno ponašanje browsera
    }
});

// Handler za otpuštanje tipke
document.addEventListener("keyup", event => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        keyState[event.key] = false;
        event.preventDefault(); // Sprječavanje defaultno ponašanje browsera
    }
});

/*====================================================
 UČITAVANJE TEKSTURA
 - Učitavanje slika za cigle i palicu
 - Igra počinje tek kad se sve slike učitaju
====================================================*/
const brickPatternImage = new Image();
const stickPatternImage = new Image();
let imagesLoaded = 0;

// Callback koji se poziva kad se slika učita
brickPatternImage.onload = stickPatternImage.onload = function () {
    imagesLoaded++;
    // Kad su obje slike učitane
    if (imagesLoaded === 2) {
        resetGame(); // Resetiranje igre na početno stanje
        isGameRunning = true; // Pokretanje igre
        infiniteGameLoop(); // Pokretanje glavne petlje
    }
};

// Postavljanje izvora slika (ovo će triggerat .onload callback)
brickPatternImage.src = "public/brick-pattern.jpg";
stickPatternImage.src = "public/wood-pattern.jpg";
