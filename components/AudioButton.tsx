use client'

import React, { useEffect, useRef, useState } from 'react'

export default function AudioButton(){
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)

  useEffect(()=>{
    // create audio element lazily
    if(!audioRef.current){
      const a = typeof window !== 'undefined' ? new Audio('/assets/audio/ambient.mp3') : null
      if(a){
        a.loop = true
        a.volume = 0.55
      }
      audioRef.current = a
    }
  },[])

  const toggle = async () => {
    if(!audioRef.current) return
    try{
      if(playing){
        audioRef.current.pause();
        setPlaying(false)
      } else {
        await audioRef.current.play();
        setPlaying(true)
      }
    }catch(e){
      console.warn('Audio play prevented', e)
    }
  }

  return (
    <button aria-pressed={playing} onClick={toggle} className="btn-primary" style={{padding:'8px 14px'}}>
      {playing ? 'Pauză muzică' : 'Pornește muzica'}
    </button>
  )
}
