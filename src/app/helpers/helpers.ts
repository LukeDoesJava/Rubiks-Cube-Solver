import * as THREE from "three";
import { CubeRubikFaceColorMap, RubiksCube } from "@/types/cube";

export function CreateRubik(faces: CubeRubikFaceColorMap) : THREE.Mesh {
    return (
        new THREE.Mesh(
            new THREE.BoxGeometry(2.8, 2.8, 2.8), // Slightly smaller to show gaps
            [
                new THREE.MeshBasicMaterial({ color: faces.Right }),
                new THREE.MeshBasicMaterial({ color: faces.Left }),
                new THREE.MeshBasicMaterial({ color: faces.Top }),
                new THREE.MeshBasicMaterial({ color: faces.Bottom }),
                new THREE.MeshBasicMaterial({ color: faces.Front }),
                new THREE.MeshBasicMaterial({ color: faces.Back })
            ]
        )
    )
}

export function RubiksCubeRotation (
    notation: string,
    cube: RubiksCube,
    scene: THREE.Scene,
    camera: THREE.Camera,
    renderer: THREE.WebGLRenderer,
    speed: number = 0.01
) : Promise<void> {
    return new Promise((resolve) => {
    const isClockwise : boolean = !notation.includes(`'`)
    const cleanNotation = notation.replace("'", "")

    let layer: THREE.Mesh<THREE.BufferGeometry<THREE.NormalBufferAttributes, THREE.BufferGeometryEventMap>, THREE.Material | THREE.Material[], THREE.Object3DEventMap>[] = []
    let axis = ""
    switch(cleanNotation){
        case "U": {
            layer = cube.U_layer
            axis = "y"
            break
        }
        case "D": {
            layer = cube.D_layer
            axis = "y"
            break
        }
        case "L": {
            layer = cube.L_layer
            axis = "x"
            break
        }
        case "R": {
            layer = cube.R_layer
            axis = "x"
            break
        }
        case "F": {
            layer = cube.F_layer
            axis = "z"
            break
        }
        case "B": {
            layer = cube.B_layer
            axis = "z"
            break
        }
    }
    const tempGroup = new THREE.Group();
    layer.forEach((mesh: THREE.Mesh) => {
        // Ensure the rotation property is not read-only by creating a new Euler
        tempGroup.attach(mesh);
    });
        
    let rotated = 0;
    const sign = isClockwise ? 1 : -1;
    const targetAngle =  Math.PI / 2 - 0.001;
    // Animation logic for rotating the selected layer
    const animate = () => {
        const delta = sign * speed;
        rotated += Math.abs(delta);

        if (axis === "x") {
            tempGroup.rotation.x += delta;
        } else if (axis === "y") {
            tempGroup.rotation.y += delta;
        } else if (axis === "z") {
            tempGroup.rotation.z += delta;
        }
        cube.EntireCube.add(tempGroup);
        
        if(rotated < targetAngle){
            renderer.render(scene, camera);
            window.requestAnimationFrame(() => animate());
        } else {
            cube.EntireCube.add(tempGroup);
            renderer.render(scene, camera);
            resolve();
        }
    };
    animate();
    });
}