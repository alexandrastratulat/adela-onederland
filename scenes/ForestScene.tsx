'use client'

import React, { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'

function FloatingFireflies({ count = 60 }:{count?:number}){
  const group = useRef<any>(null)

  useFrame((state, delta) => {
    if(group.current){
      group.current.rotation.y += 0.002
    }
  })

  const particles = new Array(count).fill(0).map((_,i)=>{
    const x = (Math.random()-0.5) * 12
    const y = Math.random() * 4 - 1
    const z = (Math.random()-0.5) * 8
    const scale = Math.random() * 0.08 + 0.02
    return {x,y,z,scale}
  })

  return (
    <group ref={group}>
      {particles.map((p, i) => (
        <mesh key={i} position={[p.x,p.y,p.z]} >
          <sphereGeometry args={[p.scale,8,8]} />
          <meshBasicMaterial color={'#f8e6b2'} transparent opacity={0.9} />
        </mesh>
      ))}
    </group>
  )
}

function TreePlane({ x, z, scale = 1 }:{x:number,z:number,scale?:number}){
  return (
    <mesh position={[x, -1.2, z]}>
      <planeGeometry args={[2*scale,4*scale]} />
      <meshStandardMaterial color={'#142b1f'} transparent opacity={0.9} />
    </mesh>
  )
}

function ForestContent(){
  // subtle camera float handled on Canvas camera props instead

  // some trees
  const trees = []
  for(let i=0;i<12;i++){
    const x = (i - 6) * 1.6 + (Math.random()-0.5)*0.6
    const z = - (i*0.8) - 2 - Math.random()*4
    const s = 0.8 + Math.random()*1.4
    trees.push(<TreePlane key={i} x={x} z={z} scale={s} />)
  }

  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[2,4,2]} intensity={0.6} color={0xffecd1} />
      <group>
        {trees}
      </group>
      <FloatingFireflies />
    </>
  )
}

export default function ForestScene(){
  return (
    <div style={{height:'100vh', width:'%'}}>
      <Canvas shadows dpr={[1,2]} camera={{ position: [0,0,6], fov: 50 }}>
        <ForestContent />
      </Canvas>
      {/* Overlay UI: audio button and brief instruction */}
      <div style={{position:'absolute',left:20,top:20}}>
        <div id="audio-root"></div>
      </div>
    </div>
  )
}
