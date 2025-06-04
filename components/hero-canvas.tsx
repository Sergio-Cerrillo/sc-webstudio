// NO 'use client' aquí
import type { FC } from "react"

const HeroCanvas: FC = () => {
  // Solo renderiza en cliente
  if (typeof window === "undefined") return null
  // Importa hooks y librerías SOLO dentro del componente y SOLO si window existe
  const { useTheme } = require("next-themes")
  const { Canvas } = require("@react-three/fiber")
  const drei = require("@react-three/drei")
  const { theme } = useTheme()
  const { OrbitControls, Html } = drei

  return (
    <Canvas camera={{ position: [2, 2, 2], fov: 50 }}>
      {/* @ts-ignore */}
      <ambientLight intensity={0.7} />
      {/* @ts-ignore */}
      <directionalLight position={[5, 5, 5]} intensity={0.7} />
      {/* @ts-ignore */}
      <mesh rotation={[0.5, 0.5, 0]} castShadow receiveShadow>
        {/* @ts-ignore */}
        <boxGeometry args={[1.2, 1.2, 1.2]} />
        {/* @ts-ignore */}
        <meshStandardMaterial color={theme === "dark" ? "#222" : "#e0e0e0"} metalness={0.5} roughness={0.3} />
      {/* @ts-ignore */}
      </mesh>
      <OrbitControls enablePan={false} enableZoom={false} />
      <Html position={[0, -1.1, 0]} center style={{ pointerEvents: 'none', fontSize: 14, color: theme === "dark" ? "#fff" : "#222" }} />
    </Canvas>
  )
}

export default HeroCanvas
