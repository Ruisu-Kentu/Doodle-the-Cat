// Board
let board;
const boardWidth = 580;
const boardHeight = 966;
let context;

// Doodler
const doodlerWidth = 46;
const doodlerHeight = 46;
let doodlerX = boardWidth / 2 - doodlerWidth / 2;
let doodlerY = boardHeight * 7 / 8 - doodlerHeight;
let doodlerRightImg, doodlerLeftImg;
let doodler = { img: null, x: doodlerX, y: doodlerY, width: doodlerWidth, height: doodlerHeight };

// Physics
let velocityX = 0;
let velocityY = 0;
const initialVelocityY = -13;
const gravity = 0.2;

// Platforms
let platformArray = [];
const platformWidth = 60;
const platformHeight = 18;
let platformImg;

// Springs
let springImg;
const springWidth = 50;
const springHeight = 20;
const springBoost = -20; // Extra boost velocity for spring platforms

// Score
let score = 0;
let gameOver = false;
let gameOverPlayed = false;

// Sound Effects
let jumpSound = new Audio('../doodle-jump-master/sfx/jump.wav');
let deathSound = new Audio('../doodle-jump-master/sfx/geymOver.mp3');
let springSound = new Audio('../doodle-jump-master/sfx/spring.wav'); // Spring sound

// Arrow
let arrowImg = new Image();
arrowImg.src = "../doodle-jump-master/images/arow-removebg-preview.png";

// Background images
const backgrounds = [
    "url('../doodle-jump-master/images/bg1.png')",  // Background 1 for score 0-20
    "url('../doodle-jump-master/images/bg2.png')",  // Background 2 for score 20-30
    "url('../doodle-jump-master/images/bg3.png')"   // Background 3 for score 30+
];

// Countdown
let delayActive = false;  // Flag to track if the delay is active
let countdown = 3;        // Countdown timer
let countdownInterval;    // To store the countdown interval

// Game Initialization
window.onload = function () {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    // Load images
    doodlerRightImg = new Image();
    doodlerRightImg.src = "../doodle-jump-master/images/facing-right-cat-removebg-preview.png";
    doodler.img = doodlerRightImg;

    doodlerLeftImg = new Image();
    doodlerLeftImg.src = "../doodle-jump-master/images/facing-left-cat-removebg-preview.png";
    platformImg = new Image();
    platformImg.src = "../doodle-jump-master/images/platform.png";
    springImg = new Image();
    springImg.src = "../doodle-jump-master/images/spreng.png";

    velocityY = initialVelocityY;
    placePlatforms();
    requestAnimationFrame(update);
    document.addEventListener("keydown", moveDoodler);
}

// Function to change the background based on the player's score
function changeBackground() {
    if (score <= 10) {
        board.style.backgroundImage = backgrounds[0]; // bg1
    } else if (score <= 20) {
        board.style.backgroundImage = backgrounds[1]; // bg2
    } else {
        board.style.backgroundImage = backgrounds[2]; // bg3
    }
}

// Game Update Loop
function update() {
    if (gameOver) {
        deathSound.play();
        // Show countdown if active
        if (delayActive) return;
        // Game over message
        context.fillStyle = "black";
        context.font = "bolder 16px sans-serif";
        context.fillText("Game Over: Press 'Space' to Go to the Starting Page", boardWidth / 7, boardHeight * 7 / 8);
        return;
    }

    requestAnimationFrame(update);

    context.clearRect(0, 0, board.width, board.height);

    // Update the background based on score
    changeBackground();

    // Update doodler's position
    doodler.x += velocityX;
    if (doodler.x > boardWidth) doodler.x = 0;
    else if (doodler.x + doodler.width < 0) doodler.x = boardWidth;

    velocityY += gravity;
    doodler.y += velocityY;

    if (doodler.y > board.height) gameOver = true;

    context.drawImage(doodler.img, doodler.x, doodler.y, doodler.width, doodler.height);

    // Draw doodler or arrow based on visibility
        if (doodler.y < 0) {
            // If doodler is above the screen, draw an arrow at the top
            const arrowX = doodler.x + doodler.width / 2 - 20;
            context.drawImage(arrowImg, arrowX, 10, 40, 40); // Arrow at the top
        } else if (doodler.y > boardHeight) {
            // If doodler is below the screen, draw an arrow at the bottom
            const arrowX = doodler.x + doodler.width / 2 - 20;
            context.drawImage(arrowImg, arrowX, boardHeight - 50, 40, 40); // Arrow at the bottom
        } else {
            // Draw the doodler normally
            context.drawImage(doodler.img, doodler.x, doodler.y, doodler.width, doodler.height);
        }


    // Update platforms
    updatePlatforms();

    // Display the score
    context.fillStyle = "white";
    context.font = "30px sans-serif";
    context.fillText(`Score: ${score}`, 5, 20);
}

function updatePlatforms() {
    platformArray.forEach((platform, index) => {
        if (platform.moving) {
            platform.x += platform.speed * platform.direction;
            if (platform.x <= 0 || platform.x + platform.width >= boardWidth) platform.direction *= -1;
        }

        if (velocityY < 0 && doodler.y < boardHeight * 3 / 4) {
            platform.y -= initialVelocityY * 0.5;
        }

        if (detectCollision(doodler, platform) && velocityY >= 0) {
            if (platform.hasSpring) {
                springSound.play();  // Play spring sound when the platform has a spring
                velocityY = springBoost; // Boost the velocity with spring effect
            } else {
                velocityY = initialVelocityY; // Normal jump velocity
            }
            score++; // Increment score
            jumpSound.play(); // Play jump sound for all jumps
        }

        if (platform.y >= boardHeight) platformArray.splice(index, 1);

        if (platform.img) {
            context.drawImage(platform.img, platform.x, platform.y, platform.width, platform.height);
        }

        if (platform.hasSpring) {
            const springX = platform.x + platform.width / 2 - springWidth / 2;
            const springY = platform.y - springHeight;
            context.drawImage(springImg, springX, springY, springWidth, springHeight);
        }
    });

    while (platformArray.length < 10) {
        newPlatform();
    }
}

function newPlatform() {
    const randomX = Math.random() * (boardWidth - platformWidth);
    const isMoving = Math.random() < 0.4;
    const hasSpring = Math.random() < 0.2;

    platformArray.push({
        img: platformImg,
        x: randomX,
        y: -platformHeight,
        width: platformWidth,
        height: platformHeight,
        moving: isMoving,
        speed: isMoving ? (Math.random() * 2 + 1) : 0,
        direction: Math.random() < 0.5 ? 1 : -1,
        hasSpring: hasSpring
    });
}

function detectCollision(doodler, platform) {
    return (
        doodler.x < platform.x + platform.width &&
        doodler.x + doodler.width > platform.x &&
        doodler.y + doodler.height < platform.y + platform.height &&
        doodler.y + doodler.height > platform.y
    );
}

function moveDoodler(e) {
    if (e.code === "ArrowRight" || e.code === "KeyD") {
        velocityX = 2;
        doodler.img = doodlerRightImg;
    } else if (e.code === "ArrowLeft" || e.code === "KeyA") {
        velocityX = -2;
        doodler.img = doodlerLeftImg;
    } else if (e.code === "Space" && gameOver && !delayActive) {
        delayActive = true;
        startCountdown();
    }
}

function startCountdown() {
    countdown = 3; // Reset countdown value
    countdownInterval = setInterval(function () {
        context.clearRect(0, 0, board.width, board.height); // Clear the canvas
        context.fillStyle = "black";
        context.font = "bolder 40px sans-serif";
        context.fillText(`Redirecting in ${countdown}...`, boardWidth / 4, boardHeight / 2);
        countdown--;

        if (countdown < 0) {
            clearInterval(countdownInterval);
            window.location.href = "../doodle-jump-master/StartP.html"; // Redirect to start page
        }
    }, 1000);
}

function placePlatforms() {
    platformArray = [];
    for (let i = 0; i < 10; i++) {
        const isMoving = Math.random() < 0.4;
        const hasSpring = Math.random() < 0.2;
        platformArray.push({
            img: platformImg,
            x: Math.random() * (boardWidth - platformWidth),
            y: boardHeight - i * 60 - 50,
            width: platformWidth,
            height: platformHeight,
            moving: isMoving,
            speed: isMoving ? (Math.random() * 2 + 1) : 0,
            direction: Math.random() < 0.5 ? 1 : -1,
            hasSpring: hasSpring
        });
    }
}
