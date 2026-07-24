'use client'

import React, { createContext, useContext, useEffect, useRef, useState } from 'react'

type TrackConfig = { url: string; loop?: boolean; volume?: number }

const TRACKS: Record<string, TrackConfig> = {
  'ambient-forest': { url: '/assets/audio/ambient-forest.mp3', loop: true, volume: 0.35 },
  'watch-tick': { url: '/assets/audio/watch-tick.mp3', loop: true, volume: 0.12 }
}

type TrackInstance = {
  element: HTMLAudioElement
  sourceNode: MediaElementAudioSourceNode
  gainNode: GainNode
  config: TrackConfig
  playing: boolean
}

type AudioContextValue = {
  isMuted: boolean
  initialized: boolean
  userGesture: () => Promise<void>
  playSceneAudio: (scene: string) => Promise<void>
  playOneShot: (name: string, volume?: number) => Promise<void>
  toggleMute: () => void
}

const AudioCtx = createContext<AudioContextValue | undefined>(undefined)

export function AudioProvider({ children }: { children: React.ReactNode }){
  const audioCtxRef = useRef<AudioContext | null>(null)
  const masterGainRef = useRef<GainNode | null>(null)
  const tracksRef = useRef<Record<string, TrackInstance>>({})
  const [isMuted, setIsMuted] = useState(false)
  const [initialized, setInitialized] = useState(false)

  // create AudioContext lazily upon user gesture
  const ensureAudioContext = () => {
    if(!audioCtxRef.current){
      const Ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      audioCtxRef.current = Ctx
      const master = Ctx.createGain()
      master.gain.value = isMuted ? 0 : 1
      master.connect(Ctx.destination)
      masterGainRef.current = master
    }
    return audioCtxRef.current
  }

  const loadTrack = (key: string): TrackInstance => {
    const existing = tracksRef.current[key]
    if(existing) return existing
    const config = TRACKS[key]
    const audio = new Audio(config.url)
    audio.loop = !!config.loop
    audio.preload = 'auto'
    audio.crossOrigin = 'anonymous'

    const ctx = ensureAudioContext()!
    const source = ctx.createMediaElementSource(audio)
    const gain = ctx.createGain()
    gain.gain.value = 0
    source.connect(gain)
    gain.connect(masterGainRef.current!)

    const inst: TrackInstance = { element: audio, sourceNode: source, gainNode: gain, config, playing: false }
    tracksRef.current[key] = inst
    return inst
  }

  const fadeGain = (gain: GainNode, from: number, to: number, time = 1.0) => {
    const ctx = audioCtxRef.current
    if(!ctx) return
    const now = ctx.currentTime
    try{
      gain.gain.cancelScheduledValues(now)
      gain.gain.setValueAtTime(from, now)
      gain.gain.linearRampToValueAtTime(to, now + time)
    }catch(e){
      // some browsers may throw if values aren't allowed — swallow
      gain.gain.value = to
    }
  }

  const userGesture = async () => {
    const ctx = ensureAudioContext()!
    if(ctx.state === 'suspended'){
      try{
        await ctx.resume()
      }catch(e){
        console.warn('AudioContext resume failed', e)
      }
    }
    setInitialized(true)
  }

  const playTrack = async (key:string, fadeIn = 1.0) => {
    const inst = loadTrack(key)
    try{
      if(inst.element.paused){
        await inst.element.play()
      }
    }catch(e){
      // play may be blocked if no gesture; caller should ensure userGesture called
      console.warn('Audio play blocked or failed for', key, e)
    }
    inst.playing = true
    const target = inst.config.volume ?? 0.5
    fadeGain(inst.gainNode, inst.gainNode.gain.value || 0, target, fadeIn)
  }

  const stopTrack = async (key:string, fadeOut = 1.0) => {
    const inst = tracksRef.current[key]
    if(!inst) return
    fadeGain(inst.gainNode, inst.gainNode.gain.value || 0, 0, fadeOut)
    setTimeout(()=>{
      try{ inst.element.pause(); inst.element.currentTime = 0 }catch(e){}
      inst.playing = false
    }, Math.max(200, fadeOut*1000))
  }

  const crossfadeTo = async (keys:string[], fade = 1.0) => {
    // Stop any tracks not in keys
    const currentKeys = Object.keys(tracksRef.current).filter(k=>tracksRef.current[k].playing)
    currentKeys.forEach(k => { if(!keys.includes(k)) stopTrack(k, fade) })

    // Start requested keys
    for(const k of keys){
      const inst = loadTrack(k)
      // ensure it's playing then fade to its configured volume
      await playTrack(k, fade)
    }
  }

  const playSceneAudio = async (scene:string) => {
    // map scene -> tracks. Scenes supported now: forest, countdown
    if(!initialized) {
      // do not auto-start audio if not initialized; caller should call userGesture first
      return
    }

    if(scene === 'forest'){
      await crossfadeTo(['ambient-forest'], 1.2)
    } else if(scene === 'countdown'){
      // keep ambient low and add tiny watch tick
      // ensure ambient is playing at low volume
      const ambient = loadTrack('ambient-forest')
      ambient.config.volume = 0.18
      await playTrack('ambient-forest', 0.9)
      await playTrack('watch-tick', 0.9)
      // leave both playing
    } else if(scene === 'invitation'){
      // softer ambient only
      await crossfadeTo(['ambient-forest'], 1.0)
    } else {
      // default: keep ambient muted
      await crossfadeTo([], 0.6)
    }
  }

  const playOneShot = async (name:string, volume = 0.8) => {
    // for one-shots we create a short audio element and play through the audio context for consistent volume control
    const ctx = ensureAudioContext()!
    const url = TRACKS[name]?.url
    if(!url){
      console.warn('No track url for', name)
      return
    }
    const audio = new Audio(url)
    audio.crossOrigin = 'anonymous'
    const source = ctx.createMediaElementSource(audio)
    const gain = ctx.createGain()
    gain.gain.value = 0
    source.connect(gain)
    gain.connect(masterGainRef.current!)
    try{
      await audio.play()
    }catch(e){
      console.warn('OneShot play blocked', e)
    }
    fadeGain(gain, 0, volume, 0.2)
    setTimeout(()=>{
      fadeGain(gain, volume, 0, 0.6)
      setTimeout(()=>{ try{ audio.pause(); audio.remove(); }catch(e){} }, 800)
    }, 800)
  }

  const toggleMute = () => {
    if(!masterGainRef.current || !audioCtxRef.current) { setIsMuted(!isMuted); return }
    const ctx = audioCtxRef.current
    const now = ctx.currentTime
    try{
      masterGainRef.current.gain.cancelScheduledValues(now)
      if(isMuted){
        masterGainRef.current.gain.setValueAtTime(0, now)
        masterGainRef.current.gain.linearRampToValueAtTime(1, now + 0.6)
        setIsMuted(false)
      } else {
        masterGainRef.current.gain.setValueAtTime(masterGainRef.current.gain.value || 1, now)
        masterGainRef.current.gain.linearRampToValueAtTime(0, now + 0.6)
        setIsMuted(true)
      }
    }catch(e){
      masterGainRef.current.gain.value = isMuted ? 1 : 0
      setIsMuted(!isMuted)
    }
  }

  useEffect(()=>{
    return ()=>{
      // cleanup: close audio context and pause elements
      try{
        Object.values(tracksRef.current).forEach(inst => { try{ inst.element.pause() } catch(e){} })
        if(audioCtxRef.current){ audioCtxRef.current.close() }
      }catch(e){}
    }
  }, [])

  return (
    <AudioCtx.Provider value={{ isMuted, initialized, userGesture, playSceneAudio, playOneShot, toggleMute }}>
      {children}
    </AudioCtx.Provider>
  )
}

export function useAudio(){
  const ctx = useContext(AudioCtx)
  if(!ctx) throw new Error('useAudio must be used within AudioProvider')
  return ctx
}
