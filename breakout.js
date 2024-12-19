// Game objects are global variables so that many functions can access them
let player, ball, violetBricks, yellowBricks, redBricks, cursors;
// Variable to determine if we started playing
let gameStarted = false;
// Add global text objects
let openingText, gameOverText, playerWonText;

// User and score management
let username = localStorage.getItem('username') || '';
let highScore = JSON.parse(localStorage.getItem('highScores')) || {};
let currentScore = 0;

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 800,
  height: 640,
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: {
    preload,
    create,
    update
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: false
    }
  }
};

const game = new Phaser.Game(config);

function preload() {
  this.load.image('ball', 'assets/images/ball_32_32.png');
  this.load.image('paddle', 'assets/images/paddle_128_32.png');
  this.load.image('brick1', 'assets/images/brick1_64_32.png');
  this.load.image('brick2', 'assets/images/brick2_64_32.png');
  this.load.image('brick3', 'assets/images/brick3_64_32.png');
}

function create() {
  // Create UI elements for login
  let loginBox = this.add.dom(400, 50).createInput('text', 'Enter Username:');
  let loginButton = this.add.dom(400, 90).createButton('Login');

  loginButton.on('click', () => {
    username = loginBox.getChild(0).value;
    if (username) {
      localStorage.setItem("username", username);
      loginBox.setVisible(false);
      loginButton.setVisible(false);
      startGame();
    }
  });

  function startGame() {
    // Initialize the game objects here
    player = this.physics.add.sprite(400, 600, 'paddle');
    ball = this.physics.add.sprite(400, 565, 'ball');
    violetBricks = this.physics.add.group({
      key: 'brick1',
      repeat: 9,
      immovable: true,
      setXY: { x: 80, y: 140, stepX: 70 }
    });
    yellowBricks = this.physics.add.group({
      key: 'brick2',
      repeat: 9,
      immovable: true,
      setXY: { x: 80, y: 90, stepX: 70 }
    });
    redBricks = this.physics.add.group({
      key: 'brick3',
      repeat: 9,
      immovable: true,
      setXY: { x: 80, y: 40, stepX: 70 }
    });
    cursors = this.input.keyboard.createCursorKeys();

    player.setCollideWorldBounds(true);
    ball.setCollideWorldBounds(true);
    ball.setBounce(1, 1);
    this.physics.world.checkCollision.down = false;

    this.physics.add.collider(ball, violetBricks, hitBrick, null, this);
    this.physics.add.collider(ball, yellowBricks, hitBrick, null, this);
    this.physics.add.collider(ball, redBricks, hitBrick, null, this);
    player.setImmovable(true);
    this.physics.add.collider(ball, player, hitPlayer, null, this);

    openingText = this.add.text(
      this.physics.world.bounds.width / 2,
      this.physics.world.bounds.height / 2,
      'Press SPACE to Start',
      { fontFamily: 'Monaco, Courier, monospace', fontSize: '50px', fill: '#fff' },
    ).setOrigin(0.5);

    gameOverText = this.add.text(
      this.physics.world.bounds.width / 2,
      this.physics.world.bounds.height / 2,
      'Game Over',
      { fontFamily: 'Monaco, Courier, monospace', fontSize: '50px', fill: '#fff' },
    ).setVisible(false).setOrigin(0.5);

    playerWonText = this.add.text(
      this.physics.world.bounds.width / 2,
      this.physics.world.bounds.height / 2,
      'You won!',
      { fontFamily: 'Monaco, Courier, monospace', fontSize: '50px', fill: '#fff' },
    ).setVisible(false).setOrigin(0.5);

    // Display high score
    this.add.text(10, 10, `High Score: ${getHighScore()}`, {
      fontFamily: 'Arial',
      fontSize: '24px',
      fill: '#fff'
    });
  }

  function getHighScore() {
    return Math.max(...Object.values(highScore), 0);
  }

  function updateHighScore(username, score) {
    highScore[username] = score;
    localStorage.setItem('highScores', JSON.stringify(highScore));
  }

  function isGameOver(world) {
    return ball.body.y > world.bounds.height;
  }

  function isWon() {
    return violetBricks.countActive() + yellowBricks.countActive() + redBricks.countActive() == 0;
  }

  function hitBrick(ball, brick) {
    brick.disableBody(true, true);
    currentScore++;
    updateHighScore(username, currentScore);
  }

  function hitPlayer(ball, player) {
    ball.setVelocityY(ball.body.velocity.y - 5);
    let newXVelocity = Math.abs(ball.body.velocity.x) + 5;
    if (ball.x < player.x) {
      ball.setVelocityX(-newXVelocity);
    } else {
      ball.setVelocityX(newXVelocity);
    }
  }
}

function update() {
  if (!gameStarted) {
    if (cursors.space.isDown && username) {
      gameStarted = true;
      ball.setVelocityY(-200);
      openingText.setVisible(false);
    }
  } else {
    if (isGameOver(this.physics.world)) {
      gameOverText.setVisible(true);
      ball.disableBody(true, true);
    } else if (isWon()) {
      playerWonText.setVisible(true);
      ball.disableBody(true, true);
    } else {
      player.body.setVelocityX(0);
      if (cursors.left.isDown) {
        player.body.setVelocityX(-350);
      } else if (cursors.right.isDown) {
        player.body.setVelocityX(350);
      }
      if (!gameStarted) {
        ball.setX(player.x);
      }
    }
  }
}