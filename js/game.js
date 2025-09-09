// Main Game Class

class Game {
    constructor() {
        // Canvas and rendering
        this.canvas = document.getElementById('gameCanvas');
        this.renderer = new Renderer(this.canvas);
        
        // Game state
        this.state = 'menu'; // menu, playing, paused, gameover, waveComplete
        this.lastTime = 0;
        this.deltaTime = 0;
        this.frameRate = 60;
        this.frameTime = 1000 / this.frameRate;
        
        // Game entities
        this.cities = [];
        this.bases = [];
        this.playerMissiles = [];
        this.enemyMissiles = [];
        this.explosions = [];
        this.crosshair = new Crosshair();
        
        // Managers
        this.ui = new UIManager();
        this.physics = new Physics();
        this.collisionHandler = new CollisionHandler(this);
        this.highScoreManager = new HighScoreManager();
        this.scoreManager = new ScoreManager();
        this.waveManager = new WaveManager(this);
        this.effectsManager = new EffectsManager(this.renderer);
        
        // Input
        this.input = new InputManager(this.canvas, this);
        
        // Game variables
        this.currentWave = 0;
        this.waveTransition = 0;
        this.waveTransitionDuration = 3000;
        this.waveCompleteTime = 0;
        this.perfectWave = false;
        this.gameOver = false;
        this.warning = null;
        
        // Initialize
        this.init();
    }
    
    init() {
        // Initialize physics
        this.physics.initSpatialGrid(this.renderer.width, this.renderer.height);
        
        // Initialize audio
        audioManager.init();
        
        // Show start screen
        this.ui.showScreen('start');
        this.ui.hideHUD();
        
        // Update high score display
        this.ui.updateHighScore(this.highScoreManager.getHighScore());
        
        // Start game loop
        this.gameLoop();
    }
    
    initGameEntities() {
        // Clear existing entities
        this.cities = [];
        this.bases = [];
        this.playerMissiles = [];
        this.enemyMissiles = [];
        this.explosions = [];
        
        const groundY = this.renderer.height - 50;
        
        // Create 6 cities
        const cityPositions = [150, 250, 350, 550, 650, 750];
        cityPositions.forEach((x, index) => {
            this.cities.push(new City(x, groundY, index));
        });
        
        // Create 3 missile bases
        const basePositions = [75, 450, 825];
        basePositions.forEach((x, index) => {
            this.bases.push(new MissileBase(x, groundY, index));
        });
    }
    
    startGame() {
        // Reset game state
        this.state = 'playing';
        this.currentWave = 0;
        this.gameOver = false;
        this.warning = null;
        
        // Reset score
        this.scoreManager.reset();
        
        // Initialize entities
        this.initGameEntities();
        
        // Update UI
        this.ui.hideAllScreens();
        this.ui.showHUD();
        this.ui.updateScore(0);
        this.ui.updateWave(1);
        this.ui.updateHighScore(this.highScoreManager.getHighScore());
        
        // Update ammo displays
        this.bases.forEach((base, index) => {
            this.ui.updateAmmo(index, base.ammo, base.maxAmmo, base.destroyed);
        });
        
        // Start first wave
        this.startNextWave();
        
        // Start ambient sounds
        audioManager.startRadarPing();
        
        // Enable input
        this.input.enable();
    }
    
    startNextWave() {
        this.currentWave++;
        this.waveTransition = 1.0;
        this.waveCompleteTime = 0;
        this.perfectWave = true;
        
        // Reload bases
        this.bases.forEach(base => {
            if (!base.destroyed) {
                base.reload();
                this.ui.updateAmmo(base.index, base.ammo, base.maxAmmo, base.destroyed);
            }
        });
        
        // Clear any remaining missiles
        this.playerMissiles = [];
        this.enemyMissiles = [];
        
        // Update UI
        this.ui.updateWave(this.currentWave);
        
        // Start wave after transition
        setTimeout(() => {
            this.waveManager.startWave(this.currentWave);
        }, this.waveTransitionDuration);
        
        audioManager.play('waveComplete');
    }
    
    fireMissile(targetX, targetY) {
        // Find nearest base with ammo
        let nearestBase = null;
        let minDistance = Infinity;
        
        for (const base of this.bases) {
            if (base.canFire()) {
                const distance = Math.abs(base.x - targetX);
                if (distance < minDistance) {
                    minDistance = distance;
                    nearestBase = base;
                }
            }
        }
        
        if (nearestBase) {
            this.fireMissileFromBase(nearestBase.index, targetX, targetY);
        }
    }
    
    fireMissileFromBase(baseIndex, targetX, targetY) {
        if (baseIndex < 0 || baseIndex >= this.bases.length) return;
        
        const base = this.bases[baseIndex];
        if (base.fire()) {
            // Create player missile
            const missile = new PlayerMissile(base.x, base.y - base.height, targetX, targetY);
            this.playerMissiles.push(missile);
            
            // Update UI
            this.ui.updateAmmo(baseIndex, base.ammo, base.maxAmmo, base.destroyed);
            
            // Play sound
            audioManager.play('launch');
            
            // Check for low ammo warning
            const totalAmmo = this.bases.reduce((sum, b) => sum + (b.destroyed ? 0 : b.ammo), 0);
            if (totalAmmo <= 5 && totalAmmo > 0) {
                this.warning = 'LOW AMMO!';
                audioManager.play('warning');
                setTimeout(() => {
                    this.warning = null;
                }, 2000);
            }
        }
    }
    
    createExplosion(x, y, radius = 30, color = '#ffff00') {
        const explosion = new Explosion(x, y, radius, color);
        this.explosions.push(explosion);
        return explosion;
    }
    
    pause() {
        if (this.state === 'playing') {
            this.state = 'paused';
            this.ui.showScreen('pause');
            this.input.disable();
            audioManager.play('pause');
            audioManager.stopRadarPing();
        }
    }
    
    resume() {
        if (this.state === 'paused') {
            this.state = 'playing';
            this.ui.hideAllScreens();
            this.input.enable();
            audioManager.play('pause');
            audioManager.startRadarPing();
        }
    }
    
    returnToMenu() {
        this.state = 'menu';
        this.waveManager.stopWave();
        
        // Clear entities
        this.cities = [];
        this.bases = [];
        this.playerMissiles = [];
        this.enemyMissiles = [];
        this.explosions = [];
        
        // Stop sounds
        audioManager.stopRadarPing();
        
        // Update UI
        this.ui.showScreen('start');
        this.ui.hideHUD();
        
        // Enable input for menu
        this.input.enable();
    }
    
    showHighScores() {
        this.ui.showScreen('highScores');
        this.ui.displayHighScores(this.highScoreManager.getScores());
    }
    
    submitHighScore(name) {
        const position = this.highScoreManager.addScore(name, this.scoreManager.getScore());
        this.showHighScores();
    }
    
    endGame() {
        this.state = 'gameover';
        this.gameOver = true;
        this.waveManager.stopWave();
        
        // Stop sounds
        audioManager.stopRadarPing();
        audioManager.play('gameOver');
        
        // Check for high score
        const finalScore = this.scoreManager.getScore();
        const isHighScore = this.highScoreManager.isHighScore(finalScore);
        
        // Show game over screen after delay
        setTimeout(() => {
            this.ui.showScreen('gameOver');
            this.ui.showFinalScore(finalScore, isHighScore);
            this.ui.hideHUD();
        }, 2000);
    }
    
    update(deltaTime) {
        if (this.state !== 'playing') return;
        
        // Update wave transition
        if (this.waveTransition > 0) {
            this.waveTransition -= deltaTime / (this.waveTransitionDuration / 1000);
            if (this.waveTransition < 0) {
                this.waveTransition = 0;
            }
        }
        
        // Update crosshair
        this.crosshair.update(deltaTime);
        
        // Update missiles
        for (let i = this.playerMissiles.length - 1; i >= 0; i--) {
            const missile = this.playerMissiles[i];
            missile.update(deltaTime);
            
            if (missile.detonated) {
                // Create explosion
                this.createExplosion(missile.targetX, missile.targetY, missile.explosionRadius, '#00ffff');
                audioManager.play('explosion');
                this.playerMissiles.splice(i, 1);
            } else if (!missile.active) {
                this.playerMissiles.splice(i, 1);
            }
        }
        
        // Update enemy missiles
        for (let i = this.enemyMissiles.length - 1; i >= 0; i--) {
            const missile = this.enemyMissiles[i];
            missile.update(deltaTime);
            
            // Handle smart bomb splitting
            if (missile.warheadType === 'smart' && missile.hasSplit && missile.detonated) {
                const splitTargets = missile.split();
                if (splitTargets) {
                    splitTargets.forEach(target => {
                        const newMissile = new EnemyMissile(
                            target.x, target.y,
                            target.targetX, target.targetY,
                            150
                        );
                        this.enemyMissiles.push(newMissile);
                    });
                }
            }
            
            if (!missile.active || missile.detonated) {
                this.enemyMissiles.splice(i, 1);
            }
        }
        
        // Update explosions
        for (let i = this.explosions.length - 1; i >= 0; i--) {
            const explosion = this.explosions[i];
            explosion.update(deltaTime);
            
            if (!explosion.active) {
                this.explosions.splice(i, 1);
            }
        }
        
        // Update effects
        this.effectsManager.update(deltaTime);
        
        // Check collisions
        const collisions = this.physics.detectCollisions(
            this.playerMissiles,
            this.enemyMissiles,
            this.explosions,
            this.cities,
            this.bases
        );
        
        // Handle collision results
        const results = this.collisionHandler.handleCollisions(collisions);
        
        // Update score
        if (results.score > 0) {
            this.scoreManager.addPoints(results.score);
            this.ui.updateScore(this.scoreManager.getScore());
            
            // Add floating score effect
            if (results.destroyedMissiles > 0) {
                const lastHit = collisions.missileHits[collisions.missileHits.length - 1];
                if (lastHit) {
                    this.effectsManager.addFloatingScore(lastHit.x, lastHit.y, results.score);
                }
            }
        }
        
        // Check if any city/base was destroyed
        if (results.destroyedCities > 0 || results.destroyedBases > 0) {
            this.perfectWave = false;
            this.renderer.shakeScreen(15, 500);
            
            if (results.destroyedCities > 0) {
                audioManager.play('cityDestroyed');
            }
            if (results.destroyedBases > 0) {
                audioManager.play('baseDestroyed');
                // Update ammo display for destroyed bases
                this.bases.forEach((base, index) => {
                    if (base.destroyed) {
                        this.ui.updateAmmo(index, 0, base.maxAmmo, true);
                    }
                });
            }
        }
        
        // Check game over (all cities destroyed)
        const activeCities = this.cities.filter(city => !city.destroyed).length;
        if (activeCities === 0 && !this.gameOver) {
            this.endGame();
        }
        
        // Check wave complete
        if (this.waveManager.isWaveComplete() && this.waveCompleteTime === 0) {
            this.waveCompleteTime = Date.now();
            
            // Calculate bonuses
            const survivingCities = this.cities.filter(c => !c.destroyed).length;
            const survivingBases = this.bases.filter(b => !b.destroyed).length;
            
            let bonus = 0;
            bonus += this.scoreManager.addCityBonus(survivingCities, this.currentWave);
            bonus += this.scoreManager.addBaseBonus(survivingBases, this.currentWave);
            
            if (this.perfectWave) {
                bonus += this.scoreManager.addPerfectWaveBonus();
                this.ui.showPerfectWave();
            }
            
            this.ui.updateScore(this.scoreManager.getScore());
            
            // Start next wave after delay
            setTimeout(() => {
                if (activeCities > 0) {
                    this.startNextWave();
                }
            }, 3000);
        }
    }
    
    render() {
        // Prepare game state for renderer
        const gameState = {
            cities: this.cities,
            bases: this.bases,
            playerMissiles: this.playerMissiles,
            enemyMissiles: this.enemyMissiles,
            explosions: this.explosions,
            crosshair: this.state === 'playing' ? this.crosshair : null,
            waveTransition: this.waveTransition,
            currentWave: this.currentWave,
            gameOver: this.gameOver,
            perfectWave: this.waveCompleteTime > 0 && this.perfectWave && 
                         (Date.now() - this.waveCompleteTime) < 2000,
            warning: this.warning
        };
        
        // Render scene
        this.renderer.render(gameState);
        
        // Render effects on top
        this.effectsManager.render();
    }
    
    gameLoop(currentTime = 0) {
        // Calculate delta time
        this.deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        // Cap delta time to prevent large jumps
        if (this.deltaTime > 0.1) {
            this.deltaTime = 0.1;
        }
        
        // Update and render
        this.update(this.deltaTime);
        this.render();
        
        // Continue loop
        requestAnimationFrame((time) => this.gameLoop(time));
    }
}

// Initialize game when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});

// Handle window resize
window.addEventListener('resize', () => {
    if (window.game && window.game.renderer) {
        window.game.renderer.resize();
    }
});

// Handle visibility change (pause when tab is hidden)
document.addEventListener('visibilitychange', () => {
    if (window.game) {
        if (document.hidden && window.game.state === 'playing') {
            window.game.pause();
        }
    }
});