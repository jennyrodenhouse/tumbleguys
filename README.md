# 🎮 Tumble Guys - 3D Obstacle Course Game

A fun, physics-based 3D obstacle course game inspired by Fall Guys and Stumble Guys. Navigate through challenging obstacles, avoid falling platforms, dodge spinning barriers, and race to the finish line!

## 🎯 Features

### Core Gameplay
- **3D Physics-Based Movement** - Realistic physics using Cannon.js
- **Third-Person Camera** - Smooth camera that follows the player
- **Mouse Look Controls** - Full camera control with pointer lock
- **Multiple Obstacle Types** - Variety of challenges to overcome

### Obstacle Types
1. **Rotating Platforms** - Platforms that spin, making it harder to maintain balance
2. **Moving Obstacles** - Barriers that slide back and forth
3. **Falling Platforms** - Platforms that fall away when stepped on
4. **Spinning Windmills** - Rotating obstacles that knock you off
5. **Narrow Bridges** - Test your precision
6. **Jump Sections** - Multi-platform jumping challenges
7. **Slalom Sections** - Navigate around stationary obstacles

### Game Features
- **Checkpoint System** - 3 checkpoints to track progress
- **Timer** - Race against the clock
- **Respawn System** - Quick respawn with 'R' key
- **Win Condition** - Reach the finish line to complete the course
- **Colorful Graphics** - Vibrant, Fall Guys-inspired visuals
- **Dynamic Lighting** - Real-time shadows and lighting effects

## 🎮 Controls

| Key | Action |
|-----|--------|
| **W** or **↑** | Move Forward |
| **S** or **↓** | Move Backward |
| **A** or **←** | Move Left |
| **D** or **→** | Move Right |
| **SPACE** | Jump |
| **R** | Respawn at Start |
| **Mouse** | Look Around (after clicking) |

## 🚀 How to Play

1. **Open the Game**
   - Simply open `index.html` in a modern web browser
   - Chrome, Firefox, Edge, or Safari recommended

2. **Start Playing**
   - Click "START GAME" button
   - Click anywhere on the screen to lock the pointer
   - Use WASD or Arrow keys to move
   - Use SPACE to jump
   - Use Mouse to look around

3. **Complete the Course**
   - Navigate through all obstacles
   - Pass through 3 checkpoints (yellow rings)
   - Reach the green finish platform
   - Try to get the best time!

## 🛠️ Technical Details

### Technologies Used
- **Three.js** (r128) - 3D graphics rendering
- **Cannon.js** (0.6.2) - Physics engine
- **Vanilla JavaScript** - Game logic
- **HTML5 & CSS3** - UI and styling

### Game Architecture
```
├── index.html          # Main HTML structure
├── style.css           # Styling and UI
├── game.js             # Core game logic
│   ├── Three.js Setup
│   ├── Cannon.js Physics
│   ├── Player Controller
│   ├── Obstacle System
│   ├── Camera System
│   └── Game State Management
└── README.md           # Documentation
```

### Key Components

**Scene Setup**
- Sky blue background with fog effect
- Directional lighting with shadows
- Ambient lighting for overall illumination

**Physics World**
- Gravity: -30 m/s² (stronger than real gravity for game feel)
- Contact materials for friction and bounce
- Kinematic bodies for moving obstacles

**Player Character**
- Sphere-based physics body
- Mass: 5 units
- Linear and angular damping for realistic movement
- Respawn system when falling off

**Obstacle System**
- Static platforms
- Rotating platforms (configurable speed)
- Moving obstacles (kinematic bodies)
- Falling platforms (trigger-based)
- Spinning obstacles (circular motion)

## 🎨 Visual Design

The game features a colorful, vibrant aesthetic inspired by Fall Guys:
- **Player**: Bright red sphere
- **Platforms**: Green (safe), yellow (challenge), blue (jumps), orange (falling)
- **Obstacles**: Red and purple
- **Checkpoints**: Golden rings
- **Finish Line**: Glowing green platform

## 🔧 Customization

You can easily customize the game by modifying `game.js`:

### Adjust Player Settings
```javascript
const PLAYER_SPEED = 8;     // Movement speed
const JUMP_FORCE = 12;      // Jump height
```

### Create New Obstacles
```javascript
// Add to createWorld() function
createRotatingPlatform(x, y, z, width, height, depth, color, speed);
createMovingObstacle(x, y, z, width, height, depth, color, range);
createFallingPlatform(x, y, z, width, height, depth, color);
```

### Modify Physics
```javascript
world.gravity.set(0, -30, 0);  // Adjust gravity
playerBody.mass = 5;            // Adjust player mass
```

## 🌐 Browser Compatibility

- ✅ Chrome (Recommended)
- ✅ Firefox
- ✅ Edge
- ✅ Safari
- ✅ Opera

**Note**: Requires WebGL support and pointer lock API

## 📱 Performance

- Optimized for desktop browsers
- 60 FPS target
- Shadow mapping enabled
- Efficient physics calculations
- Responsive design

## 🎓 Learning Resources

This game demonstrates:
- 3D graphics programming with Three.js
- Physics simulation with Cannon.js
- Game state management
- User input handling (keyboard + mouse)
- Pointer Lock API
- Animation loops
- Collision detection
- Camera systems

## 🐛 Troubleshooting

**Game won't start**
- Make sure you're using a modern browser
- Check browser console for errors
- Ensure internet connection (for CDN libraries)

**Performance issues**
- Close other browser tabs
- Lower graphics quality in browser settings
- Try a different browser

**Controls not working**
- Click on the game screen to activate pointer lock
- Check if caps lock is on
- Try refreshing the page

## 🎯 Future Enhancements

Possible additions:
- Multiplayer support
- More obstacle types
- Different levels/maps
- Power-ups and special abilities
- Leaderboard system
- Sound effects and music
- Mobile touch controls
- Character customization
- Time trials mode

## 📄 License

This is a fun educational project. Feel free to use and modify!

## 🎉 Credits

Inspired by:
- **Fall Guys** - Mediatonic
- **Stumble Guys** - Kitka Games

Created with ❤️ using Three.js and Cannon.js

---

**Have fun playing Tumble Guys! Try to beat your best time!** 🏆
