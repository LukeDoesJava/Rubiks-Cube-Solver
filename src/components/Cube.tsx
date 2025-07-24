import * as THREE from "three";
import { useEffect, useRef, useState } from "react";
import { RubiksCubeRotation } from "@/app/helpers/helpers";
import { RubiksCube } from "@/types/cube";

export default function Cube() {
    const rubiksCubeRef = useRef<RubiksCube | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const animationFrameId = useRef<number | null>(null);

    // Helper to create and initialize the scene, camera, renderer, and cube
    const createScene = () => {
        const scene = new THREE.Scene();
        const canvas = document.getElementById("rubiks-cube") as HTMLCanvasElement;
        const camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        camera.position.set(8, 8, 8);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);

        // Remove duplicate canvas if any
        if (renderer.domElement.parentElement !== document.body) {
            document.body.appendChild(renderer.domElement);
        }

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        scene.add(directionalLight);

        return { scene, camera, renderer };
    };

    useEffect(() => {
        // Only run once on mount
        const { scene, camera, renderer } = createScene();

        // Create and add Rubik's Cube
        const rubiksCube = new RubiksCube();
        rubiksCube.createEntireCube();
        scene.add(rubiksCube.EntireCube);

        rubiksCubeRef.current = rubiksCube;
        sceneRef.current = scene;
        cameraRef.current = camera;
        rendererRef.current = renderer;

        // Animation loop for rendering
        const animate = () => {
            renderer.render(scene, camera);
            animationFrameId.current = requestAnimationFrame(animate);
        };
        animate();

        // Cleanup on unmount
        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
            renderer.dispose();
        };
    }, []);

    // Button handlers
    const handleRotate = async (notation: string) => {
        if (
            isAnimating // Prevent button action if animating
        ) {
            return;
        }
        if (
            rubiksCubeRef.current &&
            sceneRef.current &&
            cameraRef.current &&
            rendererRef.current
        ) {
            setIsAnimating(true);
            await RubiksCubeRotation(
                notation,
                rubiksCubeRef.current,
                sceneRef.current,
                cameraRef.current,
                rendererRef.current
            );
            setIsAnimating(false);
        }
    };

    return (
        <div>
            <canvas id="rubiks-cube" className="w-full h-full"></canvas>
            <div className="flex gap-4 mt-4">
                <button
                    className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition"
                    onClick={() => handleRotate("F")}
                    disabled={isAnimating}
                    aria-disabled={isAnimating}
                >
                    Rotate Front (F)
                </button>
                <button
                    className="px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700 transition"
                    onClick={() => handleRotate("U")}
                    disabled={isAnimating}
                    aria-disabled={isAnimating}
                >
                    Rotate Up (U)
                </button>
            </div>
        </div>
    );
}