const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Stany gry: "MENU", "TUTORIAL", "FLYING", "LANDING", "FINISHED"
let gameState = "MENU";
let isFirstFlight = true;

let altitude = 0;
let speed = 0;
let fuel = 100;
let fuelSpeed = 0.8;
let currentStage = 1;
let totalStages = 4;
let credits = 0;
let moonPassengers = 0;

let fallingParts = [];
let dustParticles = [];
let tutorialText = "";

function startLaunch() {
    altitude = 0;
    speed = 100;
    fuel = 100;
    currentStage = 1;
    fallingParts = [];
    dustParticles = [];

    if (isFirstFlight) {
        gameState = "TUTORIAL";
        tutorialText = "STUKNIJ, aby wystrzelić!";
    } else {
        gameState = "FLYING";
        tutorialText = "";
    }
}

function handleTouch() {
    if (gameState === "MENU") {
        startLaunch();
    } else if (gameState === "TUTORIAL") {
        gameState = "FLYING";
        tutorialText = "STUKNIJ w zielonym polu!";
    } else if (gameState === "FLYING") {
        detachStage(canvas.width / 2, canvas.height - 150);
        
        if (fuel <= 20 && fuel > 0) {
            speed += 400;
            tutorialText = "PERFECT!";
        } else {
            speed += 150;
            tutorialText = "GOOD";
        }

        currentStage++;
        fuel = 100;

        if (currentStage > totalStages) {
            gameState = "LANDING";
            tutorialText = "STUKNIJ - lądowanie na Księżycu!";
        }
    } else if (gameState === "LANDING") {
        createDust(canvas.width / 2, canvas.height - 100);
        credits += 500 + (isFirstFlight ? 0 : 200);
        if (!isFirstFlight) moonPassengers += 3;
        isFirstFlight = false;
        gameState = "FINISHED";
        tutorialText = "LĄDOWANIE UDANE! Stuknij, by wrócić";
    } else if (gameState === "FINISHED") {
        gameState = "MENU";
    }
}

window.addEventListener("touchstart", (e) => { e.preventDefault(); handleTouch(); }, {passive: false});
window.addEventListener("mousedown", handleTouch);

function detachStage(x, y) {
    fallingParts.push({ x: x - 20, y: y, vx: -3, vy: -1 });
    fallingParts.push({ x: x + 10, y: y, vx: 3, vy: -1 });
}

function createDust(x, y) {
    for (let i = 0; i < 20; i++) {
        dustParticles.push({
            x: x, y: y,
            vx: (Math.random() - 0.5) * 8,
            vy: -Math.random() * 4,
            alpha: 1.0
        });
    }
}

// Rysowanie pasażera/astronautów w kodzie
function drawAstronaut(x, y, color, visorColor) {
    ctx.save();
    // Ciało
    ctx.fillStyle = color;
    ctx.fillRect(x - 8, y - 10, 16, 20);
    // Głowa
    ctx.beginPath();
    ctx.arc(x, y - 14, 8, 0, Math.PI * 2);
    ctx.fill();
    // Wizjer
    ctx.fillStyle = visorColor;
    ctx.beginPath();
    ctx.arc(x, y - 14, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function update() {
    if (gameState === "FLYING" || gameState === "TUTORIAL") {
        altitude += speed * 0.05;
        fuel -= fuelSpeed;

        if (fuel <= 0) {
            gameState = "FINISHED";
            tutorialText = "BOOM! Zbyt późno! Stuknij, by zrestartować";
        }
    }

    fallingParts.forEach((p) => { p.x += p.vx; p.y += p.vy; p.vy += 0.2; });
    dustParticles.forEach((p) => { p.x += p.vx; p.y += p.vy; p.alpha -= 0.03; });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let dark = Math.min(1, altitude / 2000);
    ctx.fillStyle = `rgb(${Math.floor(20 * (1-dark))}, ${Math.floor(20 * (1-dark))}, ${Math.floor(40 * (1-dark))})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (gameState === "FLYING" || gameState === "TUTORIAL" || gameState === "LANDING") {
        ctx.fillStyle = "#FFF"; ctx.font = "16px sans-serif"; ctx.textAlign = "left";
        ctx.fillText(`Prędkość: ${Math.floor(speed)} m/s`, 20, 40);
        ctx.fillText(`Wysokość: ${Math.floor(altitude)} m`, 20, 65);

        ctx.fillStyle = "#444"; ctx.fillRect(20, 80, 200, 15);
        ctx.fillStyle = "#00FFC8"; ctx.fillRect(20, 80, fuel * 2, 15);

        let rx = canvas.width / 2;
        let ry = canvas.height - 150;
        
        // Rakieta
        ctx.fillStyle = "#FFF";
        ctx.fillRect(rx - 15, ry, 30, 50);

        // Płomień
        ctx.fillStyle = "#FF9500";
        ctx.beginPath();
        ctx.moveTo(rx - 10, ry + 50);
        ctx.lineTo(rx, ry + 70 + Math.random() * 10);
        ctx.lineTo(rx + 10, ry + 50);
        ctx.fill();
    }

    ctx.fillStyle = "#888";
    fallingParts.forEach(p => ctx.fillRect(p.x, p.y, 10, 20));

    dustParticles.forEach(p => {
        if (p.alpha > 0) {
            ctx.fillStyle = `rgba(200, 200, 200, ${p.alpha})`;
            ctx.beginPath(); ctx.arc(p.x, p.y, 5, 0, Math.PI * 2); ctx.fill();
        }
    });

    ctx.fillStyle = "#FFD700"; ctx.font = "bold 20px sans-serif"; ctx.textAlign = "center";
    ctx.fillText(tutorialText, canvas.width / 2, canvas.height - 80);

    if (gameState === "MENU") {
        ctx.fillStyle = "#FFF"; 
        ctx.font = "bold 32px sans-serif";
        ctx.fillText("LUNARIS", canvas.width / 2, 120);
        
        ctx.font = "16px sans-serif";
        ctx.fillStyle = "#A0A0A0";
        ctx.fillText("FIRST STEPS TO LUNA", canvas.width / 2, 145);

        // Rysowanie załogi w menu
        drawAstronaut(canvas.width / 2 - 30, 200, "#FFFFFF", "#007AFF");
        drawAstronaut(canvas.width / 2, 200, "#F1C40F", "#2ECC71");
        drawAstronaut(canvas.width / 2 + 30, 200, "#E67E22", "#E74C3C");

        ctx.fillStyle = "#FFF";
        ctx.font = "18px sans-serif";
        ctx.fillText(`Kredyty: ${credits} $`, canvas.width / 2, 260);
        ctx.fillText(`Ludzie na Księżycu: ${moonPassengers}`, canvas.width / 2, 290);
        
        ctx.fillStyle = "#00FFC8";
        ctx.fillText("Dotknij ekranu, aby rozpocząć!", canvas.width / 2, canvas.height / 2 + 100);
    }
}

function loop() { update(); draw(); requestAnimationFrame(loop); }
loop();
