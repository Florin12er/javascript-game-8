/** @type {HTMLCanvasElement} */

window.addEventListener("load", () => {
  const canvas = document.getElementById("canvas1");
  const ctx = canvas.getContext("2d");
  canvas.width = 1800;
  canvas.height = 720;
  let enemies = [];
  let lastTime = 0;
  let enemyTimer = 0;
  let enemyInterval = 1000;
  let randomEnemyInterval = Math.random() * 800 + 300;
  let score = 0;
  let gameOver = false;
  const fullScreen = document.getElementById("fullscreen");

  class input {
    constructor() {
      this.keys = [];
      this.touches = "";
      this.touchTreshold = 30;
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
        } else if (e.key === "Enter" && gameOver) restartGame();
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
      window.addEventListener("touchstart", (e) => {
        this.touches = e.changedTouches[0].pageY;
      });
      window.addEventListener("touchend", (e) => {
        this.keys.splice(this.keys.indexOf("swipe up"), 1);
        this.keys.splice(this.keys.indexOf("swipe down"), 1);
      });
      window.addEventListener("touchmove", (e) => {
        const swipeDistance = e.changedTouches[0].pageY - this.touches;
        if (
          swipeDistance < -this.touchTreshold &&
          this.keys.indexOf("swipe up") === -1
        )
          this.keys.push("swipe up");
        else if (
          swipeDistance > this.touchTreshold &&
          this.keys.indexOf("swipe down") === -1
        )
          this.keys.push("swipe down");
        if (gameOver) restartGame();
      });
    }
  }
  class Player {
    constructor(gameWidth, gameHeight) {
      this.gameWidth = gameWidth;
      this.gameHeight = gameHeight;
      this.width = 200;
      this.height = 200;
      this.x = 100;
      this.y = this.gameHeight - this.height;
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
    restart() {
      this.x = 100;
      this.y = this.gameHeight - this.height;
      this.frameY = 0;
      this.maxFrame = 8;
    }
    update(inputs, deltaTime, enemies) {
      enemies.forEach((enemy) => {
        const dx = enemy.x + enemy.width / 2 - 20 - (this.x + this.width / 2);
        const dy = enemy.y + enemy.height / 2 - (this.y + this.height / 2 + 20);
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < enemy.width / 3 + this.width / 3) {
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
      else if (
        (inputs.keys.indexOf(" ") > -1 ||
          inputs.keys.indexOf("swipe up") > -1) &&
        this.onGround()
      ) {
        this.vy -= 34;
      } else this.speed = 0;
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
  function toggleFullScreen() {
    if (!document.fullscreenElement) {
      canvas.requestFullscreen().catch((error) => {
        alert(`Error, can't enable fullscreen: ${error.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  }
  fullScreen.addEventListener("click", toggleFullScreen);
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
    restart() {
      this.x = 0;
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
      ctx.textAlign = "left";
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
      ctx.fillText(
        "Press 'Enter' to restart or 'swipe down'",
        canvas.width / 2,
        310,
      );
      ctx.fillStyle = "red";
      ctx.fillText(
        "Press 'Enter' to restart or 'swipe down'",
        canvas.width / 2,
        312,
      );
    }
  }
  function restartGame() {
    player.restart();
    background.restart();
    enemies = [];
    gameOver = false;
    score = 0;
    animate(0);
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
