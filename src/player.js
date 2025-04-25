import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export class Player {
    constructor(scene, modelPath) {
        this.scene = scene;
        this.modelPath = modelPath;
        this.mixer = null;
        this.animations = {};
        this.currentAction = null;

        this.loadModel();
    }

    loadModel() {
        const loader = new GLTFLoader();
        loader.load(
            this.modelPath,
            (gltf) => {
                this.model = gltf.scene;

                // Scale down the character
                this.model.scale.set(0.01, 0.01, 0.01); // Adjust the scale as needed

                this.scene.add(this.model);

                // Set up animations
                this.mixer = new THREE.AnimationMixer(this.model);
                gltf.animations.forEach((clip) => {
                    this.animations[clip.name] = this.mixer.clipAction(clip);
                });

                // Play the idle animation by default
                this.playAnimation('Idle');
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
}
