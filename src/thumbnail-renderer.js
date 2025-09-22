import * as THREE from 'three';
import * as Shapes from './elemental-shapes.js';

// A single scene for generating all thumbnails
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff); // White background for thumbnails

const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
camera.position.set(0, 1, 4);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(128, 128); // Small thumbnail size

const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.3);
directionalLight.position.set(2, 5, 5);
scene.add(directionalLight);

/**
 * Generates data URLs for all chart entry thumbnails.
 * @param {Array} chartData - The data from fact-data.json
 * @returns {Promise<Map<string, string>>} A map of entry IDs to image data URLs.
 */
export async function generateThumbnails(chartData) {
    const thumbnailMap = new Map();
    let currentObject = null;

    for (const entry of chartData) {
        if (currentObject) {
            scene.remove(currentObject); // Clean up the previous object
        }

        const freedomData = entry.freedomSpace.elements[0];
        if (!freedomData) continue;

        const shapeFunction = Shapes[freedomData.type];
        if (typeof shapeFunction !== 'function') {
            console.warn(`Shape function ${freedomData.type} not found.`);
            continue;
        }

        currentObject = shapeFunction(freedomData.options);
        scene.add(currentObject);
        
        // Render and capture
        renderer.render(scene, camera);
        const url = renderer.domElement.toDataURL();
        thumbnailMap.set(entry.id, url);
    }
    
    // Clean up the last object
    if (currentObject) {
        scene.remove(currentObject);
    }

    return thumbnailMap;
}