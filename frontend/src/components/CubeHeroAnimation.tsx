import * as THREE from "three";
import { useEffect, useRef, useState } from "react";
import { RubiksCubeRotation, selectRandomNotation } from "@/app/helpers/helpers";
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
        const canvas = document.getElementById("rubiks-cube-hero-animation") as HTMLCanvasElement;
        
        if (!canvas) {
            console.error("Canvas element not found!");
            return null;
        }
        
        const camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        camera.position.set(50, 50, 50);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ 
            canvas, 
            antialias: true,
            alpha: true 
        });

        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x000000, 0); // Set transparent background

        // Don't move the canvas to body - keep it in its container
        // if (renderer.domElement.parentElement !== document.body) {
        //     document.body.appendChild(renderer.domElement);
        // }

        // Much brighter ambient lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        // Even stronger directional light for vivid shading
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
        directionalLight.position.set(10, 10, 10);
        scene.add(directionalLight);

        return { scene, camera, renderer };
    };

    useEffect(() => {
        // Only run once on mount
        const sceneData = createScene();
        
        if (!sceneData) {
            return;
        }
        
        const { scene, camera, renderer } = sceneData;

        // Create and add Rubik's Cube
        const rubiksCube = new RubiksCube();
        rubiksCube.createEntireCube();
        scene.add(rubiksCube.EntireCube);

        rubiksCubeRef.current = rubiksCube;
        sceneRef.current = scene;
        cameraRef.current = camera;
        rendererRef.current = renderer;

        rubiksCube.EntireCube.position.y = 100;

        // Animation loop for rendering
        const animate = () => {
            renderer.render(scene, camera);
            // Idle animation
            // Animation queue system
            type AnimationStep = (cube: typeof rubiksCube.EntireCube) => boolean; // return true if done

            // Initialize animation queue on first run
            if (!Array.isArray((animate as any).animationQueue)) {
                (animate as any).animationQueue = [];

                // Drop animation: move down
                (animate as any).animationQueue.push((cube) => {
                    if (cube.position.y > 0) {
                        cube.position.y -= Math.log(cube.position.y - 0.5) * 0.1 + 1.4;
                        if (cube.position.y <= 0) {
                            cube.position.y = 0;
                            return true;
                        }
                        return false;
                    }
                    return true;
                });

                // Fall over animation: rotate X until flat
                (animate as any).animationQueue.push((cube) => {
                    if (Math.abs(cube.rotation.x) < Math.PI / 2) {
                        cube.rotation.x -= 0.03;
                        cube.position.y += cube.position.y >= 0 ? Math.cos(cube.rotation.x * 2) : 0;
                        cube.position.z -= 0.08;
                        if (Math.abs(cube.rotation.x) >= Math.PI / 2) {
                            cube.rotation.x = -Math.PI / 2;
                            // After falling over, rotate the cube around Y axis for a spin effect
                            (animate as any).animationQueue.push((cube) => {
                                cube.rotation.x -= 0.03;
                                cube.position.y -= 0.6 * Math.cos(cube.rotation.x * 2);
                                cube.position.z -= 0.3;
                                // Complete a full rotation (2 * PI)
                                if (Math.abs(cube.rotation.x) >= Math.PI) {
                                    return true;
                                }
                                return false;
                            });
                            return true;
                        }
                        return false;
                    }
                    return true;
                });
            }

            // Run the current animation step
            const queue: AnimationStep[] = (animate as any).animationQueue;
            if (queue.length > 0) {
                const done = queue[0](rubiksCube.EntireCube);
                if (done) {
                    queue.shift();
                }
            }

            animationFrameId.current = requestAnimationFrame(animate);
        };
        animate();

        // Handle window resize
        const handleResize = () => {
            if (camera && renderer) {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            }
        };
        
        window.addEventListener('resize', handleResize);

        // Cleanup on unmount
        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
            window.removeEventListener('resize', handleResize);
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
        <div className="w-full h-full">
            <canvas id="rubiks-cube-hero-animation" className="w-full h-full block"></canvas>
        </div>
    );
}