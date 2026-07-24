'use client'

import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

export default function PocketWatch(){
  const rimRef = useRef<any>(null)
  const faceRef = useRef<any>(null)
  const hourHand = useRef<any>(null)
  const minuteHand = useRef<any>(null)
  const secondHand = useRef<any>(null)

  // subtle rotation for life
  useFrame((state, delta) => {
    if(rimRef.current) rimRef.current.rotation.y += 0.0008
    if(faceRef.current) faceRef.current.rotation.y -= 0.0006

    const now = new Date()
    const s = now.getSeconds() + now.getMilliseconds()/1000
    const m = now.getMinutes() + s/60
    const h = (now.getHours()%12) + m/60

    if(secondHand.current) secondHand.current.rotation.z = - (s / 60) * Math.PI*2
    if(minuteHand.current) minuteHand.current.rotation.z = - (m / 60) * Math.PI*2
    if(hourHand.current) hourHand.current.rotation.z = - (h / 12) * Math.PI*2
  })

  return (
    <group>
      {/* rim */}
      <mesh ref={rimRef} position={[0,0,0]}>
        <torusGeometry args={[2.2,0.18,16,100]} />
        <meshStandardMaterial color={'#b5893b'} metalness={0.9} roughness={0.35} />
      </mesh>

      {/* face (slightly inset) */}
      <mesh ref={faceRef} position={[0,0,-0.05]}>
        <cylinderGeometry args={[1.8,1.8,0.06,64]} />
        <meshStandardMaterial color={'#fff8ef'} metalness={0.05} roughness={0.7} />
      </mesh>

      {/* hour hand */}
      <mesh ref={hourHand} position={[0,0,0.08]}>
        <boxGeometry args={[0.06,0.7,0.03]} />
        <meshStandardMaterial color={'#5b3b10'} metalness={0.6} roughness={0.4} />
      </mesh>

      {/* minute hand */}
      <mesh ref={minuteHand} position={[0,0,0.09]}>
        <boxGeometry args={[0.04,1.05,0.02]} />
        <meshStandardMaterial color={'#5b3b10'} metalness={0.6} roughness={0.4} />
      </mesh>

      {/* second hand */}
      <mesh ref={secondHand} position={[0,0,0.11]}>
        <boxGeometry args={[0.02,1.3,0.01]} />
        <meshStandardMaterial color={'#c9a84f'} metalness={0.9} roughness={0.2} emissive={'#ecd89a'} emissiveIntensity={0.2} />
      </mesh>

      {/* small center pin */}
      <mesh position={[0,0,0.12]}>
        <cylinderGeometry args={[0.07,0.07,0.05,16]} />
        <meshStandardMaterial color={'#c9a84f'} metalness={1} roughness={0.3} />
      </mesh>

    </group>
  )
}
