'use client'

import React, { useRef, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import PocketWatch from '../components/PocketWatch'
import { gsap } from 'gsap'
import { useScene } from '../contexts/SceneContext'

function pad(n:number){return String(n).padStart(2,'0')}

export default function CountdownScene(){
  const [timeLeft, setTimeLeft] = useState({days:'00', hours:'00', minutes:'00', seconds:'00'})
  const dayRef = useRef<HTMLDivElement|null>(null)
  const hourRef = useRef<HTMLDivElement|null>(null)
  const minuteRef = useRef<HTMLDivElement|null>(null)
  const secondRef = useRef<HTMLDivElement|null>(null)
  const { setScene } = useScene()

  // Event date: 28 November 2026, 13:00 Europe/Bucharest (UTC+2) -> UTC 11:00
  const target = new Date(Date.UTC(2026,10,28,11,0,0))

  useEffect(()=>{
    function update(){
      const now = new Date()
      let diff = Math.max(0, Math.floor((target.getTime() - now.getTime()) / 1000))
      const days = Math.floor(diff / (3600*24)); diff -= days * 3600*24
      const hours = Math.floor(diff / 3600); diff -= hours*3600
      const minutes = Math.floor(diff / 60); diff -= minutes*60
      const seconds = diff

      const newState = {days: String(days), hours: pad(hours), minutes: pad(minutes), seconds: pad(seconds)}

      // animate transitions for changed fields
      if(newState.days !== timeLeft.days && dayRef.current){
        gsap.fromTo(dayRef.current, {y:12, opacity:0}, {y:0, opacity:1, duration:0.6, ease:'power2.out'})
      }
      if(newState.hours !== timeLeft.hours && hourRef.current){
        gsap.fromTo(hourRef.current, {y:10, opacity:0}, {y:0, opacity:1, duration:0.45, ease:'power2.out'})
      }
      if(newState.minutes !== timeLeft.minutes && minuteRef.current){
        gsap.fromTo(minuteRef.current, {y:10, opacity:0}, {y:0, opacity:1, duration:0.45, ease:'power2.out'})
      }
      if(newState.seconds !== timeLeft.seconds && secondRef.current){
        gsap.fromTo(secondRef.current, {scale:0.92, opacity:0.85}, {scale:1, opacity:1, duration:0.25, ease:'sine.out'})
      }

      setTimeLeft(newState)
    }

    update()
    const id = setInterval(update, 1000)
    return ()=> clearInterval(id)
  },[/* no deps - we intentionally reference target */])

  return (
    <div style={{height:'100vh', width:'100%', display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem'}}>
      <div style={{display:'flex',gap:40,alignItems:'center',flexWrap:'wrap',maxWidth:1200}}>
        <div style={{width:420, height:420, position:'relative'}}>
          <Canvas shadows dpr={[1,2]}>
            <PerspectiveCamera makeDefault position={[0,0,8]} fov={50} />
            <ambientLight intensity={0.6} />
            <PocketWatch />
          </Canvas>
          {/* subtle overlay instruction */}
          <div style={{position:'absolute',left:16,bottom:16,color:'#fff8ef',opacity:0.9,fontSize:14}}>Ceasornicul bate pentru o zi specială…</div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:20,minWidth:260}}>
          <div style={{background:'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))',padding:'1.25rem',borderRadius:12,boxShadow:'0 8px 30px rgba(1,3,6,0.6)'}}>
            <div style={{fontSize:12,color:'#cfc7c4',marginBottom:6}}>ZILE</div>
            <div ref={dayRef} style={{fontFamily:'Playfair Display, serif',fontSize:32,color:'#fff8ef'}}>{timeLeft.days}</div>
          </div>

          <div style={{background:'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))',padding:'1.25rem',borderRadius:12,boxShadow:'0 8px 30px rgba(1,3,6,0.6)'}}>
            <div style={{fontSize:12,color:'#cfc7c4',marginBottom:6}}>ORE</div>
            <div ref={hourRef} style={{fontFamily:'Poppins, sans-serif',fontSize:28,color:'#fff8ef'}}>{timeLeft.hours}</div>
          </div>

          <div style={{background:'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))',padding:'1.25rem',borderRadius:12,boxShadow:'0 8px 30px rgba(1,3,6,0.6)'}}>
            <div style={{fontSize:12,color:'#cfc7c4',marginBottom:6}}>MINUTE</div>
            <div ref={minuteRef} style={{fontFamily:'Poppins, sans-serif',fontSize:28,color:'#fff8ef'}}>{timeLeft.minutes}</div>
          </div>

          <div style={{background:'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))',padding:'1.25rem',borderRadius:12,boxShadow:'0 8px 30px rgba(1,3,6,0.6)'}}>
            <div style={{fontSize:12,color:'#cfc7c4',marginBottom:6}}>SECUNDE</div>
            <div ref={secondRef} style={{fontFamily:'Poppins, sans-serif',fontSize:28,color:'#fff8ef'}}>{timeLeft.seconds}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
