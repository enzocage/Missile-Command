// Audio System for 8-bit Sound Effects

class AudioManager {
    constructor() {
        this.enabled = true;
        this.volume = 0.5;
        this.audioContext = null;
        this.sounds = {};
        this.initialized = false;
        
        // Initialize on first user interaction
        this.initPromise = null;
    }
    
    async init() {
        if (this.initialized) return;
        
        try {
            // Create audio context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create master gain node
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            this.masterGain.gain.value = this.volume;
            
            // Generate 8-bit sounds
            this.generateSounds();
            
            this.initialized = true;
        } catch (error) {
            console.error('Failed to initialize audio:', error);
            this.enabled = false;
        }
    }
    
    generateSounds() {
        // Generate all game sounds using Web Audio API
        this.sounds = {
            launch: this.createLaunchSound(),
            explosion: this.createExplosionSound(),
            cityDestroyed: this.createCityDestroyedSound(),
            baseDestroyed: this.createBaseDestroyedSound(),
            waveComplete: this.createWaveCompleteSound(),
            gameOver: this.createGameOverSound(),
            warning: this.createWarningSound(),
            bonus: this.createBonusSound(),
            select: this.createSelectSound(),
            pause: this.createPauseSound()
        };
    }
    
    createLaunchSound() {
        return () => {
            if (!this.enabled || !this.audioContext) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.masterGain);
            
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.1);
        };
    }
    
    createExplosionSound() {
        return () => {
            if (!this.enabled || !this.audioContext) return;
            
            // Create noise buffer
            const bufferSize = this.audioContext.sampleRate * 0.2;
            const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
            const output = buffer.getChannelData(0);
            
            for (let i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1;
            }
            
            const noise = this.audioContext.createBufferSource();
            noise.buffer = buffer;
            
            const filter = this.audioContext.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(800, this.audioContext.currentTime);
            filter.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.2);
            
            const gainNode = this.audioContext.createGain();
            gainNode.gain.setValueAtTime(0.5, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
            
            noise.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.masterGain);
            
            noise.start(this.audioContext.currentTime);
            noise.stop(this.audioContext.currentTime + 0.2);
            
            // Add a low frequency thump
            const oscillator = this.audioContext.createOscillator();
            const oscGain = this.audioContext.createGain();
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(60, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(20, this.audioContext.currentTime + 0.1);
            
            oscGain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            oscGain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
            
            oscillator.connect(oscGain);
            oscGain.connect(this.masterGain);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.1);
        };
    }
    
    createCityDestroyedSound() {
        return () => {
            if (!this.enabled || !this.audioContext) return;
            
            // Descending alarm tone
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.masterGain);
            
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.5);
            
            gainNode.gain.setValueAtTime(0.4, this.audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.4, this.audioContext.currentTime + 0.4);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.5);
            
            // Add explosion
            setTimeout(() => this.sounds.explosion(), 100);
        };
    }
    
    createBaseDestroyedSound() {
        return () => {
            if (!this.enabled || !this.audioContext) return;
            
            // Lower pitched explosion
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.masterGain);
            
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(40, this.audioContext.currentTime + 0.3);
            
            gainNode.gain.setValueAtTime(0.4, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.3);
            
            // Add explosion
            this.sounds.explosion();
        };
    }
    
    createWaveCompleteSound() {
        return () => {
            if (!this.enabled || !this.audioContext) return;
            
            // Victory fanfare
            const notes = [523, 659, 784, 1047]; // C, E, G, C (higher octave)
            
            notes.forEach((freq, index) => {
                setTimeout(() => {
                    const oscillator = this.audioContext.createOscillator();
                    const gainNode = this.audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(this.masterGain);
                    
                    oscillator.type = 'square';
                    oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                    
                    gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
                    
                    oscillator.start(this.audioContext.currentTime);
                    oscillator.stop(this.audioContext.currentTime + 0.2);
                }, index * 100);
            });
        };
    }
    
    createGameOverSound() {
        return () => {
            if (!this.enabled || !this.audioContext) return;
            
            // Classic arcade death sound
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.masterGain);
            
            oscillator.type = 'square';
            
            // Descending tones
            const startFreq = 400;
            const endFreq = 50;
            
            oscillator.frequency.setValueAtTime(startFreq, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(endFreq, this.audioContext.currentTime + 1);
            
            gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime + 0.8);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 1);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 1);
        };
    }
    
    createWarningSound() {
        return () => {
            if (!this.enabled || !this.audioContext) return;
            
            // Beeping alert
            for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                    const oscillator = this.audioContext.createOscillator();
                    const gainNode = this.audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(this.masterGain);
                    
                    oscillator.type = 'square';
                    oscillator.frequency.setValueAtTime(880, this.audioContext.currentTime);
                    
                    gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
                    
                    oscillator.start(this.audioContext.currentTime);
                    oscillator.stop(this.audioContext.currentTime + 0.1);
                }, i * 150);
            }
        };
    }
    
    createBonusSound() {
        return () => {
            if (!this.enabled || !this.audioContext) return;
            
            // Coin collection sound
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.masterGain);
            
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(988, this.audioContext.currentTime);
            oscillator.frequency.setValueAtTime(1319, this.audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.2);
        };
    }
    
    createSelectSound() {
        return () => {
            if (!this.enabled || !this.audioContext) return;
            
            // Menu select sound
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.masterGain);
            
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
            oscillator.frequency.setValueAtTime(880, this.audioContext.currentTime + 0.05);
            
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.1);
        };
    }
    
    createPauseSound() {
        return () => {
            if (!this.enabled || !this.audioContext) return;
            
            // Pause sound
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.masterGain);
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(523, this.audioContext.currentTime);
            oscillator.frequency.setValueAtTime(392, this.audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.2);
        };
    }
    
    // Ambient radar ping
    startRadarPing() {
        if (!this.enabled || !this.audioContext) return;
        
        this.radarInterval = setInterval(() => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.masterGain);
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(1500, this.audioContext.currentTime);
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.05, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.5);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.5);
        }, 2000);
    }
    
    stopRadarPing() {
        if (this.radarInterval) {
            clearInterval(this.radarInterval);
            this.radarInterval = null;
        }
    }
    
    // Play a sound
    play(soundName) {
        if (!this.initialized) {
            this.init().then(() => {
                if (this.sounds[soundName]) {
                    this.sounds[soundName]();
                }
            });
        } else if (this.sounds[soundName]) {
            this.sounds[soundName]();
        }
    }
    
    // Set volume
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        if (this.masterGain) {
            this.masterGain.gain.value = this.volume;
        }
    }
    
    // Toggle mute
    toggleMute() {
        this.enabled = !this.enabled;
        if (this.masterGain) {
            this.masterGain.gain.value = this.enabled ? this.volume : 0;
        }
    }
}

// Global audio instance
const audioManager = new AudioManager();