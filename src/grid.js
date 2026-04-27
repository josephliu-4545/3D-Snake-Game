// ==========================================
// GRID MODULE
// Creates and manages the game board
// ==========================================

import * as THREE from 'three';
import { GRID_SIZE, CELL_SIZE, COLORS } from './constants.js';

console.assert(typeof GRID_SIZE === 'number', 'GRID_SIZE is not a number:', GRID_SIZE);
console.assert(typeof CELL_SIZE === 'number', 'CELL_SIZE is not a number:', CELL_SIZE);

/**
 * Creates the game board (a flat platform with grid lines)
 * Returns a THREE.Group containing all grid elements
 */
export function createGrid() {
    const gridGroup = new THREE.Group();
    
    const cubeSize = GRID_SIZE * CELL_SIZE;
    const halfSize = cubeSize / 2;
    
    // Flat materials for faces
    const faceMaterial = new THREE.MeshStandardMaterial({
        color: 0x1e293b,  // Dark slate flat color
        roughness: 0.7,
        metalness: 0.1,
        emissive: 0x1e293b,
        emissiveIntensity: 0.2
    });

    const planeGeometry = new THREE.PlaneGeometry(cubeSize, cubeSize);
    
    // Position and orientation for each face
    const faceConfigs = [
        { face: CUBE_FACES.FRONT,  pos: [0, 0, halfSize],  rot: [0, 0, 0] },
        { face: CUBE_FACES.BACK,   pos: [0, 0, -halfSize], rot: [0, Math.PI, 0] },
        { face: CUBE_FACES.LEFT,   pos: [-halfSize, 0, 0], rot: [0, -Math.PI / 2, 0] },
        { face: CUBE_FACES.RIGHT,  pos: [halfSize, 0, 0],  rot: [0, Math.PI / 2, 0] },
        { face: CUBE_FACES.TOP,    pos: [0, halfSize, 0],  rot: [-Math.PI / 2, 0, 0] },
        { face: CUBE_FACES.BOTTOM, pos: [0, -halfSize, 0], rot: [Math.PI / 2, 0, 0] }
    ];

    const lineMaterial = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.2
    });

    faceConfigs.forEach(config => {
        // Add face plane
        const plane = new THREE.Mesh(planeGeometry, faceMaterial);
        plane.position.set(...config.pos);
        plane.rotation.set(...config.rot);
        gridGroup.add(plane);

        // Add grid lines for this face
        const points = [];
        const epsilon = 0.01; // Tiny offset to prevent z-fighting

        for (let i = 0; i <= GRID_SIZE; i++) {
            const offset = -halfSize + (i * CELL_SIZE);
            
            // Horizontal lines
            points.push(new THREE.Vector3(-halfSize, offset, epsilon));
            points.push(new THREE.Vector3(halfSize, offset, epsilon));
            
            // Vertical lines
            points.push(new THREE.Vector3(offset, -halfSize, epsilon));
            points.push(new THREE.Vector3(offset, halfSize, epsilon));
        }

        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const gridLines = new THREE.LineSegments(lineGeometry, lineMaterial);
        
        // Match plane's position and rotation
        gridLines.position.set(...config.pos);
        gridLines.rotation.set(...config.rot);
        gridGroup.add(gridLines);
    });

    return gridGroup;
}

/**
 * CUBE FACE DEFINITIONS
 * 6 faces of the cube: FRONT, BACK, LEFT, RIGHT, TOP, BOTTOM
 */
export const CUBE_FACES = {
    FRONT: 0,   // +Z face
    BACK: 1,    // -Z face
    LEFT: 2,    // -X face
    RIGHT: 3,   // +X face
    TOP: 4,     // +Y face
    BOTTOM: 5   // -Y face
};

/**
 * Converts 2D grid coordinates on a specific cube face to 3D world coordinates
 * Includes a protrusion offset so objects sit on the face surface.
 * 
 * @param {number} gridX - X position on face (0 to GRID_SIZE-1)
 * @param {number} gridY - Y position on face (0 to GRID_SIZE-1)
 * @param {number} face - Which cube face (use CUBE_FACES constants)
 * @returns {Object} {x, y, z} world coordinates
 */
export function gridToWorld(gridX, gridY, face = CUBE_FACES.FRONT) {
    const halfSize = (GRID_SIZE * CELL_SIZE) / 2;
    const offset = -halfSize + (CELL_SIZE / 2);
    
    // Calculate position on the face (2D grid to 3D)
    const localX = (gridX * CELL_SIZE) + offset;
    const localY = -((gridY * CELL_SIZE) + offset); // Flipped: lower gridY (UP) -> higher worldY
    
    // Position on cube surface with protrusion baked in
    // Protrusion increased to 0.8 so it sits clearly ON the surface
    const protrusion = CELL_SIZE * 0.8; 
    const surfaceOffset = halfSize + protrusion;
    
    switch (face) {
        case CUBE_FACES.FRONT:  // +Z face
            return { x: localX, y: localY, z: surfaceOffset };
        case CUBE_FACES.BACK:   // -Z face
            return { x: -localX, y: localY, z: -surfaceOffset };
        case CUBE_FACES.LEFT:   // -X face
            return { x: -surfaceOffset, y: localY, z: -localX };
        case CUBE_FACES.RIGHT:  // +X face
            return { x: surfaceOffset, y: localY, z: localX };
        case CUBE_FACES.TOP:    // +Y face
            // For TOP face, screen UP moves toward BACK of cube (-Z)
            // localY maps to Z axis here
            return { x: localX, y: surfaceOffset, z: localY };
        case CUBE_FACES.BOTTOM: // -Y face
            // For BOTTOM face, screen UP moves toward FRONT of cube (+Z)
            return { x: localX, y: -surfaceOffset, z: -localY };
        default:
            return { x: localX, y: localY, z: surfaceOffset };
    }
}

/**
 * Wraps snake position when it goes off a face edge
 * Returns the new position and face after wrapping
 * 
 * @param {number} x - Current X on face
 * @param {number} y - Current Y on face
 * @param {number} face - Current face
 * @param {string} direction - Movement direction
 * @returns {Object} {x, y, face, wrapped} new position info
 */
export function wrapPosition(x, y, face, direction) {
    let newX = x;
    let newY = y;
    let newFace = face;
    let wrapped = false;
    
    // Out of bounds check
    if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) {
        wrapped = true;
        
        switch (face) {
            case CUBE_FACES.FRONT:
                if (x < 0) { newFace = CUBE_FACES.LEFT; newX = GRID_SIZE - 1; }
                else if (x >= GRID_SIZE) { newFace = CUBE_FACES.RIGHT; newX = 0; }
                else if (y < 0) { newFace = CUBE_FACES.BOTTOM; newY = GRID_SIZE - 1; }
                else if (y >= GRID_SIZE) { newFace = CUBE_FACES.TOP; newY = 0; }
                break;
            case CUBE_FACES.BACK:
                if (x < 0) { newFace = CUBE_FACES.RIGHT; newX = GRID_SIZE - 1; }
                else if (x >= GRID_SIZE) { newFace = CUBE_FACES.LEFT; newX = 0; }
                else if (y < 0) { newFace = CUBE_FACES.BOTTOM; newY = 0; newX = GRID_SIZE - 1 - x; } // Twisted wrap
                else if (y >= GRID_SIZE) { newFace = CUBE_FACES.TOP; newY = GRID_SIZE - 1; }
                break;
            case CUBE_FACES.LEFT:
                if (x < 0) { newFace = CUBE_FACES.BACK; newX = GRID_SIZE - 1; }
                else if (x >= GRID_SIZE) { newFace = CUBE_FACES.FRONT; newX = 0; }
                else if (y < 0) { newFace = CUBE_FACES.BOTTOM; newX = 0; newY = x; } // Coordinate rotation
                else if (y >= GRID_SIZE) { newFace = CUBE_FACES.TOP; newX = 0; newY = GRID_SIZE - 1 - x; }
                break;
            case CUBE_FACES.RIGHT:
                if (x < 0) { newFace = CUBE_FACES.FRONT; newX = GRID_SIZE - 1; }
                else if (x >= GRID_SIZE) { newFace = CUBE_FACES.BACK; newX = 0; }
                else if (y < 0) { newFace = CUBE_FACES.BOTTOM; newX = GRID_SIZE - 1; newY = GRID_SIZE - 1 - x; }
                else if (y >= GRID_SIZE) { newFace = CUBE_FACES.TOP; newX = GRID_SIZE - 1; newY = x; }
                break;
            case CUBE_FACES.TOP:
                if (x < 0) { newFace = CUBE_FACES.LEFT; y = GRID_SIZE - 1; x = GRID_SIZE - 1 - y; }
                else if (x >= GRID_SIZE) { newFace = CUBE_FACES.RIGHT; y = GRID_SIZE - 1; x = y; }
                else if (y < 0) { newFace = CUBE_FACES.FRONT; newY = GRID_SIZE - 1; }
                else if (y >= GRID_SIZE) { newFace = CUBE_FACES.BACK; newY = GRID_SIZE - 1; }
                break;
            case CUBE_FACES.BOTTOM:
                if (x < 0) { newFace = CUBE_FACES.LEFT; y = 0; x = y; }
                else if (x >= GRID_SIZE) { newFace = CUBE_FACES.RIGHT; y = 0; x = GRID_SIZE - 1 - y; }
                else if (y < 0) { newFace = CUBE_FACES.BACK; newY = 0; }
                else if (y >= GRID_SIZE) { newFace = CUBE_FACES.FRONT; newY = 0; }
                break;
        }
    }
    
    return { x: newX, y: newY, face: newFace, wrapped };
}

/**
 * Get camera position for a specific face
 * Returns camera position and look-at target
 * 
 * @param {number} face - Which cube face
 * @returns {Object} {position, target} for camera
 */
export function getCameraForFace(face) {
    const distance = GRID_SIZE * CELL_SIZE * 1.5;
    const halfSize = (GRID_SIZE * CELL_SIZE) / 2;
    
    switch (face) {
        case CUBE_FACES.FRONT:
            return {
                position: { x: 0, y: 0, z: distance },
                target: { x: 0, y: 0, z: 0 }
            };
        case CUBE_FACES.BACK:
            return {
                position: { x: 0, y: 0, z: -distance },
                target: { x: 0, y: 0, z: 0 }
            };
        case CUBE_FACES.LEFT:
            return {
                position: { x: -distance, y: 0, z: 0 },
                target: { x: 0, y: 0, z: 0 }
            };
        case CUBE_FACES.RIGHT:
            return {
                position: { x: distance, y: 0, z: 0 },
                target: { x: 0, y: 0, z: 0 }
            };
        case CUBE_FACES.TOP:
            return {
                position: { x: 0, y: distance, z: 0 },
                target: { x: 0, y: 0, z: 0 }
            };
        case CUBE_FACES.BOTTOM:
            return {
                position: { x: 0, y: -distance, z: 0 },
                target: { x: 0, y: 0, z: 0 }
            };
        default:
            return {
                position: { x: 0, y: 0, z: distance },
                target: { x: 0, y: 0, z: 0 }
            };
    }
}

/**
 * Check if grid coordinates are valid (within bounds)
 * For cube surface, this checks if on the current face
 * 
 * @param {number} gridX - X position on face
 * @param {number} gridY - Y position on face
 * @returns {boolean} true if within face bounds
 */
export function isValidGridPosition(gridX, gridY) {
    return gridX >= 0 && gridX < GRID_SIZE && 
           gridY >= 0 && gridY < GRID_SIZE;
}
