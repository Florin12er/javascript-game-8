/** @type {HTMLCanvasElement} */

window.addEventListener("load", () => {
  const canvas = document.getElementById("canvas1");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  class input {
    constructor() {
      this.keys = [];
      window.addEventListener("keydown", (e) => {
        if (
          (e.key === " " ||
            e.key === "ArrowDown" ||
            e.key === "ArrowUp" ||
            e.key === "ArrowLeft" ||
            e.key === "ArrowRight") &&
          this.keys.indexOf(e.key) === -1
        ) {
          this.keys.push(e.key);
        }
      });
      window.addEventListener("keyup", (e) => {
        if (
          (e.key === " " ||
            e.key === "ArrowDown" ||
            e.key === "ArrowUp" ||
            e.key === "ArrowLeft" ||
            e.key === "ArrowRight") &&
          this.keys.splice(this.keys.indexOf(e.key), 1)
        ) {
          this.keys.push(e.key);
        }
      });
    }
  }
  class Player {
    constructor(gameWidth, gameHeight) {
      this.gameWidth = gameWidth;
      this.gameHeight = gameHeight;
      this.width = 100;
      this.height = 100;
      this.x = 0;
      this.y = 0;
      this.image = new Image();
      this.spriteWidth = 200;
      this.spriteHeight = 200;
      this.frameX = 0;
      this.frameY = 0;
      this.speed = 1;

      this.image.src =
        "https://www.frankslaboratory.co.uk/downloads/93/player.png";
    }
    draw(context) {
      context.fillstyle = "white";
      context.drawImage(
        this.image,
        this.frameX,
        this.frameY,
        this.spriteWidth,
        this.spriteHeight,
        this.x,
        this.y,
        200,
        200,
      );
    }
    update() {
      this.x += this.speed;
    }
  }
  class Background {}
  class enemy {}
  function enemies() {}
  function displayStatus() {}

  const inputs = new input();
  const player = new Player(canvas.width, canvas.height);

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    player.draw(ctx);
    player.update();
    requestAnimationFrame(animate);
  }
  animate();
});

//timestamp: 5:01:16
