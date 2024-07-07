import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';


interface VisualizerProps {
    audioStream: MediaStream;
}

function AudioVisualizer({ audioStream }: VisualizerProps) {
    const groupRef = useRef<THREE.Group>(null!);
    const [fftData, setFftData] = useState<Uint8Array>(new Uint8Array(128));
    const [debugInfo, setDebugInfo] = useState<string>('');
    const analyserRef = useRef<AnalyserNode | null>(null);

    useEffect(() => {
        let animationFrameId: number;
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        analyserRef.current = analyser;

        try {
            const source = audioContext.createMediaStreamSource(audioStream);
            source.connect(analyser);
            setDebugInfo('Audio source connected to analyser');
        } catch (error) {
            setDebugInfo(`Error connecting audio source: ${error}`);
            return;
        }

        return () => {
            cancelAnimationFrame(animationFrameId);
            audioContext.close();
        };
    }, [audioStream]);

    useFrame(() => {
        if (groupRef.current && analyserRef.current) {
            groupRef.current.rotation.y += 0.005;

            const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
            analyserRef.current.getByteFrequencyData(dataArray);
            setFftData(dataArray);

            // Debug: Log max frequency value
            const maxFreq = Math.max(...Array.from(dataArray));
            setDebugInfo(`Max frequency: ${maxFreq}`);
        }
    });

    const barCount = 64;
    const radius = 2;

    return (
        <>
            <group ref={groupRef}>
                {[...Array(barCount)].map((_, index) => {
                    const angle = (index / barCount) * Math.PI * 2;
                    const x = Math.cos(angle) * radius;
                    const z = Math.sin(angle) * radius;
                    const height = (fftData[index] / 255) * 1.5 + 0.1;

                    return (
                        <mesh key={index} position={[x, height / 2, z]} rotation={[0, -angle, 0]}>
                            <boxGeometry args={[0.1, height, 0.1]} />
                            <meshStandardMaterial
                                color={
                                    new THREE.Color(
                                        fftData[index] / 255,
                                        0.5,
                                        1 - fftData[index] / 255,
                                    )
                                }
                            />
                        </mesh>
                    );
                })}
            </group>
        </>
    );
}

export default function VoiceVisualizer({ audioStream }: { audioStream: MediaStream }) {
    return (
        <Canvas camera={{ position: [0, 3, 5] }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <AudioVisualizer audioStream={audioStream} />
        </Canvas>
    );
}
