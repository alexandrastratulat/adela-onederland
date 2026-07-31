'use client'

import React, { useRef, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { gsap } from 'gsap'
import { useScene } from '../contexts/SceneContext'

export default function BookScene(){
  const leftCover = useRef<any>(null)
  const rightCover = useRef<any>(null)
  const pages = useRef<any>(null)
  const { setScene } = useScene()

  useEffect(()=>{
    // initial gentle float
    if (!leftCover.current || !rightCover.current || !pages.current) return
    const tl = gsap.timeline({repeat:-1,yoyo:true})
    tl.to([leftCover.current.rotation, rightCover.current.rotation, pages.current.rotation], { y: 0.02, duration: 3, ease: 'sine.inOut' })
    return ()=> tl.kill()
  },[])

  const openBook = async () => {
    // stop floating and open the right cover with GSAP
    try{
      const tl = gsap.timeline({defaults:{duration:1.2, ease:'power2.inOut'}})
      if(rightCover.current){
        tl.to(rightCover.current.rotation, { z: -Math.PI/1.9, x: -0.05 })
        tl.to(rightCover.current.position, { x: 1.2 }, 0)
      }
      if(pages.current){
        tl.to(pages.current.rotation, { y: -0.08 }, 0)
      }
      // small delay for effect
      tl.to({}, {duration:0.6})
      tl.call(()=> setScene('invitation'))
    }catch(e){
      console.warn('Open book animation failed', e)
      setScene('invitation')
    }
  }

  return (
    <div style={{height:'100vh', width:'100%', position:'relative'}}>
      <Canvas camera={{ position: [0,1.2,6], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[2,4,2]} intensity={0.6} color={0xffeccf} />

        {/* left cover */}
        <mesh ref={leftCover} position={[-1.05,0,0]} rotation={[0,0,0]}>
          <boxGeometry args={[1.8,0.1,3.6]} />
          <meshStandardMaterial color={'#efe0d6'} metalness={0.1} roughness={0.6} />
        </mesh>

        {/* pages */}
        <mesh ref={pages} position={[0,0,0]}>
          <boxGeometry args={[1.6,0.05,3.4]} />
          <meshStandardMaterial color={'#fff8ef'} metalness={0.02} roughness={0.8} />
        </mesh>

        {/* right cover */}
        <mesh ref={rightCover} position={[1.05,0,0]} rotation={[0,0,0]}>
          <boxGeometry args={[1.8,0.1,3.6]} />
          <meshStandardMaterial color={'#efe0d6'} metalness={0.15} roughness={0.5} />
        </mesh>

      </Canvas>

      {/* Overlay instruction */}
      <div style={{position:'absolute',left:0,right:0,bottom:40,display:'flex',justifyContent:'center'}}>
        <button onClick={openBook} className="btn-primary" aria-label="Apasă pentru a deschide povestea">Apasă pentru a deschide povestea</button>
      </div>
    </div>
  )
}
