import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import BarberPoleSimulation from './components/BarberPoleSimulation'
import ControlPanel from './components/ControlPanel'

export default function App() {
  const [concentration, setConcentration] = useState(0.5)
  const [theta0, setTheta0] = useState(0)
  const [filter2Angle, setFilter2Angle] = useState(0)
  const [spectrumMode, setSpectrumMode] = useState(true)

  return (
    <div className="w-screen h-screen bg-black relative">
      <Canvas
        camera={{ position: [0, 0, 3.5], fov: 50 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
        shadows
        style={{
          background: 'radial-gradient(ellipse at center, #0a0a1a 0%, #000005 100%)',
        }}
      >
        <BarberPoleSimulation
          concentration={concentration}
          theta0={theta0}
          filter2Angle={filter2Angle}
          spectrumMode={spectrumMode}
        />
      </Canvas>

      <ControlPanel
        concentration={concentration}
        setConcentration={setConcentration}
        theta0={theta0}
        setTheta0={setTheta0}
        filter2Angle={filter2Angle}
        setFilter2Angle={setFilter2Angle}
        spectrumMode={spectrumMode}
        setSpectrumMode={setSpectrumMode}
      />

      {/* Top-left badge */}
      <div
        className="absolute top-4 left-4 rounded-xl px-4 py-3 border border-white/10"
        style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <p className="text-white font-bold text-sm leading-tight">🌀 Optimism</p>
        <p className="text-gray-400 text-xs mt-0.5">Barber Pole Effect · ORD Simulation</p>
      </div>
    </div>
  )
}
