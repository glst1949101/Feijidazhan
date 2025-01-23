const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 100;
        this.height = 100;
        this.image = new Image();
        this.image.src = 'player.png';
        this.lives = 3;
    }

    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

    move(direction) {
        switch (direction) {
            case 'left':
                if (this.x > 0) this.x -= 20;
                break;
            case 'right':
                if (this.x < canvas.width - this.width) this.x += 20;
                break;
            case 'up':
                if (this.y > 0) this.y -= 20;
                break;
            case 'down':
                if (this.y < canvas.height - this.height) this.y += 20;
                break;
        }
    }
}

class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 100;
        this.height = 100;
        this.image = new Image();
        this.image.src = 'enemy.png';
    }

    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

    move() {
        this.y += 4;
    }
}

class Bullet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 5;
        this.height = 10;
        this.color = 'white';
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    move() {
        this.y -= 10;
    }
}

const player = new Player(canvas.width / 2, canvas.height - 100);
const enemies = [];
const bullets = [];
let isShooting = false;
let shootCooldown = 5; // 修改: 将子弹发射冷却时间改为5帧
let keys = {}; // 新增: 记录按键状态

document.addEventListener('keydown', (e) => {
    keys[e.key] = true; // 新增: 更新按键状态
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false; // 新增: 更新按键状态
});

function shootBullet() {
    if (shootCooldown <= 0) { // 修改: 检查冷却时间
        bullets.push(new Bullet(player.x + player.width / 2 - 2.5, player.y));
        shootCooldown = 7; // 修改: 设置冷却时间为7帧
    }
}

function resetGame() {
    player.lives = 3;
    enemies.length = 0;
    bullets.length = 0;
    shootCooldown = 5;
    isGameOver = false; // 添加: 设置游戏结束标志为false
    gameLoop(); // 添加: 重新启动游戏循环

}

let isGameOver = false; // 添加: 游戏结束标志

function gameLoop() {
    if (isGameOver) return; // 添加: 如果游戏结束，直接返回

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    player.draw();
    enemies.forEach(enemy => enemy.draw());
    bullets.forEach(bullet => bullet.draw());

    if (player.lives > 0) {
        if (keys['ArrowLeft'] && player.x > 0) player.x -= 20;
        if (keys['ArrowRight'] && player.x < canvas.width - player.width) player.x += 20;
        if (keys['ArrowUp'] && player.y > 0) player.y -= 20;
        if (keys['ArrowDown'] && player.y < canvas.height - player.height) player.y += 20;

        if (keys[' ']) shootBullet();
    }

    // 修改: 增加敌机生成频率
    if (Math.random() < 0.09) {
        const x = Math.random() * (canvas.width - 50);
        enemies.push(new Enemy(x, 0));
    }

    enemies.forEach((enemy, i) => {
        enemy.move();
        if (enemy.y > canvas.height) enemies.splice(i, 1);
    });

    bullets.forEach((bullet, i) => {
        bullet.move();
        if (bullet.y < 0) bullets.splice(i, 1);
    });

    for (let i = 0; i < bullets.length; i++) {
        for (let j = 0; j < enemies.length; j++) {
            if (bullets[i].x < enemies[j].x + enemies[j].width &&
                bullets[i].x + bullets[i].width > enemies[j].x &&
                bullets[i].y < enemies[j].y + enemies[j].height &&
                bullets[i].y + bullets[i].height > enemies[j].y) {
                bullets.splice(i, 1);
                enemies.splice(j, 1);
                break;
            }
        }
    }

    for (let j = 0; j < enemies.length; j++) {
        if (player.x < enemies[j].x + enemies[j].width &&
            player.x + player.width > enemies[j].x &&
            player.y < enemies[j].y + enemies[j].height &&
            player.y + player.height > enemies[j].y) {
            player.lives--;
            enemies.splice(j, 1);
            if (player.lives <= 0) {
                ctx.fillStyle = 'red';
                ctx.font = '120px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2.5);

                // 添加重新开始按钮
                ctx.font = '60px Arial'; // 修改: 放大字体
                const buttonText = '重新开始';
                const textWidth = ctx.measureText(buttonText).width;
                const textHeight = 60; // 字体大小即为文字高度
                const padding = 20; // 设置内边距
                const buttonWidth = textWidth + 2 * padding;
                const buttonHeight = textHeight + 2 * padding;
                const buttonX = canvas.width / 2 - buttonWidth / 2;
                const buttonY = canvas.height / 2 + 100;

                ctx.strokeStyle = 'white'; // 添加: 设置边框颜色
                ctx.lineWidth = 3; // 修改: 设置边框宽度为3
                ctx.lineJoin = 'round'; // 添加: 设置边框倒圆效果
                ctx.lineCap = 'round'; // 添加: 设置边框倒圆效果

                function strokeRoundRect(x, y, width, height, radius) {
                    ctx.beginPath();
                    ctx.moveTo(x + radius, y);
                    ctx.lineTo(x + width - radius, y);
                    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
                    ctx.lineTo(x + width, y + height - radius);
                    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
                    ctx.lineTo(x + radius, y + height);
                    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
                    ctx.lineTo(x, y + radius);
                    ctx.quadraticCurveTo(x, y, x + radius, y);
                    ctx.closePath();
                    ctx.stroke();
                }
                strokeRoundRect(buttonX, buttonY, buttonWidth, buttonHeight, 10); // 修改: 使用strokeRoundRect绘制倒圆边框

                // 添加白色倒圆填充
                ctx.fillStyle = 'white';
                ctx.beginPath();
                ctx.moveTo(buttonX + 10, buttonY);
                ctx.lineTo(buttonX + buttonWidth - 10, buttonY);
                ctx.quadraticCurveTo(buttonX + buttonWidth, buttonY, buttonX + buttonWidth, buttonY + 10);
                ctx.lineTo(buttonX + buttonWidth, buttonY + buttonHeight - 10);
                ctx.quadraticCurveTo(buttonX + buttonWidth, buttonY + buttonHeight, buttonX + buttonWidth - 10, buttonY + buttonHeight);
                ctx.lineTo(buttonX + 10, buttonY + buttonHeight);
                ctx.quadraticCurveTo(buttonX, buttonY + buttonHeight, buttonX, buttonY + buttonHeight - 10);
                ctx.lineTo(buttonX, buttonY + 10);
                ctx.quadraticCurveTo(buttonX, buttonY, buttonX + 10, buttonY);
                ctx.closePath();
                ctx.fill();

                ctx.fillStyle = 'black';
                ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight); // 修改: 放大按钮并调整位置
                ctx.fillStyle = 'white';
                ctx.textBaseline = 'middle'; // 添加: 设置文本垂直居中
                ctx.fillText(buttonText, canvas.width / 2, buttonY + buttonHeight / 2); // 修改: 调整文字位置以垂直居中

                isGameOver = true; // 添加: 设置游戏结束标志为true
                canvas.addEventListener('click', restartGame); // 添加: 添加点击事件监听器

                // 添加CSS动画样式
                const style = document.createElement('style');
                style.innerHTML = `
                    @keyframes blink {
                        50% { opacity: 0.5; }
                    }
                    .blink {
                        animation: blink 1s infinite;
                    }
                `;
                document.head.appendChild(style);

                return;
            }
            break;
        }
    }

    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Lives: ${player.lives}`, 10, 20);

    shootCooldown--;
    if (shootCooldown < 0) shootCooldown = 0;

    requestAnimationFrame(gameLoop);
}

function restartGame(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (x > canvas.width / 2 - 200 && x < canvas.width / 2 + 200 && // 修改: 调整点击检测范围
        y > canvas.height / 2 + 100 && y < canvas.height / 2 + 200) { // 修改: 调整点击检测范围
        resetGame();
    }
}

gameLoop();