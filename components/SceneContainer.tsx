use client'

import React from 'react'
import LoadingScreen from '../components/LoadingScreen'
import ForestScene from '../scenes/ForestScene'
import BookScene from '../scenes/BookScene'
import InvitationScene from '../scenes/InvitationScene'
import CountdownScene from '../scenes/CountdownScene'
import { useScene } from '../contexts/SceneContext'

export default function SceneContainer(){
  const { scene } = useScene()

  return (
    <div style={{height:'100vh', width:'100%'}}>
      {scene === 'loading' && <LoadingScreen />}
      {scene === 'forest' && <ForestScene />}
      {scene === 'book' && <BookScene />}
      {scene === 'invitation' && <InvitationScene />}
      {scene === 'countdown' && <CountdownScene />}
      {/* other scenes will be added here */}
    </div>
  )
}
