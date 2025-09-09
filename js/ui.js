// UI Management System

class UIManager {
    constructor() {
        this.screens = {
            start: document.getElementById('startScreen'),
            gameOver: document.getElementById('gameOverScreen'),
            highScores: document.getElementById('highScoresScreen'),
            pause: document.getElementById('pauseOverlay')
        };
        
        this.hud = {
            container: document.getElementById('gameHud'),
            score: document.getElementById('currentScore'),
            wave: document.getElementById('currentWave'),
            highScore: document.getElementById('highScore'),
            base1Ammo: document.getElementById('base1Ammo'),
            base2Ammo: document.getElementById('base2Ammo'),
            base3Ammo: document.getElementById('base3Ammo')
        };
        
        this.currentScreen = 'start';
    }
    
    showScreen(screenName) {
        // Hide all screens
        Object.values(this.screens).forEach(screen => {
            if (screen) screen.classList.add('hidden');
        });
        
        // Show requested screen
        if (this.screens[screenName]) {
            this.screens[screenName].classList.remove('hidden');
            this.currentScreen = screenName;
        }
    }
    
    hideAllScreens() {
        Object.values(this.screens).forEach(screen => {
            if (screen) screen.classList.add('hidden');
        });
        this.currentScreen = null;
    }
    
    showHUD() {
        if (this.hud.container) {
            this.hud.container.classList.remove('hidden');
        }
    }
    
    hideHUD() {
        if (this.hud.container) {
            this.hud.container.classList.add('hidden');
        }
    }
    
    updateScore(score) {
        if (this.hud.score) {
            this.hud.score.textContent = String(score).padStart(5, '0');
            
            // Flash effect on score change
            this.hud.score.classList.add('wave-complete');
            setTimeout(() => {
                this.hud.score.classList.remove('wave-complete');
            }, 500);
        }
    }
    
    updateWave(wave) {
        if (this.hud.wave) {
            this.hud.wave.textContent = String(wave).padStart(2, '0');
        }
    }
    
    updateHighScore(score) {
        if (this.hud.highScore) {
            this.hud.highScore.textContent = String(score).padStart(5, '0');
        }
        
        // Also update high score display in menu
        const menuHighScore = document.querySelector('#highScore');
        if (menuHighScore) {
            menuHighScore.textContent = String(score).padStart(5, '0');
        }
    }
    
    updateAmmo(baseIndex, ammo, maxAmmo, destroyed = false) {
        const ammoElements = [this.hud.base1Ammo, this.hud.base2Ammo, this.hud.base3Ammo];
        const element = ammoElements[baseIndex];
        
        if (element) {
            const ammoCount = element.querySelector('.ammo-count');
            if (ammoCount) {
                ammoCount.textContent = ammo;
            }
            
            // Update visual state
            element.classList.toggle('depleted', ammo === 0 && !destroyed);
            element.classList.toggle('destroyed', destroyed);
        }
    }
    
    showFinalScore(score, isHighScore = false) {
        const finalScoreElement = document.getElementById('finalScore');
        if (finalScoreElement) {
            finalScoreElement.textContent = String(score).padStart(5, '0');
        }
        
        const highScoreEntry = document.getElementById('highScoreEntry');
        if (highScoreEntry) {
            if (isHighScore) {
                highScoreEntry.classList.remove('hidden');
                const nameInput = document.getElementById('playerName');
                if (nameInput) {
                    nameInput.value = '';
                    nameInput.focus();
                }
            } else {
                highScoreEntry.classList.add('hidden');
            }
        }
    }
    
    displayHighScores(scores) {
        const scoresList = document.getElementById('scoresList');
        if (!scoresList) return;
        
        scoresList.innerHTML = '';
        
        scores.forEach((score, index) => {
            const row = document.createElement('div');
            row.className = 'score-row';
            
            if (score.isNew) {
                row.classList.add('highlight');
            }
            
            row.innerHTML = `
                <span class="score-rank">#${index + 1}</span>
                <span class="score-name">${score.name}</span>
                <span class="score-points">${String(score.score).padStart(5, '0')}</span>
            `;
            
            scoresList.appendChild(row);
        });
    }
    
    showNotification(message, duration = 2000) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 255, 255, 0.9);
            color: #000;
            padding: 20px 40px;
            font-size: 24px;
            font-weight: bold;
            z-index: 1000;
            animation: pulse 0.5s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, duration);
    }
    
    showWaveComplete(wave, bonus) {
        this.showNotification(`WAVE ${wave} COMPLETE! +${bonus} BONUS`, 3000);
    }
    
    showPerfectWave() {
        this.showNotification('PERFECT DEFENSE! +500 BONUS', 3000);
    }
}

// High Score Manager
class HighScoreManager {
    constructor() {
        this.maxScores = 10;
        this.storageKey = 'neonCommandHighScores';
        this.scores = this.loadScores();
    }
    
    loadScores() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('Failed to load high scores:', error);
        }
        
        // Default high scores
        return [
            { name: 'ACE', score: 10000 },
            { name: 'MAX', score: 8000 },
            { name: 'SAM', score: 6000 },
            { name: 'LEO', score: 4000 },
            { name: 'ZOE', score: 2000 },
            { name: 'REX', score: 1500 },
            { name: 'KAI', score: 1000 },
            { name: 'EVE', score: 750 },
            { name: 'JOE', score: 500 },
            { name: 'BOB', score: 250 }
        ];
    }
    
    saveScores() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.scores));
        } catch (error) {
            console.error('Failed to save high scores:', error);
        }
    }
    
    isHighScore(score) {
        return score > 0 && (
            this.scores.length < this.maxScores ||
            score > this.scores[this.scores.length - 1].score
        );
    }
    
    addScore(name, score) {
        const newScore = {
            name: name.toUpperCase().substring(0, 3),
            score: score,
            isNew: true,
            date: Date.now()
        };
        
        // Add and sort
        this.scores.push(newScore);
        this.scores.sort((a, b) => b.score - a.score);
        
        // Keep only top scores
        if (this.scores.length > this.maxScores) {
            this.scores = this.scores.slice(0, this.maxScores);
        }
        
        this.saveScores();
        
        // Return position (1-based)
        const position = this.scores.findIndex(s => s === newScore) + 1;
        return position;
    }
    
    getScores() {
        return this.scores.map(score => ({ ...score }));
    }
    
    getHighScore() {
        return this.scores.length > 0 ? this.scores[0].score : 0;
    }
    
    clearNewFlags() {
        this.scores.forEach(score => {
            delete score.isNew;
        });
        this.saveScores();
    }
}

// Wave Manager
class WaveManager {
    constructor(game) {
        this.game = game;
        this.currentWave = 0;
        this.missilesPerWave = 10;
        this.missileSpeed = 100;
        this.smartBombChance = 0;
        this.cruiseMissileChance = 0;
        this.spawnDelay = 2000;
        this.missilesRemaining = 0;
        this.spawning = false;
        this.spawnTimer = null;
    }
    
    startWave(waveNumber) {
        this.currentWave = waveNumber;
        
        // Calculate wave parameters
        this.missilesPerWave = 10 + (waveNumber * 2);
        this.missileSpeed = 100 + (waveNumber * 10);
        
        // Smart bomb chance increases after wave 3
        if (waveNumber >= 4) {
            this.smartBombChance = Math.min(0.3, (waveNumber - 3) * 0.05);
        }
        
        // Cruise missiles after wave 10
        if (waveNumber >= 10) {
            this.cruiseMissileChance = Math.min(0.2, (waveNumber - 9) * 0.02);
        }
        
        // Spawn delay decreases with waves
        this.spawnDelay = Math.max(500, 2000 - (waveNumber * 100));
        
        this.missilesRemaining = this.missilesPerWave;
        this.spawning = true;
        
        // Start spawning missiles
        this.spawnNextMissile();
    }
    
    spawnNextMissile() {
        if (!this.spawning || this.missilesRemaining <= 0) {
            this.spawning = false;
            return;
        }
        
        // Random spawn position at top of screen
        const x = Math.random() * this.game.renderer.width;
        const y = -10;
        
        // Random target (city or base)
        const targets = [...this.game.cities, ...this.game.bases].filter(t => !t.destroyed);
        if (targets.length === 0) return;
        
        const target = targets[Math.floor(Math.random() * targets.length)];
        const targetX = target.x + (Math.random() - 0.5) * 20;
        const targetY = target.y;
        
        // Determine missile type
        let missile;
        const rand = Math.random();
        
        if (rand < this.cruiseMissileChance) {
            // Cruise missile (not implemented in basic version)
            missile = new EnemyMissile(x, y, targetX, targetY, this.missileSpeed * 0.8);
            missile.warheadType = 'cruise';
            missile.color = '#ff8800';
        } else if (rand < this.cruiseMissileChance + this.smartBombChance) {
            // Smart bomb
            missile = new SmartBomb(x, y, targetX, targetY);
        } else {
            // Basic missile
            missile = new EnemyMissile(x, y, targetX, targetY, this.missileSpeed);
        }
        
        this.game.enemyMissiles.push(missile);
        this.missilesRemaining--;
        
        // Schedule next missile
        this.spawnTimer = setTimeout(() => {
            this.spawnNextMissile();
        }, this.spawnDelay + Math.random() * 1000);
    }
    
    stopWave() {
        this.spawning = false;
        if (this.spawnTimer) {
            clearTimeout(this.spawnTimer);
            this.spawnTimer = null;
        }
    }
    
    isWaveComplete() {
        return !this.spawning && this.missilesRemaining === 0 && 
               this.game.enemyMissiles.every(m => !m.active || m.detonated);
    }
}

// Score Manager
class ScoreManager {
    constructor() {
        this.score = 0;
        this.multiplier = 1;
        this.chainBonus = 0;
    }
    
    reset() {
        this.score = 0;
        this.multiplier = 1;
        this.chainBonus = 0;
    }
    
    addPoints(points, isChain = false) {
        if (isChain) {
            this.chainBonus++;
            points *= (1 + this.chainBonus * 0.5);
        }
        
        this.score += Math.floor(points * this.multiplier);
        return this.score;
    }
    
    addMissileDestroyed(type = 'basic') {
        const points = {
            'basic': 25,
            'smart': 50,
            'cruise': 75
        };
        
        return this.addPoints(points[type] || 25);
    }
    
    addCityBonus(cities, wave) {
        const points = cities * 100 * wave;
        return this.addPoints(points);
    }
    
    addBaseBonus(bases, wave) {
        const points = bases * 50 * wave;
        return this.addPoints(points);
    }
    
    addPerfectWaveBonus() {
        return this.addPoints(500);
    }
    
    resetChain() {
        this.chainBonus = 0;
    }
    
    getScore() {
        return this.score;
    }
}