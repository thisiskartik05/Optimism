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
      depthWrite: false,
    })
  }, [])

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

  // Bounding proxy cylinder along local Z-axis (radius 0.5, height 4.0)
  const cylinderGeometry = useMemo(() => {
    const geom = new THREE.CylinderGeometry(0.5, 0.5, 4.0, 64, 1, false)
    geom.rotateX(Math.PI / 2) // Orient height along local Z-axis
    return geom
  }, [])

  // Outer physical glass tube
  const glassTubeGeometry = useMemo(() => {
    return new THREE.CylinderGeometry(0.52, 0.52, 4.02, 64, 1, false)
  }, [])

  const glassMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#d0e5ff',
        transparent: true,
        opacity: 0.08,
        roughness: 0.05,
        metalness: 0.1,
        transmission: 0.95,
        ior: 1.5,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    []
  )

  return (
    <>
      {/* Volumetric Raymarching Cylinder - rotated so local Z aligns with world Y (upright) */}
      <mesh
        ref={meshRef}
        geometry={cylinderGeometry}
        material={material}
        rotation={[-Math.PI / 2, 0, 0]}
      />

      {/* Outer physical glass sleeve */}
      <mesh geometry={glassTubeGeometry} material={glassMaterial} />

      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} />
      <pointLight position={[0, 0, 3]} color="#ffffff" intensity={0.6} />

      {/* Controls */}
      <OrbitControls enableDamping dampingFactor={0.08} />
    </>
  )
}
