// ==========================================
// MAIN ENTRY POINT
// This is where the game starts
// ==========================================

// Import Three.js library
// ES Modules let us import only what we need
import * as THREE from 'three';

// Import game constants (from Phase 0)
import { COLORS, CAMERA_POSITION, CAMERA_TARGET, MOVE_INTERVAL, GRID_SIZE, CELL_SIZE } from './constants.js';

// Import grid module (new for Phase 2)
import { createGrid, gridToWorld, getCameraForFace, CUBE_FACES } from './grid.js';

// Import snake module (new for Phase 3)
import { createSnake } from './snake.js';

// Import input module (new for Phase 4)
import { createInputHandler } from './input.js';

// Import food module (new for Phase 5)
import { createFood } from './food.js';

// Import game module (new for Phase 6)
import { createGame } from './game.js';

// ==========================================
// STEP 1: Create the Scene
// Think of this as the 3D world where everything lives
// ==========================================
const scene = new THREE.Scene();
scene.background = new THREE.Color(COLORS.BACKGROUND);

// ==========================================
// STEP 2: Create the Camera
// This is like our eyes - it determines what we see
// ==========================================
const camera = new THREE.PerspectiveCamera(
    75,                                     // Field of view (how wide the camera sees)
    window.innerWidth / window.innerHeight, // Aspect ratio (match screen)
    0.1,                                    // Near clipping plane
    1000                                    // Far clipping plane
);

// Position camera directly in front of the cube for flat face view
// Camera stays static, cube rotates to show the active face
camera.position.set(0, 0, GRID_SIZE * CELL_SIZE * 2.2);  // Dynamic distance based on grid size
camera.lookAt(0, 0, 0);         // Looking at center of cube

// ==========================================
// CUBE ROTATION (Camera stays static, cube rotates)
// The cube rotates so the snake's current face is always facing camera
// ==========================================

const FACE_NORMALS = {
    [CUBE_FACES.FRONT]:  new THREE.Vector3( 0,  0,  1),
    [CUBE_FACES.BACK]:   new THREE.Vector3( 0,  0, -1),
    [CUBE_FACES.LEFT]:   new THREE.Vector3(-1,  0,  0),
    [CUBE_FACES.RIGHT]:  new THREE.Vector3( 1,  0,  0),
    [CUBE_FACES.TOP]:    new THREE.Vector3( 0,  1,  0),
    [CUBE_FACES.BOTTOM]: new THREE.Vector3( 0, -1,  0),
};

function getFaceQuaternion(face) {
    const normal = FACE_NORMALS[face];
    const cameraDir = new THREE.Vector3(0, 0, 1);
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(normal, cameraDir);
    return q;
}

let targetQuaternion = getFaceQuaternion(CUBE_FACES.FRONT);

function updateRotationTarget() {
    targetQuaternion = getFaceQuaternion(snake.getCurrentFace());
    console.log('Rotating to face:', snake.getCurrentFace(), '| target quaternion:', targetQuaternion);
}

function updateCubeRotation() {
    // Smoothly interpolate cube orientation using slerp (shortest path)
    grid.quaternion.slerp(targetQuaternion, 0.1);
}

// ==========================================
// STEP 3: Create the Renderer
// This draws the 3D scene onto the screen
// ==========================================
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio); // Makes it look sharp on all screens

// Add the renderer's canvas to the HTML page
document.getElementById('game-container').appendChild(renderer.domElement);

// ==========================================
// STEP 4: Add Lighting
// Without lights, everything would be pitch black
// ==========================================

// Brighter ambient light for better visibility
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

// Main directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
directionalLight.position.set(5, 10, 15);
scene.add(directionalLight);

// Additional point light to illuminate the cube from center
const pointLight = new THREE.PointLight(0xffffff, 0.5, 50);
pointLight.position.set(0, 0, 0);
scene.add(pointLight);

// Rim light from opposite side for definition
const rimLight = new THREE.DirectionalLight(0x88ccff, 0.4);
rimLight.position.set(-10, 5, -10);
scene.add(rimLight);

// ==========================================
// STEP 5: Create the Game Board
// This is the 15x15 grid where the snake will move
// ==========================================

const grid = createGrid();
// Initialize orientation with FRONT face
grid.quaternion.copy(getFaceQuaternion(CUBE_FACES.FRONT));
scene.add(grid);

// ==========================================
// STEP 6: Create the Snake
// The player-controlled character
// ==========================================

let snake = createSnake();
grid.add(snake.getMesh()); // Parent to grid for automatic rotation sync

// ==========================================
// STEP 7: Create Food
// Red cube the snake eats to grow
// ==========================================

let food = createFood();
grid.add(food.getMesh()); // Parent to grid for automatic rotation sync
food.spawn(snake.getBodyPositions());

// ==========================================
// STEP 8: Set Up Input Handling
// Listen for keyboard to control the snake
// ==========================================

const input = createInputHandler(
    (direction) => {
        snake.setDirection(direction);
        console.log('Direction changed to:', direction);
    },
    () => snake.getCurrentFace()  // Callback to get current face for screen-relative controls
);

// ==========================================
// SCORE TRACKING & HIGH SCORE
// ==========================================
let score = 0;
let highScore = 0;
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const gameOverScreen = document.getElementById('game-over');
const finalScoreElement = document.getElementById('final-score');
const gameOverHighScoreElement = document.getElementById('high-score-display');

// Load high score from localStorage on startup
function loadHighScore() {
    const saved = localStorage.getItem('snake3d_highscore');
    if (saved !== null) {
        highScore = parseInt(saved, 10);
        updateHighScoreDisplay();
    }
}

// Save high score to localStorage
function saveHighScore() {
    localStorage.setItem('snake3d_highscore', highScore.toString());
}

function updateScore(points) {
    score += points;
    scoreElement.textContent = `Score: ${score}`;
}

function updateHighScoreDisplay() {
    highScoreElement.textContent = `High Score: ${highScore}`;
}

function checkAndUpdateHighScore() {
    if (score > highScore) {
        highScore = score;
        saveHighScore();
        updateHighScoreDisplay();
        console.log('New high score!', highScore);
        return true; // New high score achieved
    }
    return false;
}

function showGameOver() {
    // Update final score display
    finalScoreElement.textContent = `Final Score: ${score}`;
    gameOverHighScoreElement.textContent = `High Score: ${highScore}`;
    
    // Check for new high score
    const isNewHighScore = checkAndUpdateHighScore();
    if (isNewHighScore) {
        gameOverHighScoreElement.textContent = `🎉 New High Score: ${highScore} 🎉`;
        gameOverHighScoreElement.style.color = '#22c55e';
    } else {
        gameOverHighScoreElement.style.color = '#fbbf24';
    }
    
    gameOverScreen.classList.remove('hidden');
}

function hideGameOver() {
    gameOverScreen.classList.add('hidden');
}

// Load high score when game starts
loadHighScore();

// ==========================================
// GAME STATE MANAGEMENT
// ==========================================

const game = createGame((reason) => {
    console.log('Game Over:', reason);
    showGameOver();
    stopGame();
});

// ==========================================
// STEP 8: Game Loop with Movement
// Move the snake at regular intervals
// ==========================================

let moveTimer = null;

function startGame() {
    console.log('Game started! Use arrow keys or WASD to control the snake.');
    console.log('Eat the red food to grow!');
    console.log('Avoid hitting walls and yourself!');
    
    game.start();
    hideGameOver();
    
    // Move the snake every MOVE_INTERVAL milliseconds
    moveTimer = setInterval(() => {
        // Only move if game is active
        if (!game.isActive()) {
            return;
        }
        
        const newHead = snake.move();
        
        // Update rotation target immediately after move
        updateRotationTarget();
        
        // Check for self collision only (walls are disabled in cube mode)
        if (game.checkCollisions(snake)) {
            return; // Game over happened
        }
        
        // Check if snake ate the food (must be on same face)
        if (food.checkCollision(newHead)) {
            console.log('Yum! Snake ate food on face', newHead.face);
            
            // Grow the snake
            snake.grow();
            
            // Increase score (10 points per food)
            updateScore(10);
            
            // Spawn new food on the face the snake is currently on
            food.spawn(snake.getBodyPositions());
        }
        
        console.log('Snake moved. Head at:', newHead, 'Face:', snake.getCurrentFace());
    }, MOVE_INTERVAL);
}

function restartGame() {
    console.log('Restarting game...');
    
    // Stop current game
    stopGame();
    
    // Reset game state
    game.reset();
    score = 0;
    updateScore(0);
    hideGameOver();
    
    // Reset high score display color
    gameOverHighScoreElement.style.color = '#fbbf24';
    
    // Remove old snake and food from grid (not scene directly)
    grid.remove(snake.getMesh());
    grid.remove(food.getMesh());
    
    // Create new snake and food
    snake = createSnake();
    food = createFood();
    
    // Add to grid
    grid.add(snake.getMesh());
    grid.add(food.getMesh());
    food.spawn(snake.getBodyPositions());
    
    // Update window reference
    window.snake = snake;
    window.food = food;
    
    // Start fresh
    startGame();
}

function stopGame() {
    if (moveTimer) {
        clearInterval(moveTimer);
        moveTimer = null;
    }
}

// ==========================================
// RESTART KEYBOARD HANDLER
// ==========================================

window.addEventListener('keydown', (event) => {
    if (event.key.toLowerCase() === 'r' && game.isOver()) {
        restartGame();
    }
});

// ==========================================
// STEP 6: Animation Loop
// This runs continuously, updating the scene
// ==========================================

function animate() {
    // Request next frame (runs 60 times per second)
    requestAnimationFrame(animate);
    
    // Update cube rotation to show current face (camera stays static)
    if (game && game.isActive()) {
        updateCubeRotation();
    }
    
    // Render the scene from the camera's perspective
    renderer.render(scene, camera);
}

// ==========================================
// STEP 7: Handle Window Resize
// Make the game responsive
// ==========================================

window.addEventListener('resize', () => {
    // Update camera aspect ratio
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    
    // Update renderer size
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ==========================================
// START THE GAME!
// ==========================================
console.log('3D Snake Game - Phase 7: UI Polish & High Score');
console.log('Camera position:', camera.position);
console.log('Scene objects:', scene.children.length);
console.log('Grid created:', grid.children.length, 'elements');
console.log('Snake length:', snake.getLength());
console.log('Snake head at:', snake.getHeadPosition());
console.log('Food position:', food.getPosition());
console.log('High Score:', highScore);

// Make objects available in console for debugging
window.snake = snake;
window.input = input;
window.food = food;
window.game = game;

// Begin the animation loop
animate();

// Start the game loop (snake begins moving!)
startGame();
