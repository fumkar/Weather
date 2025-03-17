const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Canvas boyutları
canvas.width = 800;
canvas.height = 600;

// Sabit değişkenler
const goalWidth = 300;
const goalHeight = 150;
const goalX = (canvas.width - goalWidth) / 2;

// Oyun değişkenleri
const goalkeeperImage = new Image();
goalkeeperImage.src = './rangers.png';

const goalkeeper = {
    x: canvas.width / 2 - 60,
    y: canvas.height / 4 - 40,
    width: 120,
    height: 130,
    speed: 8
};

const ball = {
    x: canvas.width / 2,
    y: canvas.height - 150,
    radius: 10,
    speed: 18,
    dx: 0,
    dy: 0,
    shooting: false,
    arrowAngle: -70,
    arrowRotationSpeed: 1.2
};

// Oyuncu resmi
const shooterImage = new Image();
shooterImage.src = './yousef.png';

const shooter = {
    x: canvas.width / 2 - 40,
    y: canvas.height - 160,
    width: 80,
    height: 140,
    speed: 5
};

// Skor
let goals = 0;
let saves = 0;

// Tuş kontrolleri
const keys = {
    left: false,
    right: false,
    a: false,
    d: false,
    space: false
};

// Event Listeners
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') keys.left = true;
    if (e.key === 'ArrowRight') keys.right = true;
    if (e.key === 'a') keys.a = true;
    if (e.key === 'd') keys.d = true;
    if (e.key === ' ') keys.space = true;
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') keys.left = false;
    if (e.key === 'ArrowRight') keys.right = false;
    if (e.key === 'a') keys.a = false;
    if (e.key === 'd') keys.d = false;
    if (e.key === ' ') keys.space = false;
});

// Çizim fonksiyonları
function drawGoal() {
    ctx.fillStyle = '#ffffff';
    
    // Kale direkleri
    ctx.fillRect(goalX, 0, 10, goalHeight);
    ctx.fillRect(goalX, 0, goalWidth, 10);
    ctx.fillRect(goalX + goalWidth - 10, 0, 10, goalHeight);
    
    // Kale ağı
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    drawGoalNet();
}

function drawGoalNet() {
    for(let x = goalX; x <= goalX + goalWidth; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, goalHeight);
        ctx.stroke();
    }
    for(let y = 0; y <= goalHeight; y += 20) {
        ctx.beginPath();
        ctx.moveTo(goalX, y);
        ctx.lineTo(goalX + goalWidth, y);
        ctx.stroke();
    }
}

function drawGoalkeeper() {
    if (goalkeeperImage.complete) {
        ctx.save();
        ctx.drawImage(
            goalkeeperImage,
            0, 0,
            goalkeeperImage.width, goalkeeperImage.height,
            goalkeeper.x, goalkeeper.y,
            goalkeeper.width, goalkeeper.height
        );
        ctx.restore();
    } else {
        // Yedek çizim
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(goalkeeper.x, goalkeeper.y, goalkeeper.width, goalkeeper.height);
    }
}

function drawBall() {
    // Top
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.closePath();

    // Ok
    if (!ball.shooting) {
        ctx.save();
        ctx.translate(ball.x, ball.y - ball.radius - 15);
        ctx.rotate(ball.arrowAngle * Math.PI / 180);
        
        // Ok gövdesi
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -20);
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Ok ucu
        ctx.beginPath();
        ctx.moveTo(-5, -15);
        ctx.lineTo(0, -20);
        ctx.lineTo(5, -15);
        ctx.fillStyle = '#ffff00';
        ctx.fill();
        
        ctx.restore();
    }
}

function drawShooter() {
    if (shooterImage.complete) {
        ctx.save();
        ctx.drawImage(
            shooterImage,
            0, 0,
            shooterImage.width, shooterImage.height * 0.8,
            shooter.x, shooter.y,
            shooter.width, shooter.height
        );
        ctx.restore();
    } else {
        // Resim yüklenene kadar eski çizimi kullan
        ctx.fillStyle = '#3498db';
        ctx.fillRect(shooter.x, shooter.y, shooter.width, shooter.height);
    }
}

// Oyun mantığı
function update() {
    // Kaleci hareketi
    if (keys.a && goalkeeper.x > goalX) {
        goalkeeper.x -= goalkeeper.speed;
    }
    if (keys.d && goalkeeper.x < goalX + goalWidth - goalkeeper.width) {
        goalkeeper.x += goalkeeper.speed;
    }

    // Ok sürekli dönme hareketi
    if (!ball.shooting) {
        // Ok -70 ile +70 derece arasında dönüyor
        ball.arrowAngle = -70 + (Date.now() / 15) % 140;

        // Şutör sabit pozisyonda
        shooter.x = canvas.width / 2 - shooter.width / 2;
        ball.x = shooter.x + shooter.width / 2;
    }

    // Şut
    if (keys.space && !ball.shooting) {
        ball.shooting = true;
        
        // Ok açısına göre hız bileşenlerini hesapla
        const angleRad = ball.arrowAngle * Math.PI / 180;
        const power = 1.5;
        ball.dy = -ball.speed * power;
        ball.dx = ball.speed * Math.sin(angleRad) * power;
    }

    // Top hareketi
    if (ball.shooting) {
        ball.x += ball.dx;
        ball.y += ball.dy;

        // Kaleci ile çarpışma kontrolü
        if (ball.y <= goalkeeper.y + goalkeeper.height &&
            ball.y + ball.radius >= goalkeeper.y &&
            ball.x + ball.radius >= goalkeeper.x &&
            ball.x - ball.radius <= goalkeeper.x + goalkeeper.width) {
            resetBall();
            saves++;
            document.getElementById('saveCount').textContent = saves;
        }

        // Gol kontrolü
        if (ball.y <= goalHeight) {
            if (ball.x >= goalX && ball.x <= goalX + goalWidth) {
                goals++;
                document.getElementById('goalCount').textContent = goals;
            }
            resetBall();
        }

        // Yan duvarlardan sekme
        if (ball.x <= 0 || ball.x >= canvas.width) {
            ball.dx = -ball.dx * 0.7;
        }
    }
}

function resetBall() {
    ball.shooting = false;
    ball.y = canvas.height - 150;
    ball.x = shooter.x + shooter.width / 2;
    ball.dx = 0;
    ball.dy = 0;
    ball.arrowAngle = -70;
}

// Ana oyun döngüsü
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawGoal();
    drawGoalkeeper();
    drawBall();
    drawShooter();
    
    update();
    
    requestAnimationFrame(gameLoop);
}

gameLoop();

// Resim yükleme hatalarını kontrol etmek için
goalkeeperImage.onerror = function() {
    console.error('Kaleci resmi yüklenemedi');
};

shooterImage.onerror = function() {
    console.error('Futbolcu resmi yüklenemedi');
}; 
