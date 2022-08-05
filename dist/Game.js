function preload() {
    this.load.image('ship', 'https://th.bing.com/th/id/R.c43c32ea615dee2185558f0c0a955dca?rik=2nnfvxnu3ZG2IQ&riu=http%3a%2f%2fgetdrawings.com%2ffree-icon-bw%2fspace-invaders-icon-14.png&ehk=zBsUhS2idWuFgNc2fWNGq%2frnPqdtXYVgMoh7dXoe9oo%3d&risl=&pid=ImgRaw&r=0');
    this.load.image('platform', 'https://content.codecademy.com/courses/learn-phaser/physics/platform.png');
    this.load.image('codey', 'https://th.bing.com/th/id/R.9daabc296fd49e19e30f5f9f833b4e4e?rik=62wLJr3P34GDPg&riu=http%3a%2f%2fpixelartmaker.com%2fart%2f2e83b15a78c7acc.png&ehk=u975j6%2bxPu7xH8GMaPp919QtAM0eRlPIGSoM3EXjHYs%3d&risl=&pid=ImgRaw&r=0');
    this.load.image('bugPellet', 'https://content.codecademy.com/courses/learn-phaser/Bug%20Invaders/bugPellet.png');
    this.load.image('bugRepellent', 'https://content.codecademy.com/courses/learn-phaser/Bug%20Invaders/bugRepellent.png');
    this.load.image('background',"https://images.designtrends.com/wp-content/uploads/2015/12/10062601/Space-Backgrounds4.jpg");
    //this.load.audio('song',"assets/8bit.mp3")
  }
  
  function sortedEnemies(){
    const orderedByXCoord = gameState.enemies.getChildren().sort((a, b) => a.x - b.x);
    return orderedByXCoord;
  }
  function numOfTotalEnemies() {
      const totalEnemies = gameState.enemies.getChildren().length;
    return totalEnemies;
  }
  
  const gameState = {};
  var won = 0;

  function create() {
      //this.sound.add('song');
      game.input.mouse.capture = true;
      this.add.image(440,300,'background');
      gameState.active = true;
      this.input.on('pointerdown', () => {
          if (gameState.active === false) {
              this.scene.restart();
          }
      })
  
      const platforms = this.physics.add.staticGroup();
      platforms.create(225, 490, 'platform').setScale(1, .3).refreshBody();
  
      gameState.scoreText = this.add.text(100, 482, `Ships Left: 24, Levels Won: ${won}`, { fontSize: '15px', fill: '#000000' });
  
      gameState.player = this.physics.add.sprite(225, 450, 'codey').setScale(.05);
  
      gameState.player.setCollideWorldBounds(true);
      this.physics.add.collider(gameState.player, platforms);
      
      gameState.cursors = this.input.keyboard.createCursorKeys();
  
      gameState.enemies = this.physics.add.group();
    
    for (let yVal = 1; yVal < 4 ; yVal++){
      for (let xVal = 1; xVal < 9; xVal++){
        gameState.enemies.create(50 * xVal, 50 * yVal, 'ship')  .setScale(.05).setGravityY(-200)
      }
    }
    const pellets = this.physics.add.group();
    function genPellet(){
      const randomBug = Phaser.Utils.Array.GetRandom(gameState.enemies.getChildren())
      pellets.create(randomBug.x, randomBug.y, 'bugPellet')
    }
    gameState.pelletsLoop = this.time.addEvent(
      {
        delay: 300,
      callback: genPellet,
      callbackScope: this,
      loop: true,
      }) 
    this.physics.add.collider(pellets, platforms, (pellet) => 
    {
      pellet.destroy();
    });
    this.physics.add.collider(pellets, gameState.player, () =>
    {
      gameState.active = false;
      gameState.pelletsLoop.destroy();
      this.physics.pause();
      won = 0
      this.add.text(100, 200, 'Game Over, click to restart', { fontSize: '15px', fill: '#FFFFFF' });
    });
    gameState.bugRepellent = this.physics.add.group();
    this.physics.add.collider(gameState.enemies, gameState.bugRepellent, (bug,repellent) => {
      bug.destroy();
      repellent.destroy();
      gameState.scoreText.setText(`Ships Left: ${numOfTotalEnemies()}, Levels Won: ${won}`)
    })
    gameState.enemyVelocity = 1;
    this.physics.add.collider(gameState.enemies, gameState.player, () => {
      gameState.active = false;
      gameState.enemyVelocity = 1;
      this.physics.pause();
      this.add.text(100, 200, 'Game Over, click to restart', { fontSize: '15px', fill: '#FFFFFF' });
    });
    this.physics.add.collider(gameState.enemies,platforms, () => {
      gameState.active = false;
      gameState.enemyVelocity = 1;
      this.physics.pause();
      this.add.text(100, 200, 'Game Over Click to restart', { fontSize: '15px', fill: '#000' });
    });
  }
  
  function update() {
      if (gameState.active) {
          if (gameState.cursors.left.isDown) {
              gameState.player.setVelocityX(-160);
          } else if (gameState.cursors.right.isDown) {
              gameState.player.setVelocityX(160);
          } else {
              gameState.player.setVelocityX(0);
          }
  
          if (Phaser.Input.Keyboard.JustDown(gameState.cursors.space)) {
              gameState.bugRepellent.create(gameState.player.x, gameState.player.y, 'bugRepellent').setGravityY(-400)
          }
  
      if (numOfTotalEnemies() === 0){
        won += 1
        this.physics.pause()
        gameState.active = false;
        this.scene.restart()
       } else {
        gameState.enemies.getChildren().forEach(bug => {
    bug.x += gameState.enemyVelocity;
      })
      gameState.leftMostBug = sortedEnemies()[0]
      gameState.rightMostBug = sortedEnemies()[sortedEnemies().length - 1]
      if (gameState.leftMostBug.x < 10 || gameState.rightMostBug.x > 440) {
    gameState.enemyVelocity *= -1
    gameState.enemies.getChildren().forEach(enemy => {
      enemy.y += 10
    })
        }
      } 
    }
  }
  
  const config = {
      type: Phaser.AUTO,
      width: 440,
      height: 500,
      physics: {
          default: 'arcade',
          arcade: {
              gravity: { y: 200 },
              enableBody: true,
          }
      },
      scene: {
        preload: preload,
        create: create,
        update: update
    }
  };
  
  
  const game = new Phaser.Game(config);