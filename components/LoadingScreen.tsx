use client'

import React, { useEffect, useState } from 'react'
import { useScene } from '../contexts/SceneContext'
import { useAudio } from '../contexts/AudioContext'

export default function LoadingScreen(){
  const [loaded, setLoaded] = useState(false)
  const { setScene } = useScene()
  const audio = useAudio()

  useEffect(()=>{
    const t = setTimeout(()=> setLoaded(true), 1600)
    return ()=> clearTimeout(t)
  },[])

  const start = async () =>{
    // register user gesture for audio
    try{
      await audio.userGesture()
      // start forest audio immediately but respect audio provider rules
      await audio.playSceneAudio('forest')
    }catch(e){
      // ignore
    }
    setScene('forest')
  }

  return (
    <div className="loading-root" style={{height:'100vh',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:'1.25rem'}}>
      <div className="logo-mark">Adela in ONEderland</div>
      <div className="loading-quote">„Din ce în ce mai curios!”</div>
      <div className="flex items-center gap-4">
        <button className="btn-primary" onClick={start}>Pornește muzica</button>
      </div>
      {loaded && <div className="mt-6 text-sm text-gray-300">Apasă butonul pentru a porni povestea</div>}
    </div>
  )
}
