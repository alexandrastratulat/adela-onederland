use client'

import React, { createContext, useContext, useState } from 'react'

type Scene = 'loading' | 'forest' | 'book' | 'invitation' | 'countdown' | 'tea' | 'gallery' | 'rsvp' | 'location' | 'ending'

interface SceneContextValue {
  scene: Scene
  setScene: (s: Scene) => void
}

const SceneContext = createContext<SceneContextValue | undefined>(undefined)

export function SceneProvider({ children }: { children: React.ReactNode }){
  const [scene, setScene] = useState<Scene>('loading')
  return (
    <SceneContext.Provider value={{scene, setScene}}>
      {children}
    </SceneContext.Provider>
  )
}

export function useScene(){
  const ctx = useContext(SceneContext)
  if(!ctx) throw new Error('useScene must be used inside SceneProvider')
  return ctx
}
