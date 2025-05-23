import { GltfObject } from './gltfObject.js';

export class Player extends GltfObject {
    constructor(scene, modelPath, scale, onLoadCallback = null) {
        super(scene, modelPath, scale, onLoadCallback = null);
    }

    // Falls spezifische Methoden oder Felder für den Player benötigt werden, können diese hier hinzugefügt werden
}
