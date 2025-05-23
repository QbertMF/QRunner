import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export class GltfObject {
    constructor(scene, modelPath, scale, onLoadCallback = null) {
        this.scene = scene;
        this.modelPath = modelPath;
        this.mixer = null;
        this.animations = {};
        this.currentAction = null;
        this.model = null;

        this.loadModel(scale, onLoadCallback);
    }

    loadModel(scale, onLoadCallback) {
        const loader = new GLTFLoader();
        loader.load(
            this.modelPath,
            (gltf) => {
                this.model = gltf.scene;

                // Standard-Skalierung anwenden
                this.model.scale.set(scale, scale, scale);

                this.scene.add(this.model);

                // Setze Animationen
                this.mixer = new THREE.AnimationMixer(this.model);
                gltf.animations.forEach((clip) => {
                    this.animations[clip.name] = this.mixer.clipAction(clip);
                });

                // Standardanimation abspielen
                this.playAnimation('Idle');

                // Führe die Callback-Funktion aus, wenn definiert
                if (onLoadCallback) {
                    onLoadCallback(this.model);
                }
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
            },
            (error) => {
                console.error('An error occurred while loading the model:', error);
            }
        );
    }

    playAnimation(name) {
        if (this.currentAction) {
            this.currentAction.fadeOut(0.5);
        }
        this.currentAction = this.animations[name];
        if (this.currentAction) {
            this.currentAction.reset().fadeIn(0.5).play();
        }
    }

    update(deltaTime) {
        if (this.mixer) {
            this.mixer.update(deltaTime);
        }
    }

    getModel() {
        return this.model;
    }
}