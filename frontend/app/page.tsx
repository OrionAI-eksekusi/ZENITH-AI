'use client'
import { useState, useRef, useEffect } from 'react'

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8002'
const USER_ID = 'azvicky'

type State = 'idle' | 'listening' | 'thinking' | 'speaking'

export default function Home() {
  const [state, setState] = useState<State>('idle')
  const [transcript, setTranscript] = useState('')
  const [response, setResponse] = useState('')
  const mediaRecorderRef = useRef<MediaRecorder|null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement|null>(null)

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({audio:true})
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 
                    MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : ''
      const mr = new MediaRecorder(stream, mimeType ? {mimeType} : {})
      mediaRecorderRef.current = mr
      audioChunksRef.current = []
      mr.ondataavailable = e => { if(e.data.size > 0) audioChunksRef.current.push(e.data) }
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop())
        const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 
                         MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : 'audio/wav'
        const blob = new Blob(audioChunksRef.current, {type: mimeType})
        await processAudio(blob)
      }
      mr.start()
      setState('listening')
      setTranscript('')
      setResponse('')
    } catch(e) {
      console.error(e)
    }
  }

  const stopListening = () => {
    mediaRecorderRef.current?.stop()
    setState('thinking')
  }

  const processAudio = async (blob: Blob) => {
    try {
      const form = new FormData()
      form.append('audio', blob, 'audio.webm')
      form.append('user_id', USER_ID)
      const res = await fetch(`${BACKEND}/voice/transcribe`, {method:'POST', body:form})
      const data = await res.json()
      if (data.status !== 'success') { setState('idle'); return }
      setTranscript(data.transcript)
      setResponse(data.response)
      if (data.audio_b64) {
        setState('speaking')
        const audio = new Audio(`data:audio/mp3;base64,${data.audio_b64}`)
        audioRef.current = audio
        audio.onended = () => { setState('idle'); startListening() }
        audio.play().catch(() => setState('idle'))
      } else {
        setState('idle')
        startListening()
      }
    } catch(e) {
      setState('idle')
    }
  }

  const handleTap = () => {
    if (state === 'idle') startListening()
    else if (state === 'listening') stopListening()
    else if (state === 'speaking') { audioRef.current?.pause(); setState('idle'); startListening() }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;}
        html,body{width:100%;height:100%;overflow:hidden;background:#06090f;}

        @keyframes breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}
        @keyframes pulse-ring{0%,100%{opacity:0.6}50%{opacity:1}}
        @keyframes listening-ring{0%{transform:scale(1);opacity:0.6}100%{transform:scale(1.8);opacity:0}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes speaking-glow{0%,100%{filter:drop-shadow(0 0 20px rgba(77,123,255,0.4))}50%{filter:drop-shadow(0 0 60px rgba(77,123,255,0.9)) drop-shadow(0 0 100px rgba(139,92,246,0.4))}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmer{0%{background-position:0%}100%{background-position:200%}}
      `}</style>

      <div onClick={handleTap} style={{
        width:'100vw', height:'100vh',
        display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center',
        background:'#06090f',
        cursor:'pointer',
        position:'relative',
        overflow:'hidden',
        userSelect:'none',
      }}>

        {/* Subtle bg glow */}
        <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:600,height:600,background:'radial-gradient(circle,rgba(77,123,255,0.04) 0%,transparent 65%)',pointerEvents:'none'}} />

        {/* LOGO — Event Horizon */}
        <div style={{
          position:'relative',
          width:260, height:260,
          display:'flex', alignItems:'center', justifyContent:'center',
        }}>

          {/* Listening ripples */}
          {state === 'listening' && [0,0.4,0.8].map((d,i) => (
            <div key={i} style={{
              position:'absolute',
              width:260, height:260,
              borderRadius:'50%',
              border:'1px solid rgba(77,123,255,0.4)',
              animation:`listening-ring 2s ease-out ${d}s infinite`,
            }} />
          ))}

          {/* Thinking spinner */}
          {state === 'thinking' && (
            <div style={{position:'absolute',width:280,height:280,borderRadius:'50%',border:'1px solid transparent',borderTop:'1px solid rgba(77,123,255,0.5)',animation:'spin 1s linear infinite'}} />
          )}

          {/* SVG Logo */}
          <svg
            viewBox="0 0 200 200"
            width="240"
            height="240"
            style={{
              animation: state === 'idle' ? 'breathe 4s ease-in-out infinite' :
                         state === 'listening' ? 'breathe 1.5s ease-in-out infinite' :
                         state === 'speaking' ? 'speaking-glow 1.5s ease-in-out infinite' :
                         'breathe 0.8s ease-in-out infinite',
              filter: state === 'idle' ? 'drop-shadow(0 0 20px rgba(77,123,255,0.3))' :
                      state === 'listening' ? 'drop-shadow(0 0 30px rgba(77,123,255,0.6))' :
                      state === 'thinking' ? 'drop-shadow(0 0 20px rgba(139,92,246,0.5))' :
                      'drop-shadow(0 0 40px rgba(77,123,255,0.8))',
              transition:'filter 0.5s ease',
            }}
          >
            <defs>
              <radialGradient id="eh-glow" cx="50%" cy="50%" r="60%">
                <stop offset="40%" stopColor="#4c7bff" stopOpacity="0"/>
                <stop offset="58%" stopColor="#4c7bff" stopOpacity={state==='speaking'?"1":"0.9"}/>
                <stop offset="70%" stopColor="#4c7bff" stopOpacity="0"/>
              </radialGradient>
              <radialGradient id="eh-outer" cx="50%" cy="50%" r="55%">
                <stop offset="55%" stopColor="#8b5cf6" stopOpacity="0"/>
                <stop offset="80%" stopColor="#8b5cf6" stopOpacity={state==='speaking'?"0.5":"0.25"}/>
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0"/>
              </radialGradient>
              <radialGradient id="eh-bg" cx="35%" cy="25%" r="80%">
                <stop offset="0%" stopColor="#1a2347"/>
                <stop offset="60%" stopColor="#0d1228"/>
                <stop offset="100%" stopColor="#06090f"/>
              </radialGradient>
            </defs>
            <rect width="200" height="200" fill="url(#eh-bg)"/>
            <circle cx="100" cy="100" r="98" fill="url(#eh-outer)"/>
            <circle cx="100" cy="100" r="72" fill="url(#eh-glow)"/>
            <circle cx="100" cy="100" r="68" fill="none" stroke="#4c7bff" strokeWidth="1.5" opacity="0.9"/>
            <circle cx="100" cy="100" r="58" fill="#08101f"/>
            <circle cx="78" cy="76" r="4" fill="#4c7bff" opacity="0.75"/>
          </svg>
        </div>

        {/* Status */}
        <div style={{marginTop:48,textAlign:'center'}}>
          <div style={{
            fontFamily:'JetBrains Mono,monospace',
            fontSize:11,
            letterSpacing:'0.2em',
            color: state==='idle'?'rgba(77,123,255,0.4)':
                   state==='listening'?'rgba(77,123,255,0.9)':
                   state==='thinking'?'rgba(139,92,246,0.8)':
                   'rgba(77,123,255,0.9)',
            transition:'color 0.3s',
            marginBottom:16,
          }}>
            {state==='idle' && 'TAP TO SPEAK'}
            {state==='listening' && '● LISTENING'}
            {state==='thinking' && '◌ THINKING'}
            {state==='speaking' && '▶ SPEAKING'}
          </div>

          {/* Transcript */}
          {transcript && (
            <div style={{animation:'fadeIn 0.3s ease',maxWidth:340,margin:'0 auto',marginBottom:12}}>
              <div style={{fontSize:13,color:'rgba(255,255,255,0.5)',fontFamily:'JetBrains Mono,monospace',letterSpacing:'0.05em'}}>"{transcript}"</div>
            </div>
          )}

          {/* Response */}
          {response && (
            <div style={{animation:'fadeIn 0.3s ease',maxWidth:380,margin:'0 auto',padding:'16px 20px',background:'rgba(77,123,255,0.05)',border:'1px solid rgba(77,123,255,0.1)',borderRadius:16}}>
              <div style={{color:'rgba(220,232,255,0.85)',lineHeight:1.7,fontFamily:"'JetBrains Mono',monospace",fontSize:12,letterSpacing:'0.03em'}}>{response}</div>
            </div>
          )}
        </div>

        {/* ZANITH label */}
        <div style={{
          position:'absolute',top:32,left:'50%',transform:'translateX(-50%)',
          fontFamily:'JetBrains Mono,monospace',
          fontSize:11,fontWeight:500,letterSpacing:'0.3em',
          background:'linear-gradient(90deg,#4c7bff,#8b5cf6,#4c7bff)',
          backgroundSize:'200%',
          WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',
          animation:'shimmer 4s linear infinite',
        }}>ZANITH</div>

        {/* Hint bottom */}
        <div style={{position:'absolute',bottom:32,fontFamily:'JetBrains Mono,monospace',fontSize:9,color:'rgba(77,123,255,0.25)',letterSpacing:'0.15em'}}>
          {state==='idle'?'TAP ANYWHERE TO START':state==='listening'?'TAP TO SEND':''}
        </div>

      </div>
    </>
  )
}
