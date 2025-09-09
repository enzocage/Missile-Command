// Input Handling System

class InputManager {
    constructor(canvas, game) {
        this.canvas = canvas;
        this.game = game;
        
        // Mouse state
        this.mouseX = 0;
        this.mouseY = 0;
        this.mouseDown = false;
        
        // Keyboard state
        this.keys = {};
        
        // Touch support
        this.touchActive = false;
        this.touchId = null;
        
        // Input enabled flag
        this.enabled = true;
        
        // Initialize event listeners
        this.initEventListeners();
    }
    
    initEventListeners() {
        // Mouse events
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        
        // Keyboard events
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // Prevent default touch behaviors
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
        }, { passive: false });
    }
    
    getCanvasCoordinates(clientX, clientY) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
    }
    
    handleMouseMove(event) {
        if (!this.enabled) return;
        
        const coords = this.getCanvasCoordinates(event.clientX, event.clientY);
        this.mouseX = coords.x;
        this.mouseY = coords.y;
        
        // Update crosshair position
        if (this.game && this.game.crosshair) {
            this.game.crosshair.x = this.mouseX;
            this.game.crosshair.y = this.mouseY;
        }
    }
    
    handleMouseDown(event) {
        if (!this.enabled) return;
        
        event.preventDefault();
        
        const coords = this.getCanvasCoordinates(event.clientX, event.clientY);
        this.mouseX = coords.x;
        this.mouseY = coords.y;
        this.mouseDown = true;
        
        // Fire missile on left click
        if (event.button === 0) {
            if (this.game && this.game.state === 'playing') {
                this.game.fireMissile(this.mouseX, this.mouseY);
            }
        }
    }
    
    handleMouseUp(event) {
        if (!this.enabled) return;
        
        this.mouseDown = false;
    }
    
    handleTouchStart(event) {
        if (!this.enabled) return;
        
        event.preventDefault();
        
        if (event.touches.length > 0) {
            const touch = event.touches[0];
            const coords = this.getCanvasCoordinates(touch.clientX, touch.clientY);
            
            this.touchActive = true;
            this.touchId = touch.identifier;
            this.mouseX = coords.x;
            this.mouseY = coords.y;
            
            // Update crosshair
            if (this.game && this.game.crosshair) {
                this.game.crosshair.x = this.mouseX;
                this.game.crosshair.y = this.mouseY;
            }
            
            // Fire missile on touch
            if (this.game && this.game.state === 'playing') {
                this.game.fireMissile(this.mouseX, this.mouseY);
            }
        }
    }
    
    handleTouchMove(event) {
        if (!this.enabled || !this.touchActive) return;
        
        event.preventDefault();
        
        for (let i = 0; i < event.touches.length; i++) {
            const touch = event.touches[i];
            if (touch.identifier === this.touchId) {
                const coords = this.getCanvasCoordinates(touch.clientX, touch.clientY);
                this.mouseX = coords.x;
                this.mouseY = coords.y;
                
                // Update crosshair
                if (this.game && this.game.crosshair) {
                    this.game.crosshair.x = this.mouseX;
                    this.game.crosshair.y = this.mouseY;
                }
                break;
            }
        }
    }
    
    handleTouchEnd(event) {
        if (!this.enabled) return;
        
        event.preventDefault();
        
        for (let i = 0; i < event.changedTouches.length; i++) {
            const touch = event.changedTouches[i];
            if (touch.identifier === this.touchId) {
                this.touchActive = false;
                this.touchId = null;
                break;
            }
        }
    }
    
    handleKeyDown(event) {
        if (!this.enabled) return;
        
        // Prevent default for game keys
        if (['Space', 'Escape', '1', '2', '3', 'KeyM', 'KeyP'].includes(event.code)) {
            event.preventDefault();
        }
        
        this.keys[event.code] = true;
        
        // Handle specific key actions
        if (this.game) {
            switch(event.code) {
                case 'Space':
                    if (this.game.state === 'playing') {
                        this.game.pause();
                    } else if (this.game.state === 'paused') {
                        this.game.resume();
                    }
                    break;
                
                case 'Escape':
                    if (this.game.state === 'playing' || this.game.state === 'paused') {
                        this.game.returnToMenu();
                    }
                    break;
                
                case 'Digit1':
                case 'Numpad1':
                    if (this.game.state === 'playing') {
                        this.game.fireMissileFromBase(0, this.mouseX, this.mouseY);
                    }
                    break;
                
                case 'Digit2':
                case 'Numpad2':
                    if (this.game.state === 'playing') {
                        this.game.fireMissileFromBase(1, this.mouseX, this.mouseY);
                    }
                    break;
                
                case 'Digit3':
                case 'Numpad3':
                    if (this.game.state === 'playing') {
                        this.game.fireMissileFromBase(2, this.mouseX, this.mouseY);
                    }
                    break;
                
                case 'KeyM':
                    audioManager.toggleMute();
                    break;
                
                case 'KeyP':
                    if (this.game.state === 'playing') {
                        this.game.pause();
                    } else if (this.game.state === 'paused') {
                        this.game.resume();
                    }
                    break;
            }
        }
    }
    
    handleKeyUp(event) {
        if (!this.enabled) return;
        
        this.keys[event.code] = false;
    }
    
    isKeyPressed(keyCode) {
        return this.keys[keyCode] || false;
    }
    
    enable() {
        this.enabled = true;
    }
    
    disable() {
        this.enabled = false;
        this.mouseDown = false;
        this.keys = {};
    }
    
    getCursorPosition() {
        return {
            x: this.mouseX,
            y: this.mouseY
        };
    }
}

// Button click handler for UI
class ButtonHandler {
    constructor() {
        this.buttons = new Map();
        this.init();
    }
    
    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupButtons());
        } else {
            this.setupButtons();
        }
    }
    
    setupButtons() {
        // Start screen buttons
        this.addButton('startButton', () => {
            if (window.game) {
                window.game.startGame();
                audioManager.play('select');
            }
        });
        
        this.addButton('highScoresButton', () => {
            if (window.game) {
                window.game.showHighScores();
                audioManager.play('select');
            }
        });
        
        // Game over screen buttons
        this.addButton('submitScore', () => {
            if (window.game) {
                const nameInput = document.getElementById('playerName');
                const name = nameInput.value.toUpperCase() || 'AAA';
                window.game.submitHighScore(name);
                audioManager.play('bonus');
            }
        });
        
        this.addButton('restartButton', () => {
            if (window.game) {
                window.game.startGame();
                audioManager.play('select');
            }
        });
        
        this.addButton('menuButton', () => {
            if (window.game) {
                window.game.returnToMenu();
                audioManager.play('select');
            }
        });
        
        // High scores screen
        this.addButton('backButton', () => {
            if (window.game) {
                window.game.returnToMenu();
                audioManager.play('select');
            }
        });
        
        // Pause screen
        this.addButton('resumeButton', () => {
            if (window.game) {
                window.game.resume();
                audioManager.play('select');
            }
        });
        
        this.addButton('quitButton', () => {
            if (window.game) {
                window.game.returnToMenu();
                audioManager.play('select');
            }
        });
    }
    
    addButton(id, handler) {
        const button = document.getElementById(id);
        if (button) {
            button.addEventListener('click', handler);
            this.buttons.set(id, handler);
        }
    }
    
    removeButton(id) {
        const button = document.getElementById(id);
        if (button && this.buttons.has(id)) {
            button.removeEventListener('click', this.buttons.get(id));
            this.buttons.delete(id);
        }
    }
}

// Initialize button handler
const buttonHandler = new ButtonHandler();