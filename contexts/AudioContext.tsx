'use client'

import React, { createContext, useContext, useEffect, useRef, useState } from 'react'

/*
  AudioContext provider with support for:
  - HTMLAudioElement-based tracks (if files are present in public/assets/audio/)
  - Procedural generated ambient and tick (fallback / default) using Web Audio nodes
  - Crossfade, fade in/out, one-shots, and scene-based audio maps
  - Public API: userGesture(), playSceneAudio(scene), playOneShot(name), toggleMute()

  This version prefers procedural generation so the app works immediately without external mp3 files.
*/

type TrackConfig = { url?: string; loop?: boolean; volume?: number; procedural?: boolean }

const TRACKS: Record<string, TrackConfig> = {
  'ambient-forest': { url: '/assets/audio/ambient-forest.mp3', loop: true, volume: 0.35, procedural: true },
  'watch-tick': { url: '/assets/audio/watch-tick.mp3', loop: true, volume: 0.12, procedural: true }
}

type TrackInstance = {
  element?: HTMLAudioElement | null
  sourceNode?: MediaElementAudioSourceNode | null
  gainNode: GainNode
  config: TrackConfig
  playing: boolean
  stop?: () => void
  start?: () => void
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

  const fadeGain = (gain: GainNode, from: number, to: number, time = 1.0) => {
    const ctx = audioCtxRef.current
    if(!ctx) return
    const now = ctx.currentTime
    try{
      gain.gain.cancelScheduledValues(now)
      gain.gain.setValueAtTime(from, now)
      gain.gain.linearRampToValueAtTime(to, now + time)
    }catch(e){
      gain.gain.value = to
    }
  }

  // Procedural generators
  const createProceduralAmbient = (ctx: AudioContext, gain: GainNode) => {
    // gentle layered ambient: low oscillator + filtered noise + slow LFO on filter
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = 55 // low drone

    const oscGain = ctx.createGain()
    oscGain.gain.value = 0.02

    const noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate)
    const data = noiseBuf.getChannelData(0)
    for(let i=0;i<data.length;i++) data[i] = (Math.random()*2-1)*0.25
    const nb = ctx.createBufferSource()
    nb.buffer = noiseBuf
    nb.loop = true

    const noiseFilter = ctx.createBiquadFilter()
    noiseFilter.type = 'lowpass'
    noiseFilter.frequency.value = 800

    const noiseGain = ctx.createGain()
    noiseGain.gain.value = 0.03

    // slow LFO
    const lfo = ctx.createOscillator()
    lfo.frequency.value = 0.05
    const lfoGain = ctx.createGain()
    lfoGain.gain.value = 200
    lfo.connect(lfoGain)
    lfoGain.connect(noiseFilter.frequency)

    // connect
    osc.connect(oscGain)
    oscGain.connect(gain)

    nb.connect(noiseFilter)
    noiseFilter.connect(noiseGain)
    noiseGain.connect(gain)

    // start nodes
    osc.start()
    nb.start()
    lfo.start()

    const stop = ()=>{
      try{ osc.stop(); nb.stop(); lfo.stop() }catch(e){}
    }

    return { stop }
  }

  const createProceduralTick = (ctx: AudioContext, gain: GainNode) => {
    // create a periodic ticking using scheduled short blips of a triangle oscillator
    let timerId: number | null = null
    let running = true

    const scheduleTick = () => {
      if(!running) return
      const t = ctx.currentTime
      const o = ctx.createOscillator()
      o.type = 'triangle'
      o.frequency.value = 1500
      const g = ctx.createGain()
      g.gain.value = 0.0001
      o.connect(g)
      g.connect(gain)
      // tiny envelope
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(0.08, t+0.01)
      g.gain.exponentialRampToValueAtTime(0.0001, t+0.14)
      o.start(t)
      o.stop(t+0.16)

      // schedule next tick in approx 1s with slight humanization
      const next = 0.95 + Math.random()*0.1
      timerId = window.setTimeout(()=> scheduleTick(), next*1000)
    }

    scheduleTick()

    const stop = () => { running = false; if(timerId) clearTimeout(timerId) }
    return { stop }
  }

  const loadProceduralTrack = (key: string): TrackInstance => {
    const ctx = ensureAudioContext()!
    const gain = ctx.createGain()
    gain.gain.value = 0
    gain.connect(masterGainRef.current!)
    let controller: { stop?: ()=>void } = {}

    if(key === 'ambient-forest'){
      controller = createProceduralAmbient(ctx, gain)
    } else if(key === 'watch-tick'){
      controller = createProceduralTick(ctx, gain)
    }

    const inst: TrackInstance = { element: null, sourceNode: null, gainNode: gain, config: TRACKS[key], playing: false, stop: controller.stop }
    tracksRef.current[key] = inst
    return inst
  }

  const loadHtmlAudioTrack = (key: string): TrackInstance => {
    const cfg = TRACKS[key]
    const audio = new Audio(cfg.url)
    audio.loop = !!cfg.loop
    audio.preload = 'auto'
    audio.crossOrigin = 'anonymous'

    const ctx = ensureAudioContext()!
    const source = ctx.createMediaElementSource(audio)
    const gain = ctx.createGain()
    gain.gain.value = 0
    source.connect(gain)
    gain.connect(masterGainRef.current!)

    const inst: TrackInstance = { element: audio, sourceNode: source, gainNode: gain, config: cfg, playing: false, stop(){ try{ audio.pause(); audio.currentTime = 0 }catch(e){} } }
    tracksRef.current[key] = inst
    return inst
  }

  const loadTrack = (key:string): TrackInstance => {
    const existing = tracksRef.current[key]
    if(existing) return existing
    const cfg = TRACKS[key]
    // prefer HTML audio if URL exists and procedural not explicitly requested only
    if(cfg.procedural){
      // create procedural track for immediate availability
      return loadProceduralTrack(key)
    }
    // fallback: if URL exists create html audio
    return loadHtmlAudioTrack(key)
  }

  const userGesture = async () => {
    const ctx = ensureAudioContext()!
    if(ctx.state === 'suspended'){
      try{ await ctx.resume() }catch(e){ console.warn('AudioContext resume failed', e) }
    }
    setInitialized(true)
  }

  const playTrack = async (key:string, fadeIn = 1.0) => {
    const inst = loadTrack(key)
    if(inst.element){
      try{ if(inst.element.paused) await inst.element.play() }catch(e){ console.warn('Audio play blocked or failed for', key, e) }
    }
    inst.playing = true
    const target = inst.config.volume ?? 0.5
    fadeGain(inst.gainNode, inst.gainNode.gain.value || 0, target, fadeIn)
    if(inst.start && !inst.playing) inst.start()
  }

  const stopTrack = async (key:string, fadeOut = 1.0) => {
    const inst = tracksRef.current[key]
    if(!inst) return
    fadeGain(inst.gainNode, inst.gainNode.gain.value || 0, 0, fadeOut)
    setTimeout(()=>{
      try{ if(inst.element){ inst.element.pause(); inst.element.currentTime = 0 } }catch(e){}
      if(inst.stop) inst.stop()
      inst.playing = false
    }, Math.max(200, fadeOut*1000))
  }

  const crossfadeTo = async (keys:string[], fade = 1.0) => {
    const currentKeys = Object.keys(tracksRef.current).filter(k=>tracksRef.current[k].playing)
    currentKeys.forEach(k => { if(!keys.includes(k)) stopTrack(k, fade) })
    for(const k of keys){ await playTrack(k, fade) }
  }

  const playSceneAudio = async (scene:string) => {
    if(!initialized) return
    if(scene === 'forest'){
      await crossfadeTo(['ambient-forest'], 1.2)
    } else if(scene === 'countdown'){
      // ambient low + watch tick
      await playTrack('ambient-forest', 0.9)
      await playTrack('watch-tick', 0.9)
    } else if(scene === 'invitation'){
      await crossfadeTo(['ambient-forest'], 1.0)
    } else {
      await crossfadeTo([], 0.6)
    }
  }

  const playOneShot = async (name:string, volume = 0.8) => {
    const ctx = ensureAudioContext()!
    // for one-shots, if the track is procedural, create a short blip; else play the file
    const cfg = TRACKS[name]
    if(cfg?.procedural){
      // simple one-shot bell using oscillator
      const o = ctx.createOscillator()
      o.type = 'sine'
      o.frequency.value = 800
      const g = ctx.createGain()
      g.gain.value = 0
      o.connect(g)
      g.connect(masterGainRef.current!)
      const t = ctx.currentTime
      g.gain.setValueAtTime(0, t)
      g.gain.linearRampToValueAtTime(volume, t+0.01)
      g.gain.exponentialRampToValueAtTime(0.001, t+0.9)
      o.start(t)
      o.stop(t+1.0)
      return
    }
    const url = cfg?.url
    if(!url) return
    const audio = new Audio(url)
    audio.crossOrigin = 'anonymous'
    const source = ctx.createMediaElementSource(audio)
    const gain = ctx.createGain()
    gain.gain.value = 0
    source.connect(gain)
    gain.connect(masterGainRef.current!)
    try{ await audio.play() }catch(e){ console.warn('OneShot play blocked', e) }
    fadeGain(gain, 0, volume, 0.2)
    setTimeout(()=>{ fadeGain(gain, volume, 0, 0.6); setTimeout(()=>{ try{ audio.pause(); audio.remove() }catch(e){} },800) }, 800)
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
      try{
        Object.values(tracksRef.current).forEach(inst => { try{ if(inst.element) inst.element.pause() } catch(e){} })
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
