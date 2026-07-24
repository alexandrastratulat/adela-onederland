use client'

import React, { useEffect, useState } from 'react'
import { useScene } from '../contexts/SceneContext'

export default function LoadingScreen(){
  const [loaded, setLoaded] = useState(false)
  const { setScene } = useScene()

  useEffect(()=>{
    const t = setTimeout(()=> setLoaded(true), 1600)
    return ()=> clearTimeout(t)
  },[])

  return (
    <div className="loading-root" style={{height:'100vh',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:'1.25rem'}}>
      <div className="logo-mark">Adela in ONEderland</div>
      <div className="loading-quote">„Din ce în ce mai curios!”</div>
      <div className="flex items-center gap-4">
        <button className="btn-primary" onClick={() => {
          // user interaction -> proceed
          setScene('forest')
        }}>Pornește muzica</button>
      </div>
      {loaded && <div className="mt-6 text-sm text-gray-300">Apasă butonul pentru a porni povestea</div>}
    </div>
  )
}
