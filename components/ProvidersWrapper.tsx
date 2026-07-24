use client'

import React, { useEffect } from 'react'
import { SceneProvider } from '../contexts/SceneContext'
import { AudioProvider } from '../contexts/AudioContext'
import ParticlesOverlay from '../components/ParticlesOverlay'
import AudioControls from '../components/AudioControls'

export default function ProvidersWrapper({ children } : { children: React.ReactNode }){
  // empty effect to ensure client rendering
  useEffect(()=>{},[])
  return (
    <AudioProvider>
      <SceneProvider>
        <ParticlesOverlay />
        <AudioControls />
        {children}
      </SceneProvider>
    </AudioProvider>
  )
}
