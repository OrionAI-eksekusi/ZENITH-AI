'use client'
import { useState, useRef, useEffect } from 'react'

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8002'
const USER_ID = 'azvicky'

type State = 'idle' | 'listening' | 'thinking' | 'speaking'

export default function Home() {
  const [state, setState] = useState<State>('idle')
  const [transcript, setTranscript] = useState('')
  const [response, setResponse] = useState('')
  const [active, setActive] = useState(false)
  const audioRef = useRef<HTMLAudioElement|null>(null)
  const vadRef = useRef<any>(null)
  const stateRef = useRef<State>('idle')

  useEffect(() => { stateRef.current = state }, [state])

  const processAudio = async (audio: Float32Array) => {
    if (stateRef.current === 'thinking' || stateRef.current === 'speaking') return
    setState('thinking')

    try {
      // Convert Float32Array to WAV blob
      const wav = float32ToWav(audio, 16000)
      const blob = new Blob([wav], {type: 'audio/wav'})
      
      const form = new FormData()
      form.append('audio', blob, 'audio.wav')
      form.append('user_id', USER_ID)

      const res = await fetch(`${BACKEND}/voice/transcribe`, {method:'POST', body:form})
      const data = await res.json()

      if (data.status !== 'success' || !data.transcript) {
        setState('listening')
        return
      }

      setTranscript(data.transcript)
      setResponse(data.response)

      if (data.audio_b64) {
        setState('speaking')
        const audio = new Audio(`data:audio/mp3;base64,${data.audio_b64}`)
        audioRef.current = audio
        audio.onended = () => {
          setState('listening')
          setTranscript('')
          setResponse('')
        }
        await audio.play().catch(() => setState('listening'))
      } else {
        setState('listening')
      }
    } catch(e) {
      console.error(e)
      setState('listening')
    }
  }

  const startVAD = async () => {
    try {
      const { MicVAD } = await import('@ricky0123/vad-web')
      const vad = await MicVAD.new({
        onSpeechEnd: (audio: Float32Array) => {
          processAudio(audio)
        },
        onSpeechStart: () => {
          if (stateRef.current === 'listening') {
            setTranscript('')
          }
        },
        positiveSpeechThreshold: 0.8,
        negativeSpeechThreshold: 0.8,
        minSpeechFrames: 3,
        preSpeechPadFrames: 10,
        redemptionFrames: 8,
      })
      vadRef.current = vad
      vad.start()
      setState('listening')
    } catch(e) {
      console.error('[VAD ERROR]', e)
    }
  }

  const stopVAD = () => {
    vadRef.current?.destroy()
    vadRef.current = null
    audioRef.current?.pause()
    setState('idle')
    setTranscript('')
    setResponse('')
  }

  const toggleActive = async () => {
    if (active) {
      stopVAD()
      setActive(false)
    } else {
      setActive(true)
      await startVAD()
    }
  }

  // WAV encoder
  function float32ToWav(samples: Float32Array, sampleRate: number): ArrayBuffer {
    const buf = new ArrayBuffer(44 + samples.length * 2)
    const view = new DataView(buf)
    const writeStr = (s: string, o: number) => { for(let i=0;i<s.length;i++) view.setUint8(o+i, s.charCodeAt(i)) }
    writeStr('RIFF', 0)
    view.setUint32(4, 36 + samples.length * 2, true)
    writeStr('WAVE', 8)
    writeStr('fmt ', 12)
    view.setUint32(16, 16, true)
    view.setUint16(20, 1, true)
    view.setUint16(22, 1, true)
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * 2, true)
    view.setUint16(32, 2, true)
    view.setUint16(34, 16, true)
    writeStr('data', 36)
    view.setUint32(40, samples.length * 2, true)
    let offset = 44
    for(let i=0; i<samples.length; i++, offset+=2) {
      const s = Math.max(-1, Math.min(1, samples[i]))
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true)
    }
    return buf
  }

  const stateColor = {
    idle: 'rgba(77,123,255,0.0)',
    listening: 'rgba(77,123,255,0.3)',
    thinking: 'rgba(139,92,246,0.3)',
    speaking: 'rgba(77,123,255,0.5)',
  }

  const stateLabel = {
    idle: '',
    listening: '● LISTENING',
    thinking: '◌ THINKING',
    speaking: '▶ SPEAKING',
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;}
        html,body{width:100%;height:100%;overflow:hidden;background:#06090f;}
        @keyframes breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
        @keyframes listening{0%{transform:scale(1);opacity:0.5}100%{transform:scale(1.9);opacity:0}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes speaking{0%,100%{filter:drop-shadow(0 0 20px rgba(77,123,255,0.4))}50%{filter:drop-shadow(0 0 80px rgba(77,123,255,1))}}
        @keyframes shimmer{0%{background-position:0%}100%{background-position:200%}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      <div style={{
        width:'100vw',height:'100vh',
        display:'flex',flexDirection:'column',
        alignItems:'center',justifyContent:'center',
        background:'#06090f',
        position:'relative',overflow:'hidden',
        userSelect:'none',
      }}>

        {/* ZANITH label */}
        <div style={{
          position:'absolute',top:32,
          fontFamily:'JetBrains Mono,monospace',
          fontSize:11,fontWeight:500,letterSpacing:'0.35em',
          background:'linear-gradient(90deg,#4c7bff,#8b5cf6,#4c7bff)',
          backgroundSize:'200%',
          WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',
          animation:'shimmer 4s linear infinite',
        }}>ZANITH</div>

        {/* ORB */}
        <div style={{position:'relative',width:280,height:280,display:'flex',alignItems:'center',justifyContent:'center'}}>

          {/* Ripples when listening */}
          {state === 'listening' && [0,0.5,1].map((d,i) => (
            <div key={i} style={{
              position:'absolute',width:240,height:240,borderRadius:'50%',
              border:'1px solid rgba(77,123,255,0.35)',
              animation:`listening 2.5s ease-out ${d}s infinite`,
            }}/>
          ))}

          {/* Thinking ring */}
          {state === 'thinking' && (
            <div style={{position:'absolute',width:260,height:260,borderRadius:'50%',border:'1px solid transparent',borderTop:'1px solid rgba(139,92,246,0.6)',animation:'spin 1s linear infinite'}}/>
          )}

          {/* SVG Logo */}
          <div onClick={toggleActive} style={{cursor:'pointer'}}>
            <svg viewBox="0 0 200 200" width="220" height="220" style={{
              animation: state==='speaking' ? 'speaking 1.2s ease-in-out infinite' : 'breathe 4s ease-in-out infinite',
              filter: state==='idle' && !active ? 'drop-shadow(0 0 15px rgba(77,123,255,0.2))' :
                      state==='listening' ? 'drop-shadow(0 0 30px rgba(77,123,255,0.6))' :
                      state==='thinking' ? 'drop-shadow(0 0 20px rgba(139,92,246,0.5))' :
                      'drop-shadow(0 0 50px rgba(77,123,255,0.9))',
              transition:'filter 0.5s',
            }}>
              <defs>
                <radialGradient id="g1" cx="50%" cy="50%" r="60%">
                  <stop offset="40%" stopColor="#4c7bff" stopOpacity="0"/>
                  <stop offset="58%" stopColor="#4c7bff" stopOpacity={state==='speaking'?"1":"0.9"}/>
                  <stop offset="70%" stopColor="#4c7bff" stopOpacity="0"/>
                </radialGradient>
                <radialGradient id="g2" cx="50%" cy="50%" r="55%">
                  <stop offset="55%" stopColor="#8b5cf6" stopOpacity="0"/>
                  <stop offset="80%" stopColor="#8b5cf6" stopOpacity={active?"0.4":"0.25"}/>
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0"/>
                </radialGradient>
                <radialGradient id="g3" cx="35%" cy="25%" r="80%">
                  <stop offset="0%" stopColor="#1a2347"/>
                  <stop offset="60%" stopColor="#0d1228"/>
                  <stop offset="100%" stopColor="#06090f"/>
                </radialGradient>
              </defs>
              <rect width="200" height="200" fill="url(#g3)"/>
              <circle cx="100" cy="100" r="98" fill="url(#g2)"/>
              <circle cx="100" cy="100" r="72" fill="url(#g1)"/>
              <circle cx="100" cy="100" r="68" fill="none" stroke="#4c7bff" strokeWidth="1.5" opacity={active?"1":"0.9"}/>
              <circle cx="100" cy="100" r="58" fill="#08101f"/>
              <circle cx="78" cy="76" r="4" fill="#4c7bff" opacity={active?"1":"0.75"}/>
            </svg>
          </div>
        </div>

        {/* Status */}
        <div style={{marginTop:32,textAlign:'center',minHeight:80}}>
          {!active && (
            <div style={{animation:'fadeIn 0.3s ease'}}>
              <div style={{fontFamily:'JetBrains Mono,monospace',fontSize:11,color:'rgba(77,123,255,0.4)',letterSpacing:'0.2em'}}>TAP TO ACTIVATE</div>
            </div>
          )}

          {active && state !== 'idle' && (
            <div style={{animation:'fadeIn 0.2s ease'}}>
              <div style={{fontFamily:'JetBrains Mono,monospace',fontSize:10,letterSpacing:'0.2em',
                color: state==='listening'?'rgba(77,123,255,0.8)':state==='thinking'?'rgba(139,92,246,0.8)':'rgba(77,123,255,0.9)',
                marginBottom:16,
              }}>{stateLabel[state]}</div>

              {transcript && (
                <div style={{fontSize:12,color:'rgba(255,255,255,0.4)',fontFamily:'JetBrains Mono,monospace',marginBottom:12,animation:'fadeIn 0.3s ease'}}>
                  "{transcript}"
                </div>
              )}

              {response && (
                <div style={{maxWidth:360,margin:'0 auto',padding:'14px 18px',background:'rgba(77,123,255,0.05)',border:'1px solid rgba(77,123,255,0.1)',borderRadius:14,animation:'fadeIn 0.3s ease'}}>
                  <div style={{fontSize:13,color:'rgba(220,232,255,0.8)',lineHeight:1.7,fontFamily:'JetBrains Mono,monospace',fontSize:11,letterSpacing:'0.02em'}}>{response}</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom hint */}
        <div style={{position:'absolute',bottom:32,fontFamily:'JetBrains Mono,monospace',fontSize:9,letterSpacing:'0.15em',color:'rgba(77,123,255,0.2)'}}>
          {active ? 'TAP TO DEACTIVATE' : 'ZANITH AI · VOICE ASSISTANT'}
        </div>

      </div>
    </>
  )
}
