import { GltfObject } from './gltfObject.js';

export class Monster extends GltfObject {
    constructor(scene, modelPath, scale, onLoadCallback = null) {
        super(scene, modelPath, scale, onLoadCallback);
    }

    // Falls spezifische Methoden oder Felder für den Monster benötigt werden, können diese hier hinzugefügt werden
}
