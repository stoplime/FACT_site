// src/scene-helpers.js
import * as THREE from 'three';
import * as Shapes from './elemental-shapes.js';
import { processOptions } from './data-helpers.js';

/**
 * Creates a standard scene with lighting.
 * @param {string | number} bgColor - The background color for the scene.
 * @returns {THREE.Scene}
 */
export function createStandardScene(bgColor) {
    const scene = new THREE.Scene();
    if (bgColor) {
        scene.background = new THREE.Color(bgColor);
    }
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const light = new THREE.DirectionalLight(0xffffff, 0.3);
    light.position.set(2, 5, 5);
    scene.add(light);
    return scene;
}

/**
 * Populates a scene with models based on an array of element data.
 * @param {THREE.Scene} scene - The scene to add objects to.
 * @param {Array<Object>} elements - The array of elements from fact-data.json.
 */
export function populateSceneFromElements(scene, elements) {
    // Clear any previous objects from the scene
    scene.clear();
    // Re-add standard lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const light = new THREE.DirectionalLight(0xffffff, 0.3);
    light.position.set(2, 5, 5);
    scene.add(light);

    if (!elements || elements.length === 0) return;

    elements.forEach(elementData => {
        const shapeFunction = Shapes[elementData.type];
        if (typeof shapeFunction === 'function') {
            const processedOptions = processOptions(elementData.options);
            const shape = shapeFunction(processedOptions);

            if (elementData.position) {
                shape.position.set(...elementData.position);
            }
            if (elementData.rotation) {
                shape.rotation.set(...elementData.rotation);
            }
            scene.add(shape);
        } else {
            console.warn(`Shape function ${elementData.type} not found.`);
        }
    });
}