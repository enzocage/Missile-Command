# Neon Command - Retro Missile Command Clone

A faithful recreation of the classic 1980 Atari Missile Command arcade game, built with modern web technologies and authentic 80s aesthetics.

![Neon Command Gameplay](https://via.placeholder.com/800x400/000000/00ffff?text=Neon+Command+Screenshot)

## 🎮 Play the Game

[Play Neon Command](https://enzocage.github.io/Missile-Command/)

## 🎯 Game Features

### Classic Gameplay
- **Defend Cities**: Protect 6 cities from incoming ballistic missiles
- **3 Missile Bases**: Left, Center, and Right bases with 10 missiles each
- **Progressive Difficulty**: Waves increase in speed and missile quantity
- **Smart Bombs**: Advanced missiles that split into multiple warheads
- **Chain Reactions**: Explosions can destroy multiple missiles for bonus points

### Visual Design
- **Neon Vector Graphics**: Authentic 80s arcade aesthetic with glowing effects
- **Retro Color Palette**: Cyan, magenta, and green with neon glow
- **Particle Effects**: Explosive impacts with retro pixel particles
- **Screen Effects**: CRT scanlines and screen shake on impacts
- **Smooth Animations**: 60 FPS gameplay with fluid missile trails

### Audio Experience
- **8-bit Sound Effects**: Generated using Web Audio API
- **Authentic Sounds**: Missile launches, explosions, and arcade alerts
- **Ambient Audio**: Subtle radar ping and tension-building music
- **Sound Toggle**: M key to mute/unmute

### Game Systems
- **Scoring System**: Points for destroyed missiles, chain reactions, and perfect waves
- **High Score Table**: Local storage with top 10 scores
- **Wave Progression**: Increasing difficulty with new missile types
- **Pause Functionality**: Spacebar or P to pause/resume
- **Responsive Controls**: Mouse, touch, and keyboard support

## 🎮 Controls

| Control | Action |
|---------|--------|
| **Mouse/Touch** | Aim crosshair and fire |
| **Left Click/Tap** | Fire from nearest base |
| **1, 2, 3** | Fire from specific base (L/C/R) |
| **Spacebar** | Pause/Resume game |
| **ESC** | Return to main menu |
| **M** | Toggle sound on/off |
| **P** | Alternative pause key |

## 🏗️ Technical Architecture

### Built With
- **Vanilla JavaScript ES6+**: No external dependencies
- **HTML5 Canvas**: Hardware-accelerated 2D rendering
- **Web Audio API**: Procedural sound generation
- **Local Storage**: High score persistence
- **CSS3**: Retro neon styling and animations

### Project Structure
```
neon-command/
├── index.html          # Main game page
├── styles.css          # Retro neon styling
├── js/
│   ├── game.js        # Main game loop and state management
│   ├── entities.js    # Game objects (missiles, cities, bases)
│   ├── physics.js     # Collision detection system
│   ├── renderer.js    # Vector graphics rendering
│   ├── audio.js       # Sound effects generation
│   ├── input.js       # Input handling system
│   └── ui.js          # UI and menu management
└── README.md          # This file
```

### Key Systems
- **Entity Component System**: Modular game object management
- **Spatial Partitioning**: Optimized collision detection
- **State Machine**: Clean game state transitions
- **Object Pooling**: Performance optimization for particles
- **Event-Driven Architecture**: Decoupled system communication

## 🎯 Game Mechanics

### Missile Types
- **Basic Missiles**: Standard enemy projectiles (25 points)
- **Smart Bombs**: Split into 3 warheads mid-flight (50 points)
- **Cruise Missiles**: Change direction once (75 points)

### Scoring
- Enemy missile destroyed: 25-75 points (based on type)
- Chain reaction bonus: 50 points × multiplier
- City survived: 100 points × current wave
- Base survived: 50 points × current wave
- Perfect wave bonus: 500 points

### Difficulty Scaling
- **Wave 1-3**: Basic missiles only, slow speed
- **Wave 4-6**: Introduce smart bombs, medium speed
- **Wave 7-10**: Mix of missiles, faster speed
- **Wave 11+**: All types, maximum speed, quantity increases

## 🚀 Development

### Prerequisites
- Modern web browser with HTML5 Canvas support
- Web Audio API support (most modern browsers)

### Local Development
```bash
# Clone the repository
git clone https://github.com/enzocage/Missile-Command.git
cd Missile-Command

# Open in browser
open index.html
```

### Browser Compatibility
- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🎮 Credits

- **Original Game**: Missile Command by Atari (1980)
- **Development**: Built with modern web technologies
- **Inspiration**: Classic arcade gaming era
- **Font**: Orbitron (Google Fonts)

## 🎯 Contributing

Feel free to submit issues and enhancement requests!

---

**Enjoy defending your cities in Neon Command! 🚀**