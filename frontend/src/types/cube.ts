export type CubeRubikFace = "Front" | "Back" | "Left" | "Right" | "Top" | "Bottom";

export type CubeRubikFaceColorMap = {
    [key in CubeRubikFace]: string;
};


import { CreateRubik } from "@/app/helpers/helpers";
import * as THREE from "three";

export class RubiksCube  {
    
    // The groups should consist of 3 Rubiks, representing the layer of the cube they occupy on the x, y, or z axis
    // Notation can be found here: https://ruwix.com/the-rubiks-cube/notation/
    EntireCube: THREE.Group;
    R_layer: THREE.Mesh[];
    L_layer: THREE.Mesh[];
    U_layer: THREE.Mesh[];
    D_layer: THREE.Mesh[];
    F_layer: THREE.Mesh[];
    B_layer: THREE.Mesh[];

    constructor(
        EntireCube: THREE.Group = new THREE.Group(),
        R_layer: THREE.Mesh[] = [],
        L_layer: THREE.Mesh[] = [],
        U_layer: THREE.Mesh[] = [],
        D_layer: THREE.Mesh[] = [],
        F_layer: THREE.Mesh[] = [],
        B_layer: THREE.Mesh[] = []
    ) {
        this.EntireCube = EntireCube;
        this.R_layer = R_layer;
        this.L_layer = L_layer;
        this.U_layer = U_layer;
        this.D_layer = D_layer;
        this.F_layer = F_layer;
        this.B_layer = B_layer;
    }

    createEntireCube() {
        const minimap = {
            Right: "#ff0000",
            Left: "#ffa500",
            Top: "#00ff00",
            Bottom: "#0000ff",
            Front: "#ffff00",
            Back: "#ffffff"
        }

        let cubeMargin = 3;
        for (let x = 0; x < 3; x++) {
            for (let y = 0; y < 3; y++) {
                for (let z = 0; z < 3; z++) {
                    // Create the rubik
                    const rubik = CreateRubik(minimap);
                    // Position each cube piece with spacing
                    rubik.position.set(
                        (x - 1) * cubeMargin, 
                        (y - 1) * cubeMargin,
                        (z - 1) * cubeMargin
                    );
                    // Add the rubik to the group
                    this.EntireCube.add(rubik);
                     // Add the group to the appropriate layer
                     if (x === 0) this.L_layer.push(rubik); 
                     if (x === 2) this.R_layer.push(rubik); 
                     if (y === 0) this.D_layer.push(rubik); 
                     if (y === 2) this.U_layer.push(rubik); 
                     if (z === 0) this.B_layer.push(rubik); 
                     if (z === 2) this.F_layer.push(rubik); 
                }
            }
        }
    }
}