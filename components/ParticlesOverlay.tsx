'use client'

import React, { useEffect, useRef } from 'react'

type Particle = { x:number, y:number, size:number, alpha:number, vx:number, vy:number }

export default function ParticlesOverlay(){
  const canvasRef = useRef<HTMLCanvasElement|null>(null)
  const rafRef = useRef<number| null>(null)
  const particlesRef = useRef<Particle[]>([])

  useEffect(()=>{
    if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      return
    }

    const canvas = canvasRef.current!
    if(!canvas) return
    const ctx = canvas.getContext('2d')!

    let w = canvas.width = window.innerWidth
    let h = canvas.height = window.innerHeight

    const createParticle = (): Particle => {
      const size = Math.random()*2.6 + 0.6
      return {
        x: Math.random()*w,
        y: Math.random()*h,
        size,
        alpha: Math.random()*0.6 + 0.04,
        vx: (Math.random()-0.5)*0.12,
        vy: - (Math.random()*0.2 + 0.02)
      }
    }

    const particles: Particle[] = new Array(90).fill(0).map(()=> createParticle())
    particlesRef.current = particles

    const onResize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight }
    window.addEventListener('resize', onResize)

    const draw = () =>{
      if(!ctx) return
      ctx.clearRect(0,0,w,h)
      // subtle gradient background overlay (very light)
      // draw particles
      for(const p of particlesRef.current){
        p.x += p.vx
        p.y += p.vy
        if(p.y < -10) { p.y = h + 10; p.x = Math.random()*w }
        if(p.x < -10) p.x = w+10
        if(p.x > w+10) p.x = -10

        ctx.beginPath()
        const grad = ctx.createRadialGradient(p.x,p.y,p.size*0.1,p.x,p.y,p.size)
        grad.addColorStop(0, 'rgba(201,168,79,'+ (p.alpha)+')')
        grad.addColorStop(1, 'rgba(201,168,79,0)')
        ctx.fillStyle = grad
        ctx.arc(p.x,p.y,p.size,0,Math.PI*2)
        ctx.fill()
      }
      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)

    return ()=>{
      if(rafRef.current) cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', onResize)
    }
  },[])

  return (
    <canvas ref={canvasRef} style={{position:'fixed',left:0,top:0,width:'100%',height:'100%',pointerEvents:'none',zIndex:1000}} aria-hidden />
  )
}
