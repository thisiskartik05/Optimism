import React, { useRef, useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import vertexShader from '../shaders/ordShader.vert?raw'
import fragmentShader from '../shaders/ordShader.frag?raw'

export default function BarberPoleSimulation({ concentration, theta0, filter2Angle, spectrumMode }) {
  const meshRef = useRef()
  const { camera } = useThree()

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uConcentration: { value: concentration },
        uTheta0:        { value: theta0 },
        uFilter2Angle:  { value: filter2Angle },
        uTime:          { value: 0 },
        uSpectrumMode:  { value: spectrumMode },
        uCameraPos:     { value: new THREE.Vector3() },
        uCylinderRadius:{ value: 0.5 },
        uCylinderHeight:{ value: 4.0 },
      },
      side: THREE.DoubleSide,
      transparent: true,
    })
  }, []) // created once; uniforms updated via useEffect

  useEffect(() => {
    if (!material) return
    material.uniforms.uConcentration.value = concentration
    material.uniforms.uTheta0.value        = theta0
    material.uniforms.uFilter2Angle.value  = filter2Angle
    material.uniforms.uSpectrumMode.value  = spectrumMode
  }, [concentration, theta0, filter2Angle, spectrumMode, material])

  useFrame(({ clock }) => {
    if (material) {
      material.uniforms.uTime.value = clock.getElapsedTime()
      material.uniforms.uCameraPos.value.copy(camera.position)
    }
  })

  const cylinderGeometry = useMemo(
    () => new THREE.CylinderGeometry(0.5, 0.5, 4, 128, 256, false),
    []
  )

  const glassTubeGeometry = useMemo(
    () => new THREE.CylinderGeometry(0.52, 0.52, 4, 128, 1, false),
    []
  )

  const glassMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#aaccff',
        transparent: true,
        opacity: 0.08,
        roughness: 0,
        metalness: 0,
        transmission: 0.9,
        side: THREE.DoubleSide,
      }),
    []
  )

  return (
    <>
      {/* Core shader cylinder */}
      <mesh ref={meshRef} geometry={cylinderGeometry} material={material} />

      {/* Outer glass tube */}
      <mesh geometry={glassTubeGeometry} material={glassMaterial} />

      {/* Lights */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} />
      <pointLight position={[0, 0, 3]} color="#ffffff" intensity={0.5} />

      {/* Controls */}
      <OrbitControls enableDamping dampingFactor={0.08} />
    </>
  )
}
