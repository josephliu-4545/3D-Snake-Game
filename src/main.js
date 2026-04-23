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
import { createGrid, gridToWorld, getCameraForFace } from './grid.js';

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

// Position the camera using our constants
camera.position.set(CAMERA_POSITION.x, CAMERA_POSITION.y, CAMERA_POSITION.z);
camera.lookAt(CAMERA_TARGET.x, CAMERA_TARGET.y, CAMERA_TARGET.z);

// ==========================================
// CAMERA FOLLOWING SNAKE
// Camera rotates around the cube to follow snake
// ==========================================

function updateCamera() {
    const headPos = snake.getHeadPosition();
    const currentFace = snake.getCurrentFace();
    
    // Get camera position for current face
    const cameraSettings = getCameraForFace(currentFace);
    
    // Smoothly interpolate camera position (faster for better responsiveness)
    camera.position.x += (cameraSettings.position.x - camera.position.x) * 0.1;
    camera.position.y += (cameraSettings.position.y - camera.position.y) * 0.1;
    camera.position.z += (cameraSettings.position.z - camera.position.z) * 0.1;
    
    // Get snake head world position
    const worldPos = gridToWorld(headPos.x, headPos.y, headPos.face);
    
    // Look at snake head instead of center
    camera.lookAt(worldPos.x, worldPos.y, worldPos.z);
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
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
directionalLight.position.set(15, 25, 15);
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
scene.add(grid);

// ==========================================
// STEP 6: Create the Snake
// The player-controlled character
// ==========================================

let snake = createSnake();
scene.add(snake.getMesh());

// ==========================================
// STEP 7: Create Food
// Red cube the snake eats to grow
// ==========================================

let food = createFood();
scene.add(food.getMesh());

// Spawn first food (avoid snake's starting position)
food.spawn(snake.getBodyPositions());

// ==========================================
// STEP 8: Set Up Input Handling
// Listen for keyboard to control the snake
// ==========================================

const input = createInputHandler((direction) => {
    snake.setDirection(direction);
    console.log('Direction changed to:', direction);
});

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
    
    // Remove old snake and food from scene
    scene.remove(snake.getMesh());
    scene.remove(food.getMesh());
    
    // Create new snake and food
    snake = createSnake();
    food = createFood();
    
    // Add to scene
    scene.add(snake.getMesh());
    scene.add(food.getMesh());
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
    
    // Update camera to follow snake (only when game is active)
    if (game && game.isActive()) {
        updateCamera();
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
