use client'

import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export default function InvitationScene(){
  const line1 = useRef<HTMLDivElement | null>(null)
  const line2 = useRef<HTMLDivElement | null>(null)
  const line3 = useRef<HTMLDivElement | null>(null)
  const line4 = useRef<HTMLDivElement | null>(null)

  useEffect(()=>{
    const tl = gsap.timeline()
    tl.fromTo(line1.current, {opacity:0,y:12}, {opacity:1,y:0,duration:0.9})
    tl.fromTo(line2.current, {opacity:0,y:12}, {opacity:1,y:0,duration:0.9}, '>-0.2')
    tl.fromTo(line3.current, {opacity:0,y:12}, {opacity:1,y:0,duration:0.9}, '>-0.2')
    tl.fromTo(line4.current, {opacity:0,y:12}, {opacity:1,y:0,duration:0.9}, '>-0.2')
  },[])

  return (
    <section style={{height:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:'3rem'}}>
      <div style={{maxWidth:900,background:'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',padding:'3rem',borderRadius:16,boxShadow:'0 10px 40px rgba(2,6,10,0.6)'}}>
        <div ref={line1} style={{fontFamily:'Playfair Display, serif',fontSize:28,color:'#fff8ef',marginBottom:12}}>Capitolul I</div>
        <h1 ref={line2} style={{fontFamily:'Great Vibes, serif',fontSize:48,color:'#c9a84f',marginBottom:18}}>Adela in ONEderland</h1>
        <p ref={line3} style={{color:'#cfc7c4',fontSize:18,lineHeight:1.6}}>
          A sosit timpul să îl urmăm pe Iepurașul Alb... Pe 28 noiembrie, ceasurile se opresc pentru o singură zi, iar Vila Hepa din Brașov se transformă într-un tărâm fermecat.
        </p>
        <p ref={line4} style={{color:'#fff8ef',marginTop:18,fontWeight:600}}>📅 28 noiembrie 2026 — 🕐 Ora 13:00 — 📍 Vila Hepa, Brașov</p>
      </div>
    </section>
  )
}
