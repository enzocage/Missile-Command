// Rendering System for Vector Graphics with Neon Effects

class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = 900;
        this.height = 600;
        this.gridEnabled = true;
        this.scanlineEnabled = true;
        this.glowEnabled = true;
        this.screenShake = { x: 0, y: 0, intensity: 0 };
        
        // Set canvas size
        this.resize();
        
        // Background gradient
        this.bgGradient = null;
        this.initBackground();
        
        // Scanline effect
        this.scanlineOffset = 0;
        
        // Performance optimization
        this.offscreenCanvas = document.createElement('canvas');
        this.offscreenCanvas.width = this.width;
        this.offscreenCanvas.height = this.height;
        this.offscreenCtx = this.offscreenCanvas.getContext('2d');
    }
    
    resize() {
        // Calculate scale to fit screen while maintaining aspect ratio
        const targetAspect = this.width / this.height;
        const windowAspect = window.innerWidth / window.innerHeight;
        
        let scale;
        if (windowAspect > targetAspect) {
            scale = window.innerHeight / this.height;
        } else {
            scale = window.innerWidth / this.width;
        }
        
        scale = Math.min(scale, 1.5); // Max scale to prevent too much pixelation
        
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.canvas.style.width = (this.width * scale) + 'px';
        this.canvas.style.height = (this.height * scale) + 'px';
        
        // Enable image smoothing for better visuals
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
    }
    
    initBackground() {
        this.bgGradient = this.ctx.createRadialGradient(
            this.width / 2, this.height / 2, 0,
            this.width / 2, this.height / 2, this.width / 2
        );
        this.bgGradient.addColorStop(0, '#001111');
        this.bgGradient.addColorStop(1, '#000000');
    }
    
    clear() {
        // Apply screen shake
        this.ctx.save();
        if (this.screenShake.intensity > 0) {
            this.ctx.translate(
                Math.random() * this.screenShake.x * this.screenShake.intensity,
                Math.random() * this.screenShake.y * this.screenShake.intensity
            );
        }
        
        // Clear with background
        this.ctx.fillStyle = this.bgGradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        this.ctx.restore();
    }
    
    drawGrid() {
        if (!this.gridEnabled) return;
        
        this.ctx.strokeStyle = 'rgba(10, 79, 79, 0.3)';
        this.ctx.lineWidth = 1;
        
        // Vertical lines
        for (let x = 0; x < this.width; x += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
            this.ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y < this.height; y += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
            this.ctx.stroke();
        }
        
        // Ground line
        const groundY = this.height - 50;
        this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(0, groundY);
        this.ctx.lineTo(this.width, groundY);
        this.ctx.stroke();
    }
    
    drawScanlines() {
        if (!this.scanlineEnabled) return;
        
        this.ctx.save();
        this.ctx.globalAlpha = 0.05;
        this.ctx.fillStyle = '#00ffff';
        
        this.scanlineOffset = (this.scanlineOffset + 1) % 4;
        
        for (let y = this.scanlineOffset; y < this.height; y += 4) {
            this.ctx.fillRect(0, y, this.width, 1);
        }
        
        this.ctx.restore();
    }
    
    drawMountains() {
        const groundY = this.height - 50;
        
        this.ctx.save();
        this.ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)';
        this.ctx.fillStyle = 'rgba(0, 255, 0, 0.05)';
        this.ctx.lineWidth = 2;
        
        // Draw background mountains
        this.ctx.beginPath();
        this.ctx.moveTo(0, groundY);
        
        // Create mountain peaks
        const peaks = [
            { x: 100, y: groundY - 80 },
            { x: 200, y: groundY - 120 },
            { x: 350, y: groundY - 60 },
            { x: 500, y: groundY - 100 },
            { x: 650, y: groundY - 90 },
            { x: 800, y: groundY - 110 },
            { x: this.width, y: groundY - 40 }
        ];
        
        peaks.forEach(peak => {
            this.ctx.lineTo(peak.x, peak.y);
        });
        
        this.ctx.lineTo(this.width, groundY);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        
        this.ctx.restore();
    }
    
    drawStars() {
        this.ctx.save();
        this.ctx.fillStyle = '#ffffff';
        
        // Static stars for performance
        const stars = [
            { x: 50, y: 50, size: 1 },
            { x: 150, y: 80, size: 2 },
            { x: 250, y: 40, size: 1 },
            { x: 350, y: 100, size: 1 },
            { x: 450, y: 60, size: 2 },
            { x: 550, y: 90, size: 1 },
            { x: 650, y: 30, size: 1 },
            { x: 750, y: 70, size: 2 },
            { x: 850, y: 110, size: 1 },
            { x: 100, y: 150, size: 1 },
            { x: 300, y: 180, size: 2 },
            { x: 500, y: 160, size: 1 },
            { x: 700, y: 140, size: 1 },
            { x: 820, y: 190, size: 2 }
        ];
        
        stars.forEach(star => {
            this.ctx.globalAlpha = 0.5 + Math.sin(Date.now() * 0.001 + star.x) * 0.3;
            this.ctx.fillRect(star.x, star.y, star.size, star.size);
        });
        
        this.ctx.restore();
    }
    
    applyGlow(color, blur = 10) {
        if (!this.glowEnabled) return;
        
        this.ctx.shadowColor = color;
        this.ctx.shadowBlur = blur;
    }
    
    clearGlow() {
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
    }
    
    drawEntity(entity) {
        if (!entity || !entity.active) return;
        
        this.ctx.save();
        
        // Apply screen shake to entities
        if (this.screenShake.intensity > 0) {
            this.ctx.translate(
                Math.random() * this.screenShake.x * this.screenShake.intensity,
                Math.random() * this.screenShake.y * this.screenShake.intensity
            );
        }
        
        entity.render(this.ctx);
        this.ctx.restore();
    }
    
    drawEntities(entities) {
        if (!entities) return;
        
        for (const entity of entities) {
            this.drawEntity(entity);
        }
    }
    
    shakeScreen(intensity = 10, duration = 500) {
        this.screenShake.intensity = intensity;
        this.screenShake.x = (Math.random() - 0.5) * 2;
        this.screenShake.y = (Math.random() - 0.5) * 2;
        
        setTimeout(() => {
            this.screenShake.intensity = 0;
        }, duration);
    }
    
    drawText(text, x, y, size = 20, color = '#00ffff', align = 'center') {
        this.ctx.save();
        this.ctx.font = `${size}px Orbitron`;
        this.ctx.fillStyle = color;
        this.ctx.textAlign = align;
        this.ctx.textBaseline = 'middle';
        
        this.applyGlow(color, 10);
        this.ctx.fillText(text, x, y);
        this.clearGlow();
        
        this.ctx.restore();
    }
    
    drawWaveTransition(waveNumber, progress) {
        if (progress <= 0) return;
        
        this.ctx.save();
        
        // Fade in/out effect
        const alpha = progress < 0.5 ? progress * 2 : (1 - progress) * 2;
        this.ctx.globalAlpha = alpha;
        
        // Background overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Wave text
        const scale = 1 + (1 - progress) * 0.5;
        this.ctx.save();
        this.ctx.translate(this.width / 2, this.height / 2);
        this.ctx.scale(scale, scale);
        
        this.drawText(`WAVE ${waveNumber}`, 0, -20, 48, '#ff00ff');
        this.drawText('GET READY', 0, 20, 24, '#00ffff');
        
        this.ctx.restore();
        this.ctx.restore();
    }
    
    drawGameOver() {
        this.ctx.save();
        
        // Red tint overlay
        this.ctx.fillStyle = 'rgba(255, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Flashing game over text
        const flash = Math.sin(Date.now() * 0.005) * 0.5 + 0.5;
        this.ctx.globalAlpha = 0.5 + flash * 0.5;
        
        this.drawText('GAME OVER', this.width / 2, this.height / 2, 64, '#ff0000');
        
        this.ctx.restore();
    }
    
    drawPerfectWave() {
        this.ctx.save();
        
        // Rainbow effect for perfect wave
        const time = Date.now() * 0.001;
        const hue = (time * 60) % 360;
        const color = `hsl(${hue}, 100%, 50%)`;
        
        this.drawText('PERFECT!', this.width / 2, this.height / 2 - 50, 48, color);
        this.drawText('+500 BONUS', this.width / 2, this.height / 2, 32, '#ffff00');
        
        this.ctx.restore();
    }
    
    drawWarning(message) {
        this.ctx.save();
        
        // Flashing warning
        const flash = Math.sin(Date.now() * 0.01) * 0.5 + 0.5;
        this.ctx.globalAlpha = flash;
        
        this.drawText(message, this.width / 2, 100, 24, '#ff0000');
        
        this.ctx.restore();
    }
    
    drawScore(score, x, y, size = 16) {
        this.drawText(`+${score}`, x, y, size, '#ffff00');
    }
    
    // Main render function
    render(gameState) {
        // Clear and draw background
        this.clear();
        this.drawStars();
        this.drawGrid();
        this.drawMountains();
        
        // Draw game entities in order
        if (gameState) {
            // Draw cities
            this.drawEntities(gameState.cities);
            
            // Draw missile bases
            this.drawEntities(gameState.bases);
            
            // Draw missile trails and missiles
            this.drawEntities(gameState.playerMissiles);
            this.drawEntities(gameState.enemyMissiles);
            
            // Draw explosions (on top)
            this.drawEntities(gameState.explosions);
            
            // Draw crosshair
            if (gameState.crosshair) {
                this.drawEntity(gameState.crosshair);
            }
            
            // Draw UI elements
            if (gameState.waveTransition) {
                this.drawWaveTransition(gameState.currentWave, gameState.waveTransition);
            }
            
            if (gameState.gameOver) {
                this.drawGameOver();
            }
            
            if (gameState.perfectWave) {
                this.drawPerfectWave();
            }
            
            if (gameState.warning) {
                this.drawWarning(gameState.warning);
            }
        }
        
        // Apply post-processing effects
        this.drawScanlines();
        
        // Decay screen shake
        if (this.screenShake.intensity > 0) {
            this.screenShake.intensity *= 0.95;
            if (this.screenShake.intensity < 0.1) {
                this.screenShake.intensity = 0;
            }
        }
    }
}

// Visual effects manager
class EffectsManager {
    constructor(renderer) {
        this.renderer = renderer;
        this.activeEffects = [];
    }
    
    addFloatingScore(x, y, score) {
        this.activeEffects.push({
            type: 'score',
            x: x,
            y: y,
            score: score,
            life: 1.0,
            vy: -50
        });
    }
    
    update(deltaTime) {
        for (let i = this.activeEffects.length - 1; i >= 0; i--) {
            const effect = this.activeEffects[i];
            
            if (effect.type === 'score') {
                effect.y += effect.vy * deltaTime;
                effect.life -= deltaTime;
                
                if (effect.life <= 0) {
                    this.activeEffects.splice(i, 1);
                }
            }
        }
    }
    
    render() {
        for (const effect of this.activeEffects) {
            if (effect.type === 'score') {
                this.renderer.ctx.save();
                this.renderer.ctx.globalAlpha = effect.life;
                this.renderer.drawScore(effect.score, effect.x, effect.y);
                this.renderer.ctx.restore();
            }
        }
    }
}