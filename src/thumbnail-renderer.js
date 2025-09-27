// src/thumbnail-renderer.js
import * as THREE from 'three';
// NEW: Import our new helpers
import { createStandardScene, populateSceneFromElements } from './scene-helpers.js';

// --- NEW SETUP ---
const THUMB_WIDTH = 128;
const THUMB_HEIGHT = 128;

// Create two separate scenes, one for each space
const freedomScene = createStandardScene(null);
const constraintScene = createStandardScene(null);

const camera = new THREE.PerspectiveCamera(50, THUMB_WIDTH / THUMB_HEIGHT, 0.1, 100);
camera.position.set(0, 1, 4);
camera.lookAt(0, 0, 0);

// The renderer's canvas is now double-width
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(THUMB_WIDTH * 2, THUMB_HEIGHT);
renderer.autoClear = false;
renderer.setClearColor(0xffffff, 1); 

// We need a 2D canvas to combine the two renderings
const finalCanvas = document.createElement('canvas');
finalCanvas.width = THUMB_WIDTH * 2;
finalCanvas.height = THUMB_HEIGHT;
const ctx = finalCanvas.getContext('2d');

export async function generateThumbnails(chartData) {
    const thumbnailMap = new Map();

    for (const entry of chartData) {
        renderer.clear();
        // 1. Populate both scenes using the helper function
        populateSceneFromElements(freedomScene, entry.freedomSpace.elements);
        populateSceneFromElements(constraintScene, entry.constraintSpace.elements);

        // 2. Render the Freedom Space
        renderer.setViewport(0, 0, THUMB_WIDTH, THUMB_HEIGHT); // Render on the left half
        renderer.render(freedomScene, camera);
        
        // 3. Render the Constraint Space
        renderer.setViewport(THUMB_WIDTH, 0, THUMB_WIDTH, THUMB_HEIGHT); // Render on the right half
        renderer.render(constraintScene, camera);
        
        // 4. Copy the combined WebGL render to our 2D canvas and get the data URL
        ctx.clearRect(0, 0, finalCanvas.width, finalCanvas.height);
        ctx.drawImage(renderer.domElement, 0, 0);
        const url = finalCanvas.toDataURL();
        thumbnailMap.set(entry.id, url);
    }
    
    return thumbnailMap;
}