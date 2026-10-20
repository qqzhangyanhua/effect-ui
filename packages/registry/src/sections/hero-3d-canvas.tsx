"use client"

import { useRef } from "react"
import { MeshTransmissionMaterial } from "@react-three/drei"
import { Canvas, useFrame } from "@react-three/fiber"
import type { Mesh } from "three"

function Gem({ progress }: { progress: { current: number } }) {
  const mesh = useRef<Mesh>(null)
  const spin = useRef(0)
  useFrame((_, delta) => {
    if (!mesh.current) return
    spin.current += delta * 0.35
    mesh.current.rotation.y = spin.current + progress.current * Math.PI * 2
    mesh.current.rotation.x = 0.35 + progress.current * 0.5
  })

  return (
    <mesh ref={mesh}>
      <icosahedronGeometry args={[0.95, 0]} />
      <MeshTransmissionMaterial
        backside
        samples={6}
        resolution={256}
        thickness={0.8}
        roughness={0.05}
        transmission={1}
        ior={1.15}
        chromaticAberration={0.12}
        color="#f5f3ff"
      />
    </mesh>
  )
}

export function Hero3DCanvas({ progress }: { progress: { current: number } }) {
  return (
    <Canvas camera={{ position: [0, 0, 4.2], fov: 42 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}>
      <color attach="background" args={["#1e1b4b"]} />
      <ambientLight intensity={1.1} />
      <directionalLight position={[3, 4, 2]} intensity={2.4} />
      <mesh position={[0, 0, -1.6]}>
        <planeGeometry args={[7, 4]} />
        <meshBasicMaterial color="#6d28d9" />
      </mesh>
      <mesh position={[-1.15, 0.35, -0.4]}>
        <sphereGeometry args={[0.48, 32, 32]} />
        <meshStandardMaterial color="#22d3ee" />
      </mesh>
      <mesh position={[1.15, -0.3, -0.45]}>
        <sphereGeometry args={[0.38, 32, 32]} />
        <meshStandardMaterial color="#fb7185" />
      </mesh>
      <Gem progress={progress} />
    </Canvas>
  )
}
