use client'

import React, { useEffect } from 'react'
import LoadingScreen from '../components/LoadingScreen'
import ForestScene from '../scenes/ForestScene'
import BookScene from '../scenes/BookScene'
import InvitationScene from '../scenes/InvitationScene'
import CountdownScene from '../scenes/CountdownScene'
import { useScene } from '../contexts/SceneContext'
import { useAudio } from '../contexts/AudioContext'

export default function SceneContainer(){
  const { scene } = useScene()
  const audio = useAudio()

  useEffect(()=>{
    // trigger audio transitions on scene change
    audio.playSceneAudio(scene).catch(e=>{})
  },[scene])

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
