use client'

import React from 'react'
import LoadingScreen from '../components/LoadingScreen'
import ForestScene from '../scenes/ForestScene'
import { useScene } from '../contexts/SceneContext'

export default function SceneContainer(){
  const { scene } = useScene()

  return (
    <div style={{height:'100vh', width:'100%'}}>
      {scene === 'loading' && <LoadingScreen />}
      {scene === 'forest' && <ForestScene />}
      {/* other scenes will be added here */}
    </div>
  )
}
