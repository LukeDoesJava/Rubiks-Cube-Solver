import * as THREE from "three";
import { CubeRubikFaceColorMap, RubiksCube } from "@/types/cube";

export function CreateRubik(faces: CubeRubikFaceColorMap) : THREE.Mesh {
    return (
        new THREE.Mesh(
            new THREE.BoxGeometry(2.8, 2.8, 2.8), // Slightly smaller to show gaps
            [
                new THREE.MeshLambertMaterial({ color: faces.Right }),
                new THREE.MeshLambertMaterial({ color: faces.Left }),
                new THREE.MeshLambertMaterial({ color: faces.Top }),
                new THREE.MeshLambertMaterial({ color: faces.Bottom }),
                new THREE.MeshLambertMaterial({ color: faces.Front }),
                new THREE.MeshLambertMaterial({ color: faces.Back })
            ]
        )
    )
}

export function updateLayers(cube: RubiksCube) {
    cube.U_layer = [];
    cube.D_layer = [];
    cube.L_layer = [];
    cube.R_layer = [];
    cube.F_layer = [];
    cube.B_layer = [];

    for (const rubik of cube.EntireCube.children as THREE.Mesh[]) {
        // Get the world position of the cube piece
        const worldPosition = new THREE.Vector3();
        rubik.getWorldPosition(worldPosition);
        const {x, y, z} = worldPosition;
        
        // Use a tolerance to account for floating point errors
        // The cubes are positioned with cubeMargin = 3, so they're at ±3, 0, ±3 positions
        const EPSILON = 0.7; // Increased for better tolerance
        const CUBE_MARGIN = 3;
        
        if (Math.abs(x + CUBE_MARGIN) < EPSILON) cube.L_layer.push(rubik);
        if (Math.abs(x - CUBE_MARGIN) < EPSILON) cube.R_layer.push(rubik);
        if (Math.abs(y + CUBE_MARGIN) < EPSILON) cube.D_layer.push(rubik);
        if (Math.abs(y - CUBE_MARGIN) < EPSILON) cube.U_layer.push(rubik);
        if (Math.abs(z + CUBE_MARGIN) < EPSILON) cube.B_layer.push(rubik);
        if (Math.abs(z - CUBE_MARGIN) < EPSILON) cube.F_layer.push(rubik);
    }
}

export function RubiksCubeRotation (
    notation: string,
    cube: RubiksCube,
    scene: THREE.Scene,
    camera: THREE.Camera,
    renderer: THREE.WebGLRenderer,
    speed: number = 0.05
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
        tempGroup.position.set(0, 0, 0); // Ensure at origin
        tempGroup.rotation.set(0, 0, 0); // No rotation
        cube.EntireCube.add(tempGroup);
        layer.forEach((mesh: THREE.Mesh) => {
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

            // Account for any external translation of the cube
            // Get the world position of the main cube to account for any movement
            const cubeWorldPosition = new THREE.Vector3();
            cube.EntireCube.getWorldPosition(cubeWorldPosition);
            
            // Set tempGroup to the same world position as the cube
            tempGroup.position.copy(cubeWorldPosition);
            
            cube.EntireCube.add(tempGroup);

            
            if(rotated < targetAngle){
                renderer.render(scene, camera);
                window.requestAnimationFrame(() => animate());
            } else {
                // Snapping the layers to their correct positions
                if (axis === "x") tempGroup.rotation.x = Math.round(tempGroup.rotation.x / (Math.PI / 2)) * (Math.PI / 2);
                else if (axis === "y") tempGroup.rotation.y = Math.round(tempGroup.rotation.y / (Math.PI / 2)) * (Math.PI / 2);
                else if (axis === "z") tempGroup.rotation.z = Math.round(tempGroup.rotation.z / (Math.PI / 2)) * (Math.PI / 2);

                // Detach all meshes from tempGroup and reattach them to the main cube
                const meshes = [...tempGroup.children] as THREE.Mesh[];
                meshes.forEach(mesh => {
                    // 1. Save world position and quaternion
                    const worldPosition = new THREE.Vector3();
                    const worldQuaternion = new THREE.Quaternion();
                    mesh.getWorldPosition(worldPosition);
                    mesh.getWorldQuaternion(worldQuaternion);

                    // 2. Remove from tempGroup, add to cube
                    tempGroup.remove(mesh);
                    cube.EntireCube.add(mesh);

                    // 3. Convert world position to cube's local space
                    mesh.position.copy(cube.EntireCube.worldToLocal(worldPosition));

                    // 4. Convert world quaternion to cube's local space
                    const cubeWorldQuat = new THREE.Quaternion();
                    cube.EntireCube.getWorldQuaternion(cubeWorldQuat);
                    const localQuaternion = worldQuaternion.premultiply(cubeWorldQuat.invert());
                    mesh.quaternion.copy(localQuaternion);

                    // Snap position to nearest valid layer coordinate
                    const CUBE_MARGIN = 3;
                    mesh.position.x = Math.round(mesh.position.x / CUBE_MARGIN) * CUBE_MARGIN;
                    mesh.position.y = Math.round(mesh.position.y / CUBE_MARGIN) * CUBE_MARGIN;
                    mesh.position.z = Math.round(mesh.position.z / CUBE_MARGIN) * CUBE_MARGIN;
                });

                updateLayers(cube);
                renderer.render(scene, camera);
                resolve();
            }
        };
        animate();
    });
}

export function selectRandomNotation() : string {
    const notations = ["U", "D", "L", "R", "F", "B", "U'", "D'", "L'", "R'", "F'", "B'"];
    return notations[Math.floor(Math.random() * notations.length)];
}