// ==========================================
// MAIN ENTRY POINT
// This is where the game starts
// ==========================================

// Import Three.js library
// ES Modules let us import only what we need
import * as THREE from 'three';

// Import game constants (from Phase 0)
import { COLORS, CAMERA_POSITION, CAMERA_TARGET } from './constants.js';

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

// Ambient light - soft overall illumination (like daylight)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

// Directional light - like the sun, creates shadows
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(10, 20, 10);
scene.add(directionalLight);

// ==========================================
// STEP 5: Create a Test Cube (Our First 3D Object!)
// This proves everything is working
// ==========================================

// Geometry = the shape (a box)
const geometry = new THREE.BoxGeometry(1, 1, 1);

// Material = the appearance (color)
const material = new THREE.MeshStandardMaterial({ 
    color: COLORS.SNAKE_HEAD 
});

// Mesh = Geometry + Material (the actual object)
const cube = new THREE.Mesh(geometry, material);

// Position it at the center of our grid
cube.position.set(0, 0, 0);

// Add it to the scene
scene.add(cube);

// ==========================================
// STEP 6: Animation Loop
// This runs continuously, updating the scene
// ==========================================

function animate() {
    // Request next frame (runs 60 times per second)
    requestAnimationFrame(animate);
    
    // Rotate the cube so we can see it's 3D
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    
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
console.log('3D Snake Game - Initializing...');
console.log('Camera position:', camera.position);
console.log('Scene objects:', scene.children.length);

// Begin the animation loop
animate();
