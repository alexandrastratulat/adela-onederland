'use client'

import React, { useEffect } from 'react'
import { useAudio } from '../contexts/AudioContext'

export default function AudioControls(){
  const { isMuted, toggleMute, initialized, userGesture } = useAudio()

  useEffect(()=>{
    // ensure we can resume audio if user interacts with controls
    const handler = () => { userGesture().catch(()=>{}) }
    window.addEventListener('pointerdown', handler, { once: true })
    return () => window.removeEventListener('pointerdown', handler)
  },[userGesture])

  return (
    <div style={{position:'fixed',right:20,top:20,zIndex:1200}}>
      <button onClick={toggleMute} aria-pressed={isMuted} className="btn-primary" style={{padding:'8px 12px'}}>
        {isMuted ? 'Sunet oprit' : 'Sunet pornit'}
      </button>
    </div>
  )
}
