import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createStandardScene, populateSceneFromElements } from './scene-helpers.js';

// Module state
let controls;
let freedomScene, constraintScene;
let freedomRenderer, constraintRenderer;
let camera;
let animationFrameId = null;

const modalOverlay = document.getElementById('modal-overlay');
const freedomCanvas = document.getElementById('freedom-canvas');
const constraintCanvas = document.getElementById('constraint-canvas');

function resizeRenderersToDisplaySize() {
    const freedomRect = freedomCanvas.getBoundingClientRect();
    const constraintRect = constraintCanvas.getBoundingClientRect();
    const pixelRatio = window.devicePixelRatio;

    // Check if the renderer's size is different from the canvas's display size
    if (freedomRenderer.domElement.width !== freedomRect.width * pixelRatio || 
        freedomRenderer.domElement.height !== freedomRect.height * pixelRatio) {
        
        // Adjust both renderers
        freedomRenderer.setSize(freedomRect.width, freedomRect.height, false);
        constraintRenderer.setSize(constraintRect.width, constraintRect.height, false);
        
        // Update the shared camera's aspect ratio
        camera.aspect = freedomRect.width / freedomRect.height;
        camera.updateProjectionMatrix();
    }
}

// Utility function to create a scene and renderer
function createScene(canvas) {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xddeeff);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const light = new THREE.DirectionalLight(0xffffff, 0.3);
    light.position.set(2, 5, 5);
    scene.add(light);
    return { scene, renderer };
}

// Main animation loop for the modal
function animate() {
    animationFrameId = requestAnimationFrame(animate);
    controls.update();

    // The core of the synchronization: the shared camera is updated by controls
    // and both renderers use its state to render their respective scenes.
    freedomRenderer.render(freedomScene, camera);
    constraintRenderer.render(constraintScene, camera);
}

// Initialize the modal and its events
export function init() {
    freedomScene = createStandardScene(0xddeeff);
    constraintScene = createStandardScene(0xddeeff);

    freedomRenderer = new THREE.WebGLRenderer({ canvas: freedomCanvas, antialias: true });
    constraintRenderer = new THREE.WebGLRenderer({ canvas: constraintCanvas, antialias: true });

    camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.set(0, 1.5, 5);
    
    controls = new OrbitControls(camera, freedomRenderer.domElement);
    controls.enableDamping = true;

    // Event listeners for closing the modal
    document.getElementById('modal-close-btn').addEventListener('click', hide);
    modalOverlay.addEventListener('click', (event) => {
        if (event.target === modalOverlay) {
            hide();
        }
    });
}

// Show the modal and populate it with 3D models
export function show(entryData) {
    populateSceneFromElements(freedomScene, entryData.freedomSpace.elements);
    populateSceneFromElements(constraintScene, entryData.constraintSpace.elements);
    
    modalOverlay.classList.remove('hidden');
    resizeRenderersToDisplaySize();
    
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    animate();
}

// Hide the modal and stop the rendering loop to save resources
function hide() {
    modalOverlay.classList.add('hidden');
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
}

function initLights(scene) {
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const light = new THREE.DirectionalLight(0xffffff, 0.3);
    light.position.set(2, 5, 5);
    scene.add(light);
}