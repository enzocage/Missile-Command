// Physics and Collision Detection System

class Physics {
    constructor() {
        this.gravity = 0;
        this.spatialGrid = null;
        this.gridSize = 100;
    }
    
    // Initialize spatial grid for optimization
    initSpatialGrid(width, height) {
        this.spatialGrid = {
            width: width,
            height: height,
            cellSize: this.gridSize,
            cols: Math.ceil(width / this.gridSize),
            rows: Math.ceil(height / this.gridSize),
            cells: []
        };
        
        // Initialize cells
        for (let i = 0; i < this.spatialGrid.cols * this.spatialGrid.rows; i++) {
            this.spatialGrid.cells[i] = [];
        }
    }
    
    // Get grid cell index for a position
    getGridCell(x, y) {
        const col = Math.floor(x / this.gridSize);
        const row = Math.floor(y / this.gridSize);
        
        if (col < 0 || col >= this.spatialGrid.cols || 
            row < 0 || row >= this.spatialGrid.rows) {
            return -1;
        }
        
        return row * this.spatialGrid.cols + col;
    }
    
    // Get nearby cells for broad phase collision detection
    getNearbyCells(x, y, radius) {
        const cells = [];
        const minCol = Math.max(0, Math.floor((x - radius) / this.gridSize));
        const maxCol = Math.min(this.spatialGrid.cols - 1, Math.floor((x + radius) / this.gridSize));
        const minRow = Math.max(0, Math.floor((y - radius) / this.gridSize));
        const maxRow = Math.min(this.spatialGrid.rows - 1, Math.floor((y + radius) / this.gridSize));
        
        for (let row = minRow; row <= maxRow; row++) {
            for (let col = minCol; col <= maxCol; col++) {
                cells.push(row * this.spatialGrid.cols + col);
            }
        }
        
        return cells;
    }
    
    // Circle to circle collision
    circleCircleCollision(x1, y1, r1, x2, y2, r2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (r1 + r2);
    }
    
    // Point in circle collision
    pointInCircle(px, py, cx, cy, radius) {
        const dx = px - cx;
        const dy = py - cy;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance <= radius;
    }
    
    // Line to circle collision (for missile interception)
    lineCircleCollision(x1, y1, x2, y2, cx, cy, radius) {
        // Vector from line start to circle center
        const dx = cx - x1;
        const dy = cy - y1;
        
        // Vector of the line
        const ldx = x2 - x1;
        const ldy = y2 - y1;
        
        // Length of the line
        const lineLength = Math.sqrt(ldx * ldx + ldy * ldy);
        if (lineLength === 0) return this.pointInCircle(x1, y1, cx, cy, radius);
        
        // Normalize line vector
        const lnx = ldx / lineLength;
        const lny = ldy / lineLength;
        
        // Project circle center onto line
        let t = (dx * lnx + dy * lny);
        
        // Clamp t to line segment
        t = Math.max(0, Math.min(lineLength, t));
        
        // Find closest point on line
        const closestX = x1 + lnx * t;
        const closestY = y1 + lny * t;
        
        // Check if closest point is within circle
        return this.pointInCircle(closestX, closestY, cx, cy, radius);
    }
    
    // Check if missile hits explosion
    checkMissileExplosionCollision(missile, explosion) {
        if (!missile.active || missile.detonated || !explosion.active) {
            return false;
        }
        
        // Check if missile trail intersects with explosion
        if (missile.trail && missile.trail.length > 0) {
            for (let i = 0; i < missile.trail.length - 1; i++) {
                if (this.lineCircleCollision(
                    missile.trail[i].x, missile.trail[i].y,
                    missile.x, missile.y,
                    explosion.x, explosion.y, explosion.radius
                )) {
                    return true;
                }
            }
        }
        
        // Check missile head
        return this.pointInCircle(missile.x, missile.y, explosion.x, explosion.y, explosion.radius);
    }
    
    // Check if enemy missile hits city or base
    checkGroundCollision(missile, cities, bases) {
        if (!missile.active || missile.detonated) {
            return null;
        }
        
        const hitRadius = 20; // Detection radius for ground targets
        
        // Check cities
        for (const city of cities) {
            if (!city.destroyed) {
                const dx = Math.abs(missile.x - city.x);
                const dy = Math.abs(missile.y - city.y);
                
                if (dx < city.width/2 + hitRadius && dy < city.height + hitRadius) {
                    return { type: 'city', target: city };
                }
            }
        }
        
        // Check bases
        for (const base of bases) {
            if (!base.destroyed) {
                const dx = Math.abs(missile.x - base.x);
                const dy = Math.abs(missile.y - base.y);
                
                if (dx < base.width/2 + hitRadius && dy < base.height + hitRadius) {
                    return { type: 'base', target: base };
                }
            }
        }
        
        return null;
    }
    
    // Main collision detection system
    detectCollisions(playerMissiles, enemyMissiles, explosions, cities, bases) {
        const collisions = {
            missileHits: [],      // Enemy missiles destroyed
            groundHits: [],       // Cities/bases hit
            chainReactions: []    // Additional explosions from chain reactions
        };
        
        // Check enemy missiles against explosions
        for (const enemyMissile of enemyMissiles) {
            if (!enemyMissile.active || enemyMissile.detonated) continue;
            
            for (const explosion of explosions) {
                if (!explosion.active) continue;
                
                if (this.checkMissileExplosionCollision(enemyMissile, explosion)) {
                    collisions.missileHits.push({
                        missile: enemyMissile,
                        explosion: explosion,
                        x: enemyMissile.x,
                        y: enemyMissile.y
                    });
                    break;
                }
            }
        }
        
        // Check enemy missiles against ground targets
        for (const enemyMissile of enemyMissiles) {
            if (!enemyMissile.active || enemyMissile.detonated) continue;
            
            const groundHit = this.checkGroundCollision(enemyMissile, cities, bases);
            if (groundHit) {
                collisions.groundHits.push({
                    missile: enemyMissile,
                    target: groundHit.target,
                    type: groundHit.type
                });
            }
        }
        
        // Check for chain reactions (player missiles hitting enemy missiles)
        for (const playerMissile of playerMissiles) {
            if (!playerMissile.active || playerMissile.detonated) continue;
            
            for (const explosion of explosions) {
                if (!explosion.active) continue;
                
                if (this.checkMissileExplosionCollision(playerMissile, explosion)) {
                    collisions.chainReactions.push({
                        missile: playerMissile,
                        x: playerMissile.x,
                        y: playerMissile.y
                    });
                    break;
                }
            }
        }
        
        return collisions;
    }
    
    // Calculate intercept point for predictive targeting
    calculateInterceptPoint(missileX, missileY, missileVx, missileVy, interceptorSpeed, launchX, launchY) {
        // This calculates where to aim to intercept a moving target
        const dx = missileX - launchX;
        const dy = missileY - launchY;
        
        // Quadratic formula to solve for intercept time
        const a = missileVx * missileVx + missileVy * missileVy - interceptorSpeed * interceptorSpeed;
        const b = 2 * (dx * missileVx + dy * missileVy);
        const c = dx * dx + dy * dy;
        
        const discriminant = b * b - 4 * a * c;
        
        if (discriminant < 0) {
            // No solution - can't intercept
            return null;
        }
        
        const t1 = (-b + Math.sqrt(discriminant)) / (2 * a);
        const t2 = (-b - Math.sqrt(discriminant)) / (2 * a);
        
        // Use the smallest positive time
        let t = Math.min(t1, t2);
        if (t < 0) t = Math.max(t1, t2);
        if (t < 0) return null;
        
        return {
            x: missileX + missileVx * t,
            y: missileY + missileVy * t,
            time: t
        };
    }
    
    // Check if a point is within game bounds
    isInBounds(x, y, width, height, margin = 0) {
        return x >= -margin && x <= width + margin && 
               y >= -margin && y <= height + margin;
    }
    
    // Calculate distance between two points
    distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    // Calculate angle between two points
    angle(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
    }
    
    // Normalize a vector
    normalize(x, y) {
        const length = Math.sqrt(x * x + y * y);
        if (length === 0) return { x: 0, y: 0 };
        return { x: x / length, y: y / length };
    }
}

// Collision result handler
class CollisionHandler {
    constructor(game) {
        this.game = game;
        this.chainReactionBonus = 2;
    }
    
    handleCollisions(collisions) {
        const results = {
            score: 0,
            destroyedMissiles: 0,
            destroyedCities: 0,
            destroyedBases: 0,
            chainReactions: 0
        };
        
        // Handle missile hits (enemy missiles destroyed by explosions)
        for (const hit of collisions.missileHits) {
            hit.missile.detonate();
            results.destroyedMissiles++;
            
            // Base score for destroying missile
            let points = 25;
            if (hit.missile.warheadType === 'smart') {
                points = 50;
            } else if (hit.missile.warheadType === 'cruise') {
                points = 75;
            }
            
            results.score += points;
            
            // Create explosion at missile position
            this.game.createExplosion(hit.x, hit.y, 20, '#ff00ff');
        }
        
        // Handle ground hits (cities/bases destroyed)
        for (const hit of collisions.groundHits) {
            hit.missile.detonate();
            
            if (hit.type === 'city' && !hit.target.destroyed) {
                hit.target.hit();
                results.destroyedCities++;
                // Large explosion for city
                this.game.createExplosion(hit.target.x, hit.target.y, 50, '#ff0000');
            } else if (hit.type === 'base' && !hit.target.destroyed) {
                hit.target.hit();
                results.destroyedBases++;
                // Large explosion for base
                this.game.createExplosion(hit.target.x, hit.target.y, 40, '#ff8800');
            }
        }
        
        // Handle chain reactions
        for (const chain of collisions.chainReactions) {
            chain.missile.detonate();
            results.chainReactions++;
            
            // Bonus points for chain reaction
            results.score += 50 * this.chainReactionBonus;
            
            // Create chain reaction explosion
            this.game.createExplosion(chain.x, chain.y, 35, '#ffff00');
        }
        
        // Apply chain reaction multiplier
        if (results.chainReactions > 0) {
            results.score *= (1 + results.chainReactions * 0.5);
        }
        
        return results;
    }
}