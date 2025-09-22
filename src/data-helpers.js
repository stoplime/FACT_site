// src/data-helpers.js
import * as THREE from 'three';

/**
 * Recursively processes shape options, converting arrays of 3 numbers into THREE.Vector3 objects.
 * This is the bridge between our simple JSON data and the Three.js library.
 * @param {object} options The options object from the JSON file.
 * @returns {object} A new options object with arrays converted to Vector3.
 */
export function processOptions(options) {
    const processed = {};
    for (const key in options) {
        const value = options[key];
        if (Array.isArray(value) && value.length === 3 && typeof value[0] === 'number') {
            // It looks like a vector, convert it!
            processed[key] = new THREE.Vector3(...value);
        } else {
            // Otherwise, just copy the value
            processed[key] = value;
        }
    }
    return processed;
}