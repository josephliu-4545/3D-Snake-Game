// ==========================================
// GRID MODULE
// Creates and manages the game board
// ==========================================

import * as THREE from 'three';
import { GRID_SIZE, CELL_SIZE, COLORS } from './constants.js';

/**
 * Creates the game board (a flat platform with grid lines)
 * Returns a THREE.Group containing all grid elements
 */
export function createGrid() {
    const gridGroup = new THREE.Group();
    
    // ==========================================
    // Create Hollow Cube Platform (6 faces)
    // Snake moves on the surface of a cube
    // ==========================================
    
    const cubeSize = GRID_SIZE * CELL_SIZE;
    const halfSize = cubeSize / 2;
    const blockSize = CELL_SIZE;
    const blockGeometry = new THREE.BoxGeometry(blockSize, blockSize, blockSize);
    
    // Brighter material for faces - more visible
    const faceMaterial = new THREE.MeshStandardMaterial({
        color: 0x4a5568,  // Medium gray - more visible
        roughness: 0.4,
        metalness: 0.2,
        transparent: true,
        opacity: 0.85
    });
    
    // Bright edge material for better visibility
    const edgeMaterial = new THREE.MeshStandardMaterial({
        color: 0xa0aec0,  // Light gray for edges
        roughness: 0.3,
        metalness: 0.3,
        emissive: 0x2d3748,
        emissiveIntensity: 0.2
    });
    
    // Create a hollow cube frame
    // We'll create the edges and corners only (hollow inside)
    
    const positions = [];
    
    // Generate positions for hollow cube edges
    for (let x = 0; x < GRID_SIZE; x++) {
        for (let y = 0; y < GRID_SIZE; y++) {
            for (let z = 0; z < GRID_SIZE; z++) {
                // Only create blocks on the surface (edges of the cube)
                const isSurface = (
                    x === 0 || x === GRID_SIZE - 1 ||
                    y === 0 || y === GRID_SIZE - 1 ||
                    z === 0 || z === GRID_SIZE - 1
                );
                
                if (isSurface) {
                    positions.push({ x, y, z });
                }
            }
        }
    }
    
    // Create the blocks
    const startX = -halfSize + (blockSize / 2);
    const startY = -halfSize + (blockSize / 2);
    const startZ = -halfSize + (blockSize / 2);
    
    positions.forEach(pos => {
        const isEdge = (
            (pos.x === 0 || pos.x === GRID_SIZE - 1) &&
            (pos.y === 0 || pos.y === GRID_SIZE - 1)
        ) || (
            (pos.x === 0 || pos.x === GRID_SIZE - 1) &&
            (pos.z === 0 || pos.z === GRID_SIZE - 1)
        ) || (
            (pos.y === 0 || pos.y === GRID_SIZE - 1) &&
            (pos.z === 0 || pos.z === GRID_SIZE - 1)
        );
        
        const material = isEdge ? edgeMaterial : faceMaterial;
        const block = new THREE.Mesh(blockGeometry, material);
        
        block.position.x = startX + (pos.x * blockSize);
        block.position.y = startY + (pos.y * blockSize);
        block.position.z = startZ + (pos.z * blockSize);
        
        gridGroup.add(block);
    });
    
    // ==========================================
    // Add bright grid lines to show cell boundaries
    // ==========================================
    
    const lineMaterial = new THREE.LineBasicMaterial({
        color: 0xffffff,  // White lines
        transparent: true,
        opacity: 0.3,
        linewidth: 2
    });
    
    // Create grid lines on each face (simplified - just front face for now)
    const lineOffset = halfSize - (blockSize / 2);
    
    // Horizontal lines on front face
    for (let i = 0; i <= GRID_SIZE; i++) {
        const pos = lineOffset + (i * blockSize);
        const points = [];
        points.push(new THREE.Vector3(lineOffset, lineOffset, halfSize + 0.01));
        points.push(new THREE.Vector3(-lineOffset, lineOffset, halfSize + 0.01));
        
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(lineGeometry, lineMaterial);
        gridGroup.add(line);
        
        // Vertical lines on front face
        const pointsV = [];
        pointsV.push(new THREE.Vector3(lineOffset, lineOffset, halfSize + 0.01));
        pointsV.push(new THREE.Vector3(lineOffset, -lineOffset, halfSize + 0.01));
        
        const lineV = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints(pointsV),
            lineMaterial
        );
        gridGroup.add(lineV);
    }
    
    // Store cube dimensions for wrapping logic
    gridGroup.userData.cubeSize = GRID_SIZE;
    gridGroup.userData.halfSize = halfSize;
    
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
    const localY = (gridY * CELL_SIZE) + offset;
    const surfaceOffset = halfSize - (CELL_SIZE / 2); // Position on cube surface
    
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
            return { x: localX, y: surfaceOffset, z: -localY };
        case CUBE_FACES.BOTTOM: // -Y face
            return { x: localX, y: -surfaceOffset, z: localY };
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
    
    // Check if position is out of bounds
    if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) {
        wrapped = true;
        
        // Calculate which edge we crossed and wrap to adjacent face
        // This is simplified - full implementation would handle all 12 edges
        if (face === CUBE_FACES.FRONT) {
            if (x < 0) { newFace = CUBE_FACES.LEFT; newX = GRID_SIZE - 1; }
            else if (x >= GRID_SIZE) { newFace = CUBE_FACES.RIGHT; newX = 0; }
            else if (y < 0) { newFace = CUBE_FACES.BOTTOM; newY = GRID_SIZE - 1; }
            else if (y >= GRID_SIZE) { newFace = CUBE_FACES.TOP; newY = 0; }
        }
        // Add other face transitions as needed...
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
