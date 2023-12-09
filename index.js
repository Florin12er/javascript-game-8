/** @type {HTMLCanvasElement} */

window.addEventListener("load", () => {
  const canvas = document.getElementById("canvas1");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = 700;
  let enemies = [];
  let lastTime = 0;
  let enemyTimer = 0;
  let enemyInterval = 1000;
  let randomEnemyInterval = Math.random() * 800 + 300;
  let score = 0;
  let gameOver = false;

  class input {
    constructor() {
      this.keys = [];
      window.addEventListener("keydown", (e) => {
        if (
          (e.key === " " ||
            e.key === "s" ||
            e.key === "w" ||
            e.key === "a" ||
            e.key === "d") &&
          this.keys.indexOf(e.key) === -1
        ) {
          this.keys.push(e.key);
        }
      });
      window.addEventListener("keyup", (e) => {
        if (
          e.key === " " ||
          e.key === "s" ||
          e.key === "w" ||
          e.key === "a" ||
          e.key === "d"
        ) {
          this.keys.splice(this.keys.indexOf(e.key), 1);
        }
      });
    }
  }
  class Player {
    constructor(gameWidth, gameHeight) {
      this.gameWidth = gameWidth;
      this.gameHeight = gameHeight;
      this.width = 200;
      this.height = 200;
      this.x = 0;
      this.y = 0;
      this.image = new Image();
      this.spriteWidth = 200;
      this.spriteHeight = 200;
      this.frameX = 0;
      this.frameY = 0;
      this.speed = 0;
      this.vy = 0;
      this.gravity = 1;
      this.maxFrame = 8;
      this.fps = 20;
      this.frameTimer = 0;
      this.frameInterval = 1000 / this.fps;

      this.image.src =
        "https://www.frankslaboratory.co.uk/downloads/93/player.png";
    }
    draw(context) {
      context.drawImage(
        this.image,
        this.frameX * this.width,
        this.frameY * this.height,
        this.spriteWidth,
        this.spriteHeight,
        this.x,
        this.y,
        200,
        200,
      );
    }
    update(inputs, deltaTime, enemies) {
      enemies.forEach((enemy) => {
        const dx = enemy.x + enemy.width / 2 - (this.x + this.width / 2);
        const dy = enemy.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < enemy.width / 2 + this.width / 2) {
          gameOver = true;
        }
      });
      if (this.frameTimer > this.frameInterval) {
        if (this.frameX >= this.maxFrame) this.frameX = 0;
        else this.frameX++;
        this.frameTimer = 0;
      } else {
        this.frameTimer += deltaTime;
      }
      this.x += this.speed;
      if (inputs.keys.indexOf("d") > -1) this.speed = 5;
      else if (inputs.keys.indexOf("a") > -1) this.speed = -5;
      else if (inputs.keys.indexOf(" ") > -1 && this.onGround()) this.vy -= 34;
      else this.speed = 0;
      if (this.x < 0) this.x = 0;
      else if (this.x > this.gameWidth - this.width)
        this.x = this.gameWidth - this.width;
      this.y += this.vy;
      if (!this.onGround()) {
        this.maxFrame = 5;
        this.vy += this.gravity;
        this.frameY = 1;
      } else {
        this.maxFrame = 8;
        this.vy = 0;
        this.frameY = 0;
      }
      if (this.y > this.gameHeight - this.height)
        this.y = this.gameHeight - this.height;
    }
    onGround() {
      return this.y >= this.gameHeight - this.height;
    }
  }
  class Background {
    constructor(gameWidth, gameHeight) {
      this.gameWidth = gameWidth;
      this.gameHeight = gameHeight;
      this.image = document.getElementById("bkg");
      this.x = 0;
      this.y = 0;
      this.width = 2400;
      this.height = 720;
      this.speed = 3;
    }
    draw(context) {
      context.drawImage(this.image, this.x, this.y, this.width, this.height);

      context.drawImage(
        this.image,
        this.x + this.width - this.speed,
        this.y,
        this.width,
        this.height,
      );
    }
    update() {
      this.x -= this.speed;
      if (this.x < 0 - this.width) this.x = 0;
    }
  }
  class enemy {
    constructor(gameWidth, gameHeight) {
      this.gameWidth = gameWidth;
      this.gameHeight = gameHeight;
      this.image = document.getElementById("worm");
      this.width = 160;
      this.height = 119;
      this.x = this.gameWidth - this.width;
      this.y = this.gameHeight - this.height;
      this.FrameX = 0;
      this.speed = 8;
      this.maxFrame = 5;
      this.fps = 20;
      this.frameTimer = 0;
      this.frameInterval = 500 / this.fps;
      this.markedFordelation = false;
    }
    draw(context) {
      context.drawImage(
        this.image,
        this.FrameX * this.width,
        0,
        this.width,
        this.height,
        this.x,
        this.y,
        this.width,
        this.height,
      );
    }
    update(deltaTime) {
      if (this.frameTimer > this.frameInterval) {
        if (this.FrameX >= this.maxFrame) this.FrameX = 0;
        else this.FrameX++;
        this.frameTimer = 0;
      } else {
        this.frameTimer += deltaTime;
      }
      this.x -= this.speed;
      if (this.x < 0 - this.width) {
        this.markedFordelation = true;
        score++;
      }
    }
  }
  function handleEnemies(deltaTime) {
    if (enemyTimer > enemyInterval + randomEnemyInterval) {
      enemies.push(new enemy(canvas.width, canvas.height));
      enemyTimer = 0;
    } else {
      enemyTimer += deltaTime;
    }
    enemies.forEach((enemy) => {
      enemy.draw(ctx);
      enemy.update(deltaTime);
    });
    enemies = enemies.filter((enemy) => !enemy.markedFordelation);
  }
  function displayStatus(ctx) {
    if (!gameOver) {
      ctx.fillStyle = "black";
      ctx.font = "40px helvetica";
      ctx.fillText("Score: " + score, 20, 50);
    }
    if (gameOver) {
      ctx.textAlign = "center";
      ctx.fillStyle = "white";
      ctx.font = "40px helvetica";
      ctx.fillText("Game Over", canvas.width / 2, 200);
      ctx.fillStyle = "red";
      ctx.fillText("Game Over", canvas.width / 2, 202);
      ctx.fillStyle = "white";
      ctx.fillText("Player Score: " + score, canvas.width / 2, 260);
      ctx.fillStyle = "red";
      ctx.fillText("Player Score: " + score, canvas.width / 2, 262);
      ctx.fillStyle = "white";
      ctx.fillText("Press space to restart", canvas.width / 2, 310);
      ctx.fillStyle = "red";
      ctx.fillText("Press space to restart", canvas.width / 2, 312);
    }
  }

  const inputs = new input();
  const player = new Player(canvas.width, canvas.height);
  const background = new Background(canvas.width, canvas.height);

  function animate(timeStamp) {
    const deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    background.draw(ctx);
    background.update();
    player.draw(ctx);
    player.update(inputs, deltaTime, enemies);
    handleEnemies(deltaTime);
    displayStatus(ctx);
    if (!gameOver) requestAnimationFrame(animate);
  }
  animate(0);
});
