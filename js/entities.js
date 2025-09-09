// Base GameObject class
class GameObject {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.active = true;
    }
    
    update(deltaTime) {
        // Override in subclasses
    }
    
    render(ctx) {
        // Override in subclasses
    }
    
    destroy() {
        this.active = false;
    }
}

// City class
class City extends GameObject {
    constructor(x, y, index) {
        super(x, y);
        this.index = index;
        this.width = 40;
        this.height = 30;
        this.destroyed = false;
        this.buildings = this.generateBuildings();
    }
    
    generateBuildings() {
        const buildings = [];
        const buildingCount = 3 + Math.floor(Math.random() * 2);
        
        for (let i = 0; i < buildingCount; i++) {
            buildings.push({
                x: this.x - this.width/2 + (i * 12) + 5,
                width: 8 + Math.random() * 4,
                height: 10 + Math.random() * 20
            });
        }
        
        return buildings;
    }
    
    render(ctx) {
        if (this.destroyed) return;
        
        // Draw buildings with neon glow
        ctx.strokeStyle = '#00ff00';
        ctx.fillStyle = 'rgba(0, 255, 0, 0.2)';
        ctx.shadowColor = '#00ff00';
        ctx.shadowBlur = 10;
        ctx.lineWidth = 2;
        
        this.buildings.forEach(building => {
            // Building outline
            ctx.beginPath();
            ctx.rect(
                building.x,
                this.y - building.height,
                building.width,
                building.height
            );
            ctx.fill();
            ctx.stroke();
            
            // Windows
            ctx.fillStyle = '#ffff00';
            ctx.shadowColor = '#ffff00';
            ctx.shadowBlur = 5;
            for (let row = 0; row < Math.floor(building.height / 8); row++) {
                for (let col = 0; col < 2; col++) {
                    if (Math.random() > 0.3) {
                        ctx.fillRect(
                            building.x + 2 + col * 4,
                            this.y - building.height + 2 + row * 8,
                            2, 3
                        );
                    }
                }
            }
        });
        
        ctx.shadowBlur = 0;
    }
    
    hit() {
        this.destroyed = true;
        this.active = false;
        return true;
    }
}

// Missile Base class
class MissileBase extends GameObject {
    constructor(x, y, index) {
        super(x, y);
        this.index = index;
        this.maxAmmo = 10;
        this.ammo = this.maxAmmo;
        this.destroyed = false;
        this.width = 50;
        this.height = 20;
    }
    
    render(ctx) {
        if (this.destroyed) {
            // Draw destroyed base
            ctx.strokeStyle = '#666666';
            ctx.fillStyle = 'rgba(128, 128, 128, 0.2)';
        } else {
            // Draw active base
            ctx.strokeStyle = '#00ffff';
            ctx.fillStyle = 'rgba(0, 255, 255, 0.2)';
            ctx.shadowColor = '#00ffff';
            ctx.shadowBlur = 10;
        }
        
        ctx.lineWidth = 2;
        
        // Base structure
        ctx.beginPath();
        ctx.moveTo(this.x - this.width/2, this.y);
        ctx.lineTo(this.x - this.width/3, this.y - this.height);
        ctx.lineTo(this.x + this.width/3, this.y - this.height);
        ctx.lineTo(this.x + this.width/2, this.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Missile indicators
        if (!this.destroyed && this.ammo > 0) {
            ctx.fillStyle = '#00ffff';
            ctx.shadowColor = '#00ffff';
            ctx.shadowBlur = 5;
            
            const missileSpacing = 4;
            const missileWidth = 2;
            const missileHeight = 8;
            const startX = this.x - (this.ammo * missileSpacing) / 2;
            
            for (let i = 0; i < this.ammo; i++) {
                ctx.fillRect(
                    startX + i * missileSpacing,
                    this.y - this.height - 5,
                    missileWidth,
                    missileHeight
                );
            }
        }
        
        ctx.shadowBlur = 0;
    }
    
    canFire() {
        return !this.destroyed && this.ammo > 0;
    }
    
    fire() {
        if (this.canFire()) {
            this.ammo--;
            return true;
        }
        return false;
    }
    
    reload() {
        if (!this.destroyed) {
            this.ammo = this.maxAmmo;
        }
    }
    
    hit() {
        this.destroyed = true;
        this.ammo = 0;
        return true;
    }
}

// Base Missile class
class Missile extends GameObject {
    constructor(x, y, targetX, targetY, speed) {
        super(x, y);
        this.startX = x;
        this.startY = y;
        this.targetX = targetX;
        this.targetY = targetY;
        this.speed = speed;
        
        // Calculate velocity
        const dx = targetX - x;
        const dy = targetY - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        this.vx = (dx / distance) * speed;
        this.vy = (dy / distance) * speed;
        
        // Trail effect
        this.trail = [];
        this.maxTrailLength = 20;
        
        this.detonated = false;
    }
    
    update(deltaTime) {
        if (this.detonated) return;
        
        // Add current position to trail
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }
        
        // Update position
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
    }
    
    detonate() {
        this.detonated = true;
        this.active = false;
    }
}

// Player Missile
class PlayerMissile extends Missile {
    constructor(x, y, targetX, targetY) {
        super(x, y, targetX, targetY, 400); // Faster than enemy missiles
        this.color = '#00ffff';
        this.explosionRadius = 30;
    }
    
    update(deltaTime) {
        super.update(deltaTime);
        
        // Check if reached target
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 5) {
            this.detonate();
        }
    }
    
    render(ctx) {
        if (this.detonated) return;
        
        // Draw trail
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        
        ctx.beginPath();
        if (this.trail.length > 0) {
            ctx.moveTo(this.trail[0].x, this.trail[0].y);
            for (let i = 1; i < this.trail.length; i++) {
                ctx.lineTo(this.trail[i].x, this.trail[i].y);
                ctx.globalAlpha = i / this.trail.length;
            }
            ctx.lineTo(this.x, this.y);
        }
        ctx.globalAlpha = 1;
        ctx.stroke();
        
        // Draw missile head
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 0;
    }
}

// Enemy Missile
class EnemyMissile extends Missile {
    constructor(x, y, targetX, targetY, speed = 100) {
        super(x, y, targetX, targetY, speed);
        this.color = '#ff00ff';
        this.warheadType = 'basic';
    }
    
    update(deltaTime) {
        super.update(deltaTime);
        
        // Check if reached ground or target
        if (this.y >= this.targetY) {
            this.detonate();
        }
    }
    
    render(ctx) {
        if (this.detonated) return;
        
        // Draw trail
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 1;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 8;
        
        ctx.beginPath();
        ctx.moveTo(this.startX, this.startY);
        ctx.lineTo(this.x, this.y);
        ctx.stroke();
        
        // Draw missile head
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 0;
    }
}

// Smart Bomb (splits into multiple warheads)
class SmartBomb extends EnemyMissile {
    constructor(x, y, targetX, targetY) {
        super(x, y, targetX, targetY, 80);
        this.warheadType = 'smart';
        this.splitDistance = 200;
        this.hasSplit = false;
        this.color = '#ff00ff';
    }
    
    update(deltaTime) {
        super.update(deltaTime);
        
        // Check if should split
        if (!this.hasSplit && !this.detonated) {
            const distanceToTarget = Math.sqrt(
                Math.pow(this.targetX - this.x, 2) + 
                Math.pow(this.targetY - this.y, 2)
            );
            
            if (distanceToTarget < this.splitDistance) {
                this.split();
            }
        }
    }
    
    split() {
        this.hasSplit = true;
        this.detonate();
        
        // Create split warheads (handled in game.js)
        const splitTargets = [];
        for (let i = 0; i < 3; i++) {
            splitTargets.push({
                x: this.x,
                y: this.y,
                targetX: this.targetX + (Math.random() - 0.5) * 100,
                targetY: this.targetY
            });
        }
        
        return splitTargets;
    }
    
    render(ctx) {
        super.render(ctx);
        
        // Add pulsing effect for smart bombs
        if (!this.detonated) {
            ctx.strokeStyle = this.color;
            ctx.globalAlpha = 0.5 + Math.sin(Date.now() * 0.01) * 0.3;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 5, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1;
        }
    }
}

// Explosion class
class Explosion extends GameObject {
    constructor(x, y, maxRadius = 30, color = '#ffff00') {
        super(x, y);
        this.radius = 0;
        this.maxRadius = maxRadius;
        this.expandSpeed = 150;
        this.fadeSpeed = 2;
        this.opacity = 1;
        this.color = color;
        this.particles = this.createParticles();
        this.shockwave = true;
    }
    
    createParticles() {
        const particles = [];
        const particleCount = 15 + Math.floor(Math.random() * 10);
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const speed = 50 + Math.random() * 100;
            
            particles.push({
                x: this.x,
                y: this.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                size: 2 + Math.random() * 2
            });
        }
        
        return particles;
    }
    
    update(deltaTime) {
        // Expand explosion
        if (this.radius < this.maxRadius) {
            this.radius += this.expandSpeed * deltaTime;
            if (this.radius > this.maxRadius) {
                this.radius = this.maxRadius;
                this.shockwave = false;
            }
        } else {
            // Fade out
            this.opacity -= this.fadeSpeed * deltaTime;
            if (this.opacity <= 0) {
                this.active = false;
            }
        }
        
        // Update particles
        this.particles.forEach(particle => {
            particle.x += particle.vx * deltaTime;
            particle.y += particle.vy * deltaTime;
            particle.vy += 200 * deltaTime; // Gravity
            particle.life -= deltaTime * 2;
        });
        
        // Remove dead particles
        this.particles = this.particles.filter(p => p.life > 0);
    }
    
    render(ctx) {
        ctx.save();
        
        // Draw explosion circle
        ctx.globalAlpha = this.opacity;
        
        // Outer glow
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(0.3, this.color);
        gradient.addColorStop(0.7, 'rgba(255, 0, 0, 0.5)');
        gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Shockwave ring
        if (this.shockwave) {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.globalAlpha = this.opacity * 0.5;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * 1.2, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // Draw particles
        ctx.fillStyle = '#ffff00';
        ctx.shadowColor = '#ffff00';
        ctx.shadowBlur = 10;
        
        this.particles.forEach(particle => {
            ctx.globalAlpha = particle.life;
            ctx.fillRect(
                particle.x - particle.size/2,
                particle.y - particle.size/2,
                particle.size,
                particle.size
            );
        });
        
        ctx.restore();
    }
    
    containsPoint(x, y) {
        const dx = x - this.x;
        const dy = y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance <= this.radius;
    }
}

// Crosshair for targeting
class Crosshair extends GameObject {
    constructor() {
        super(0, 0);
        this.visible = true;
        this.rotation = 0;
    }
    
    update(deltaTime) {
        this.rotation += deltaTime * 2;
    }
    
    render(ctx) {
        if (!this.visible) return;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#00ff00';
        ctx.shadowBlur = 10;
        ctx.globalAlpha = 0.8;
        
        // Draw crosshair
        const size = 20;
        
        ctx.beginPath();
        // Horizontal line
        ctx.moveTo(-size, 0);
        ctx.lineTo(-5, 0);
        ctx.moveTo(5, 0);
        ctx.lineTo(size, 0);
        
        // Vertical line
        ctx.moveTo(0, -size);
        ctx.lineTo(0, -5);
        ctx.moveTo(0, 5);
        ctx.lineTo(0, size);
        
        // Circle
        ctx.moveTo(size * 0.7, 0);
        ctx.arc(0, 0, size * 0.7, 0, Math.PI * 2);
        
        ctx.stroke();
        ctx.restore();
    }
}