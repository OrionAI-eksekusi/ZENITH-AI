'use client'
import { useState, useRef } from 'react'

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8002'
const USER_ID = 'azvicky'
type State = 'idle' | 'listening' | 'thinking' | 'speaking'

export default function Home() {
  const [state, setState] = useState<State>('idle')
  const [active, setActive] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [response, setResponse] = useState('')
  const audioRef = useRef<HTMLAudioElement|null>(null)
  const stateRef = useRef<State>('idle')
  const activeRef = useRef(false)
  const contextRef = useRef<AudioContext|null>(null)
  const processorRef = useRef<ScriptProcessorNode|null>(null)
  const streamRef = useRef<MediaStream|null>(null)
  const chunksRef = useRef<Float32Array[]>([])
  const silenceRef = useRef<number>(0)
  const recordingRef = useRef(false)

  const updateState = (s: State) => { setState(s); stateRef.current = s }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({audio:{sampleRate:16000,channelCount:1}})
      streamRef.current = stream
      const ctx = new AudioContext({sampleRate:16000})
      contextRef.current = ctx
      const source = ctx.createMediaStreamSource(stream)
      const processor = ctx.createScriptProcessor(4096,1,1)
      processorRef.current = processor
      chunksRef.current = []
      silenceRef.current = 0
      recordingRef.current = false

      processor.onaudioprocess = (e) => {
        if (!activeRef.current) return
        const data = e.inputBuffer.getChannelData(0)
        const chunk = new Float32Array(data)
        let sum = 0
        for (let i=0;i<chunk.length;i++) sum += chunk[i]*chunk[i]
        const rms = Math.sqrt(sum/chunk.length)
        if (rms > 0.01) {
          silenceRef.current = 0
          if (!recordingRef.current) recordingRef.current = true
          chunksRef.current.push(chunk)
        } else if (recordingRef.current) {
          silenceRef.current++
          chunksRef.current.push(chunk)
          if (silenceRef.current > 6) {
            recordingRef.current = false
            silenceRef.current = 0
            if (stateRef.current === 'listening') {
              const allChunks = chunksRef.current.splice(0)
              processAudio(allChunks)
            }
          }
        }
      }
      source.connect(processor)
      processor.connect(ctx.destination)
      updateState('listening')
    } catch(e) {
      console.error('[MIC]',e)
      alert('Izinkan akses microphone')
    }
  }

  const stopRecording = () => {
    processorRef.current?.disconnect()
    contextRef.current?.close()
    streamRef.current?.getTracks().forEach(t=>t.stop())
    processorRef.current=null; contextRef.current=null; streamRef.current=null
    chunksRef.current=[]
  }

  const processAudio = async (chunks: Float32Array[]) => {
    if (chunks.length < 3) return
    updateState('thinking')
    try {
      const total = chunks.reduce((s,c)=>s+c.length,0)
      const merged = new Float32Array(total)
      let offset=0; for(const c of chunks){merged.set(c,offset);offset+=c.length}
      const wav = float32ToWav(merged,16000)
      const blob = new Blob([wav],{type:'audio/wav'})
      const form = new FormData()
      form.append('audio',blob,'audio.wav')
      form.append('user_id',USER_ID)
      const res = await fetch(`${BACKEND}/voice/transcribe`,{method:'POST',body:form})
      const data = await res.json()
      if (data.status!=='success'||!data.transcript?.trim()){updateState('listening');return}
      setTranscript(data.transcript)
      setResponse(data.response)
      // Browser TTS
      updateState('speaking')
      const utterance = new SpeechSynthesisUtterance(data.response)
      utterance.lang = 'id-ID'
      utterance.rate = 0.9
      utterance.onend = () => { setTranscript(''); setResponse(''); if(activeRef.current) startRecording() }
      utterance.onerror = () => { if(activeRef.current) startRecording() }
      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(utterance)
    } catch(e){console.error(e);updateState('listening')}
  }

  function float32ToWav(samples:Float32Array,sr:number):ArrayBuffer{
    const buf=new ArrayBuffer(44+samples.length*2)
    const v=new DataView(buf)
    const s=(str:string,o:number)=>{for(let i=0;i<str.length;i++)v.setUint8(o+i,str.charCodeAt(i))}
    s('RIFF',0);v.setUint32(4,36+samples.length*2,true)
    s('WAVE',8);s('fmt ',12);v.setUint32(16,16,true)
    v.setUint16(20,1,true);v.setUint16(22,1,true)
    v.setUint32(24,sr,true);v.setUint32(28,sr*2,true)
    v.setUint16(32,2,true);v.setUint16(34,16,true)
    s('data',36);v.setUint32(40,samples.length*2,true)
    let o=44;for(const x of samples){const n=Math.max(-1,Math.min(1,x));v.setInt16(o,n<0?n*0x8000:n*0x7FFF,true);o+=2}
    return buf
  }

  const toggleActive = async () => {
    if (active) {
      stopRecording();audioRef.current?.pause()
      setActive(false);activeRef.current=false
      updateState('idle');setTranscript('');setResponse('')
    } else {
      setActive(true);activeRef.current=true
      await startRecording()
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;}
        html,body{width:100%;height:100%;overflow:hidden;background:#06090f;}
        @keyframes breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
        @keyframes ripple{0%{transform:scale(1);opacity:0.5}100%{transform:scale(2);opacity:0}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes speaking{0%,100%{filter:drop-shadow(0 0 20px rgba(77,123,255,0.4))}50%{filter:drop-shadow(0 0 80px rgba(77,123,255,1))}}
        @keyframes shimmer{0%{background-position:0%}100%{background-position:200%}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
      `}</style>
      <div style={{width:'100vw',height:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'#06090f',position:'relative',overflow:'hidden',userSelect:'none'}}>
        <div style={{position:'absolute',top:32,fontFamily:'JetBrains Mono,monospace',fontSize:11,fontWeight:500,letterSpacing:'0.35em',background:'linear-gradient(90deg,#4c7bff,#8b5cf6,#4c7bff)',backgroundSize:'200%',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',animation:'shimmer 4s linear infinite'}}>ZANITH</div>
        <div style={{position:'relative',width:280,height:280,display:'flex',alignItems:'center',justifyContent:'center'}}>
          {state==='listening'&&[0,0.5,1].map((d,i)=>(<div key={i} style={{position:'absolute',width:240,height:240,borderRadius:'50%',border:'1px solid rgba(77,123,255,0.3)',animation:`ripple 2.5s ease-out ${d}s infinite`}}/>))}
          {state==='thinking'&&<div style={{position:'absolute',width:260,height:260,borderRadius:'50%',border:'1px solid transparent',borderTop:'1px solid rgba(139,92,246,0.6)',animation:'spin 1s linear infinite'}}/>}
          <div onClick={toggleActive} style={{cursor:'pointer'}}>
            <svg viewBox="0 0 200 200" width="220" height="220" style={{animation:state==='speaking'?'speaking 1.2s ease-in-out infinite':'breathe 4s ease-in-out infinite',filter:!active?'drop-shadow(0 0 15px rgba(77,123,255,0.2))':state==='listening'?'drop-shadow(0 0 30px rgba(77,123,255,0.6))':state==='thinking'?'drop-shadow(0 0 20px rgba(139,92,246,0.5))':'drop-shadow(0 0 50px rgba(77,123,255,0.9))',transition:'filter 0.5s'}}>
              <defs>
                <radialGradient id="g1" cx="50%" cy="50%" r="60%"><stop offset="40%" stopColor="#4c7bff" stopOpacity="0"/><stop offset="58%" stopColor="#4c7bff" stopOpacity={state==='speaking'?"1":"0.9"}/><stop offset="70%" stopColor="#4c7bff" stopOpacity="0"/></radialGradient>
                <radialGradient id="g2" cx="50%" cy="50%" r="55%"><stop offset="55%" stopColor="#8b5cf6" stopOpacity="0"/><stop offset="80%" stopColor="#8b5cf6" stopOpacity={active?"0.4":"0.25"}/><stop offset="100%" stopColor="#8b5cf6" stopOpacity="0"/></radialGradient>
                <radialGradient id="g3" cx="35%" cy="25%" r="80%"><stop offset="0%" stopColor="#1a2347"/><stop offset="60%" stopColor="#0d1228"/><stop offset="100%" stopColor="#06090f"/></radialGradient>
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
        <div style={{marginTop:32,textAlign:'center',minHeight:100}}>
          {!active&&<div style={{fontFamily:'JetBrains Mono,monospace',fontSize:11,color:'rgba(77,123,255,0.4)',letterSpacing:'0.2em',animation:'fadeIn 0.3s ease'}}>TAP UNTUK MULAI</div>}
          {active&&(
            <div style={{animation:'fadeIn 0.2s ease'}}>
              <div style={{fontFamily:'JetBrains Mono,monospace',fontSize:10,letterSpacing:'0.2em',marginBottom:16,color:state==='listening'?'rgba(77,123,255,0.8)':state==='thinking'?'rgba(139,92,246,0.8)':'rgba(77,123,255,0.9)'}}>
                {state==='listening'?'● MENDENGARKAN':state==='thinking'?'◌ BERPIKIR':'▶ BERBICARA'}
              </div>
              {transcript&&<div style={{fontSize:11,color:'rgba(255,255,255,0.4)',fontFamily:'JetBrains Mono,monospace',marginBottom:12}}>"{transcript}"</div>}
              {response&&<div style={{maxWidth:360,margin:'0 auto',padding:'14px 18px',background:'rgba(77,123,255,0.05)',border:'1px solid rgba(77,123,255,0.1)',borderRadius:14}}><div style={{color:'rgba(220,232,255,0.8)',lineHeight:1.7,fontFamily:'JetBrains Mono,monospace',fontSize:11}}>{response}</div></div>}
            </div>
          )}
        </div>
        <div style={{position:'absolute',bottom:32,fontFamily:'JetBrains Mono,monospace',fontSize:9,letterSpacing:'0.15em',color:'rgba(77,123,255,0.2)'}}>{active?'TAP UNTUK BERHENTI':'ZANITH AI · VOICE ASSISTANT'}</div>
      </div>
    </>
  )
}
