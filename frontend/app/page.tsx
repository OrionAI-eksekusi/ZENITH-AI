'use client'
import { useState, useRef, useEffect } from 'react'

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8002'

function getUserId(): string {
  if (typeof window === 'undefined') return 'guest'
  try {
    const user = JSON.parse(localStorage.getItem('zanith_user') || '{}')
    return user.user_id || 'guest'
  } catch { return 'guest' }
}

function getUserName(): string {
  if (typeof window === 'undefined') return 'Bos'
  try {
    const user = JSON.parse(localStorage.getItem('zanith_user') || '{}')
    return user.name || 'Bos'
  } catch { return 'Bos' }
}

type State = 'idle' | 'listening' | 'thinking' | 'speaking'

export default function Home() {
  const [state, setState] = useState<State>('idle')
  const [active, setActive] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [response, setResponse] = useState('')
  const [userName, setUserName] = useState('Bos')
  const [time, setTime] = useState('')
  const [memories, setMemories] = useState<string[]>([])
  const [waveform, setWaveform] = useState<number[]>(Array(20).fill(2))
  
  const stateRef = useRef<State>('idle')
  const activeRef = useRef(false)
  const streamRef = useRef<MediaStream|null>(null)
  const contextRef = useRef<AudioContext|null>(null)
  const processorRef = useRef<ScriptProcessorNode|null>(null)
  const chunksRef = useRef<Float32Array[]>([])
  const recordingRef = useRef(false)
  const silenceTimerRef = useRef<any>(null)
  const analyserRef = useRef<AnalyserNode|null>(null)
  const waveAnimRef = useRef<any>(null)

  const updateState = (s: State) => { setState(s); stateRef.current = s }

  useEffect(() => {
    if (typeof window === 'undefined') return
    const user = JSON.parse(localStorage.getItem('zanith_user') || '{}')
    if (!user.user_id) { window.location.href = '/login'; return }
    setUserName(user.name || 'Bos')
    loadMemories(user.user_id)
  }, [])

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('id-ID', {hour:'2-digit',minute:'2-digit',second:'2-digit'}))
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [])

  const loadMemories = async (uid: string) => {
    try {
      const res = await fetch(`${BACKEND}/chat/`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({user_id: uid, message: '__get_memory__'})
      })
    } catch {}
  }

  const animateWaveform = (analyser: AnalyserNode) => {
    const data = new Uint8Array(analyser.frequencyBinCount)
    const animate = () => {
      analyser.getByteFrequencyData(data)
      const bars = Array.from({length:20}, (_,i) => {
        const val = data[Math.floor(i * data.length / 20)] / 255
        return Math.max(2, val * 40)
      })
      setWaveform(bars)
      waveAnimRef.current = requestAnimationFrame(animate)
    }
    animate()
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({audio:{sampleRate:16000,channelCount:1}})
      streamRef.current = stream
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate:16000})
      contextRef.current = ctx
      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 256
      analyserRef.current = analyser
      source.connect(analyser)
      const processor = ctx.createScriptProcessor(4096, 1, 1)
      processorRef.current = processor
      chunksRef.current = []
      recordingRef.current = true
      let silenceCount = 0
      let hasSpeech = false
      processor.onaudioprocess = (e: AudioProcessingEvent) => {
        if (!recordingRef.current) return
        const data = e.inputBuffer.getChannelData(0)
        chunksRef.current.push(new Float32Array(data))
        const vol = Math.sqrt(data.reduce((s,v) => s+v*v, 0) / data.length)
        if (vol > 0.01) { hasSpeech = true; silenceCount = 0; clearTimeout(silenceTimerRef.current) }
        else if (hasSpeech) {
          silenceCount++
          if (silenceCount > 6) {
            clearTimeout(silenceTimerRef.current)
            silenceTimerRef.current = setTimeout(() => {
              if (hasSpeech && recordingRef.current) stopAndProcess()
            }, 100)
          }
        }
      }
      source.connect(processor)
      processor.connect(ctx.destination)
      animateWaveform(analyser)
      updateState('listening')
    } catch(e) { alert('Izinkan akses microphone') }
  }

  const stopAndProcess = async () => {
    if (!recordingRef.current) return
    recordingRef.current = false
    cancelAnimationFrame(waveAnimRef.current)
    setWaveform(Array(20).fill(2))
    processorRef.current?.disconnect()
    streamRef.current?.getTracks().forEach(t => t.stop())
    const allChunks = chunksRef.current
    chunksRef.current = []
    if (allChunks.length === 0) { if (activeRef.current) startRecording(); return }
    updateState('thinking')
    const total = allChunks.reduce((s,c) => s+c.length, 0)
    const merged = new Float32Array(total)
    let offset = 0
    for (const c of allChunks) { merged.set(c, offset); offset += c.length }
    const wav = encodeWav(merged, 16000)
    const blob = new Blob([wav], {type:'audio/wav'})
    try {
      const form = new FormData()
      form.append('audio', blob, 'audio.wav')
      form.append('user_id', getUserId())
      const res = await fetch(`${BACKEND}/voice/transcribe`, {method:'POST', body:form})
      const data = await res.json()
      if (data.status !== 'success' || !data.transcript?.trim()) {
        if (activeRef.current) startRecording()
        return
      }
      setTranscript(data.transcript)
      setResponse(data.response)
      if (data.audio_b64) {
        updateState('speaking')
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
        const raw = atob(data.audio_b64)
        const buf = new Uint8Array(raw.length)
        for(let i=0;i<raw.length;i++) buf[i]=raw.charCodeAt(i)
        audioCtx.decodeAudioData(buf.buffer, (decoded) => {
          const src = audioCtx.createBufferSource()
          src.buffer = decoded
          src.connect(audioCtx.destination)
          src.onended = () => {
            setTranscript('')
            setResponse('')
            updateState('listening')
            if(activeRef.current) startRecording()
          }
          src.start(0)
        }, () => { updateState('listening'); if(activeRef.current) startRecording() })
      } else {
        updateState('listening')
        if(activeRef.current) startRecording()
      }
    } catch(e) { updateState('listening'); if(activeRef.current) startRecording() }
  }

  const encodeWav = (samples: Float32Array, rate: number): ArrayBuffer => {
    const buf = new ArrayBuffer(44 + samples.length * 2)
    const v = new DataView(buf)
    const ws = (s: string, o: number) => { for(let i=0;i<s.length;i++) v.setUint8(o+i,s.charCodeAt(i)) }
    ws('RIFF',0); v.setUint32(4,36+samples.length*2,true); ws('WAVE',8)
    ws('fmt ',12); v.setUint32(16,16,true); v.setUint16(20,1,true); v.setUint16(22,1,true)
    v.setUint32(24,rate,true); v.setUint32(28,rate*2,true); v.setUint16(32,2,true); v.setUint16(34,16,true)
    ws('data',36); v.setUint32(40,samples.length*2,true)
    let o=44; for(const s of samples){const x=Math.max(-1,Math.min(1,s));v.setInt16(o,x<0?x*0x8000:x*0x7FFF,true);o+=2}
    return buf
  }

  const toggleActive = async () => {
    if (active) {
      recordingRef.current = false
      activeRef.current = false
      cancelAnimationFrame(waveAnimRef.current)
      setWaveform(Array(20).fill(2))
      processorRef.current?.disconnect()
      streamRef.current?.getTracks().forEach(t => t.stop())
      setActive(false)
      updateState('idle')
      setTranscript('')
      setResponse('')
    } else {
      setActive(true)
      activeRef.current = true
      await startRecording()
    }
  }

  const logout = () => {
    localStorage.removeItem('zanith_token')
    localStorage.removeItem('zanith_user')
    window.location.href = '/login'
  }

  const getGreeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Selamat pagi'
    if (h < 17) return 'Selamat siang'
    if (h < 20) return 'Selamat sore'
    return 'Selamat malam'
  }

  const stateColor = {
    idle: 'rgba(77,123,255,0.15)',
    listening: 'rgba(77,123,255,0.4)',
    thinking: 'rgba(139,92,246,0.4)',
    speaking: 'rgba(0,229,255,0.4)'
  }

  const stateLabel = {
    idle: 'STANDBY',
    listening: '● LISTENING',
    thinking: '◌ THINKING',
    speaking: '▶ SPEAKING'
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;}
        html,body{width:100%;height:100%;background:#03050d;overflow:hidden;}
        @keyframes breathe{0%,100%{transform:scale(1);opacity:0.9}50%{transform:scale(1.03);opacity:1}}
        @keyframes ripple{0%{transform:scale(1);opacity:0.5}100%{transform:scale(2.2);opacity:0}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes speaking{0%,100%{filter:drop-shadow(0 0 20px rgba(0,229,255,0.3))}50%{filter:drop-shadow(0 0 60px rgba(0,229,255,0.8))}}
        @keyframes shimmer{0%{background-position:0%}100%{background-position:200%}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:0.4}50%{opacity:1}}
        @keyframes scanline{0%{top:-10%}100%{top:110%}}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-thumb{background:rgba(77,123,255,0.15);border-radius:3px;}
      `}</style>

      <div style={{width:'100vw',height:'100vh',background:'#03050d',color:'#dce8ff',fontFamily:'JetBrains Mono,monospace',display:'grid',gridTemplateColumns:'220px 1fr 200px',gridTemplateRows:'48px 1fr 80px',overflow:'hidden'}}>

        {/* TOP BAR */}
        <div style={{gridColumn:'1/-1',borderBottom:'1px solid rgba(77,123,255,0.06)',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 20px',background:'rgba(3,5,13,0.95)'}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:24,height:24,background:'linear-gradient(135deg,#1a2347,#0d1228)',border:'1px solid rgba(77,123,255,0.3)',borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center'}}>
              <svg viewBox="0 0 200 200" width="18" height="18">
                <defs><radialGradient id="tg" cx="50%" cy="50%" r="60%"><stop offset="40%" stopColor="#4c7bff" stopOpacity="0"/><stop offset="58%" stopColor="#4c7bff" stopOpacity="0.9"/><stop offset="70%" stopColor="#4c7bff" stopOpacity="0"/></radialGradient></defs>
                <rect width="200" height="200" fill="#0d1228"/>
                <circle cx="100" cy="100" r="72" fill="url(#tg)"/>
                <circle cx="100" cy="100" r="68" fill="none" stroke="#4c7bff" strokeWidth="2" opacity="0.9"/>
                <circle cx="100" cy="100" r="58" fill="#08101f"/>
                <circle cx="78" cy="76" r="4" fill="#4c7bff" opacity="0.75"/>
              </svg>
            </div>
            <span style={{fontSize:11,fontWeight:600,letterSpacing:'0.25em',background:'linear-gradient(90deg,#4c7bff,#8b5cf6,#4c7bff)',backgroundSize:'200%',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',animation:'shimmer 4s linear infinite'}}>ZANITH</span>
            <span style={{fontSize:8,color:'rgba(77,123,255,0.3)',letterSpacing:'0.1em'}}>v1.0</span>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:16}}>
            <span style={{fontSize:10,color:'rgba(77,123,255,0.5)',letterSpacing:'0.08em'}}>{time}</span>
            <div style={{display:'flex',alignItems:'center',gap:5}}>
              <div style={{width:5,height:5,borderRadius:'50%',background:active?'#00e5ff':'rgba(77,123,255,0.3)',boxShadow:active?'0 0 8px #00e5ff':'none',animation:active?'pulse 1.5s ease-in-out infinite':'none'}}/>
              <span style={{fontSize:8,color:active?'#00e5ff':'rgba(77,123,255,0.3)',letterSpacing:'0.12em'}}>{stateLabel[state]}</span>
            </div>
            <span style={{fontSize:9,color:'rgba(77,123,255,0.4)'}}>{getGreeting()}, {userName}</span>
            <button onClick={logout} style={{fontSize:8,color:'rgba(77,123,255,0.3)',background:'none',border:'1px solid rgba(77,123,255,0.08)',borderRadius:4,padding:'3px 8px',cursor:'pointer',letterSpacing:'0.08em'}}>KELUAR</button>
          </div>
        </div>

        {/* LEFT SIDEBAR */}
        <div style={{borderRight:'1px solid rgba(77,123,255,0.05)',padding:'16px 14px',display:'flex',flexDirection:'column',gap:16,background:'rgba(3,5,13,0.6)'}}>
          <div>
            <div style={{fontSize:7,color:'rgba(77,123,255,0.3)',letterSpacing:'0.15em',marginBottom:10}}>SYSTEM STATUS</div>
            {[
              {label:'ZANITH CORE', ok:true},
              {label:'CLAUDE AI', ok:true},
              {label:'VOICE ENGINE', ok:true},
              {label:'MEMORY', ok:true},
              {label:'WEB SEARCH', ok:true},
              {label:'GMAIL', ok:true},
            ].map((s,i) => (
              <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
                <span style={{fontSize:8,color:'rgba(77,123,255,0.5)',letterSpacing:'0.08em'}}>{s.label}</span>
                <div style={{display:'flex',alignItems:'center',gap:4}}>
                  <div style={{width:4,height:4,borderRadius:'50%',background:s.ok?'#00e5ff':'#ef4444',boxShadow:s.ok?'0 0 6px #00e5ff':'none'}}/>
                  <span style={{fontSize:7,color:s.ok?'rgba(0,229,255,0.6)':'rgba(239,68,68,0.6)'}}>{s.ok?'ON':'OFF'}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{height:1,background:'rgba(77,123,255,0.05)'}}/>

          <div>
            <div style={{fontSize:7,color:'rgba(77,123,255,0.3)',letterSpacing:'0.15em',marginBottom:10}}>QUICK ACTIONS</div>
            {[
              {icon:'📧', label:'Cek Email'},
              {icon:'🔍', label:'Web Search'},
              {icon:'📋', label:'Buat Catatan'},
              {icon:'📅', label:'Jadwal Hari Ini'},
            ].map((a,i) => (
              <div key={i} style={{display:'flex',alignItems:'center',gap:8,padding:'6px 8px',borderRadius:6,marginBottom:4,cursor:'pointer',border:'1px solid transparent',transition:'all 0.2s'}}
                onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor='rgba(77,123,255,0.1)';(e.currentTarget as HTMLElement).style.background='rgba(77,123,255,0.03)'}}
                onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor='transparent';(e.currentTarget as HTMLElement).style.background='transparent'}}
              >
                <span style={{fontSize:11}}>{a.icon}</span>
                <span style={{fontSize:8,color:'rgba(77,123,255,0.5)',letterSpacing:'0.08em'}}>{a.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* MAIN CENTER */}
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',position:'relative',overflow:'hidden'}}>
          
          {/* Subtle grid bg */}
          <div style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(77,123,255,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(77,123,255,0.015) 1px,transparent 1px)',backgroundSize:'40px 40px',pointerEvents:'none'}}/>

          {/* ORB */}
          <div style={{position:'relative',width:200,height:200,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:32}}>
            {state==='listening'&&[0,0.5,1].map((d,i)=>(
              <div key={i} style={{position:'absolute',width:180,height:180,borderRadius:'50%',border:'1px solid rgba(77,123,255,0.2)',animation:`ripple 2.5s ease-out ${d}s infinite`}}/>
            ))}
            {state==='thinking'&&<div style={{position:'absolute',width:190,height:190,borderRadius:'50%',border:'1px solid transparent',borderTop:'1px solid rgba(139,92,246,0.5)',animation:'spin 1s linear infinite'}}/>}

            <div onClick={toggleActive} style={{cursor:'pointer',position:'relative'}}>
              <svg viewBox="0 0 200 200" width="160" height="160" style={{
                animation:state==='speaking'?'speaking 1.2s ease-in-out infinite':state==='listening'?'breathe 1.5s ease-in-out infinite':'breathe 4s ease-in-out infinite',
                filter:state==='idle'&&!active?'drop-shadow(0 0 20px rgba(77,123,255,0.2))':
                       state==='listening'?'drop-shadow(0 0 30px rgba(77,123,255,0.5))':
                       state==='thinking'?'drop-shadow(0 0 25px rgba(139,92,246,0.5))':
                       'drop-shadow(0 0 40px rgba(0,229,255,0.6))',
                transition:'filter 0.5s',
              }}>
                <defs>
                  <radialGradient id="mg1" cx="50%" cy="50%" r="60%">
                    <stop offset="40%" stopColor="#4c7bff" stopOpacity="0"/>
                    <stop offset="58%" stopColor={state==='speaking'?'#00e5ff':'#4c7bff'} stopOpacity="0.9"/>
                    <stop offset="70%" stopColor="#4c7bff" stopOpacity="0"/>
                  </radialGradient>
                  <radialGradient id="mg2" cx="50%" cy="50%" r="55%">
                    <stop offset="55%" stopColor="#8b5cf6" stopOpacity="0"/>
                    <stop offset="80%" stopColor="#8b5cf6" stopOpacity={active?"0.35":"0.2"}/>
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0"/>
                  </radialGradient>
                  <radialGradient id="mg3" cx="35%" cy="25%" r="80%">
                    <stop offset="0%" stopColor="#1a2347"/>
                    <stop offset="60%" stopColor="#0d1228"/>
                    <stop offset="100%" stopColor="#06090f"/>
                  </radialGradient>
                </defs>
                <rect width="200" height="200" fill="url(#mg3)"/>
                <circle cx="100" cy="100" r="98" fill="url(#mg2)"/>
                <circle cx="100" cy="100" r="72" fill="url(#mg1)"/>
                <circle cx="100" cy="100" r="68" fill="none" stroke={state==='speaking'?'#00e5ff':'#4c7bff'} strokeWidth="1.5" opacity="0.9"/>
                <circle cx="100" cy="100" r="58" fill="#08101f"/>
                <circle cx="78" cy="76" r="4" fill="#4c7bff" opacity="0.75"/>
              </svg>
            </div>
          </div>

          {/* Transcript & Response */}
          <div style={{textAlign:'center',maxWidth:480,minHeight:80,padding:'0 20px'}}>
            {!active && (
              <div style={{animation:'fadeIn 0.3s ease'}}>
                <div style={{fontSize:11,color:'rgba(77,123,255,0.4)',letterSpacing:'0.2em',marginBottom:'6px'}}>TAP UNTUK AKTIVASI</div>
                <div style={{fontSize:9,color:'rgba(77,123,255,0.2)',letterSpacing:'0.12em'}}>ZANITH SIAP MELAYANI</div>
              </div>
            )}
            {transcript&&<div style={{fontSize:11,color:'rgba(255,255,255,0.4)',marginBottom:10,animation:'fadeIn 0.2s ease'}}>"{transcript}"</div>}
            {response&&(
              <div style={{background:'rgba(77,123,255,0.04)',border:'1px solid rgba(77,123,255,0.08)',borderRadius:12,padding:'12px 16px',animation:'fadeIn 0.3s ease'}}>
                <div style={{fontSize:12,color:'rgba(220,232,255,0.85)',lineHeight:1.7,letterSpacing:'0.02em'}}>{response}</div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div style={{borderLeft:'1px solid rgba(77,123,255,0.05)',padding:'16px 14px',display:'flex',flexDirection:'column',gap:16,background:'rgba(3,5,13,0.6)'}}>
          <div>
            <div style={{fontSize:7,color:'rgba(77,123,255,0.3)',letterSpacing:'0.15em',marginBottom:10}}>AI STATE</div>
            <div style={{background:'rgba(77,123,255,0.03)',border:'1px solid rgba(77,123,255,0.08)',borderRadius:8,padding:'10px',textAlign:'center'}}>
              <div style={{fontSize:9,color:state==='idle'?'rgba(77,123,255,0.4)':state==='listening'?'#4c7bff':state==='thinking'?'#8b5cf6':'#00e5ff',letterSpacing:'0.12em',marginBottom:4,transition:'color 0.3s'}}>{stateLabel[state]}</div>
              <div style={{fontSize:7,color:'rgba(77,123,255,0.25)',letterSpacing:'0.08em'}}>{active?'ACTIVE':'INACTIVE'}</div>
            </div>
          </div>

          {/* Waveform */}
          {active&&(
            <div>
              <div style={{fontSize:7,color:'rgba(77,123,255,0.3)',letterSpacing:'0.15em',marginBottom:8}}>AUDIO INPUT</div>
              <div style={{display:'flex',alignItems:'center',gap:2,height:40,background:'rgba(77,123,255,0.02)',border:'1px solid rgba(77,123,255,0.06)',borderRadius:6,padding:'4px 6px'}}>
                {waveform.map((h,i)=>(
                  <div key={i} style={{flex:1,height:`${h}px`,borderRadius:1,background:state==='listening'?'rgba(77,123,255,0.6)':'rgba(77,123,255,0.2)',transition:'height 0.05s'}}/>
                ))}
              </div>
            </div>
          )}

          <div style={{height:1,background:'rgba(77,123,255,0.05)'}}/>

          <div>
            <div style={{fontSize:7,color:'rgba(77,123,255,0.3)',letterSpacing:'0.15em',marginBottom:10}}>SESSION INFO</div>
            <div style={{fontSize:8,color:'rgba(77,123,255,0.35)',lineHeight:2,letterSpacing:'0.05em'}}>
              <div>USER: {userName.toUpperCase()}</div>
              <div>MODEL: CLAUDE SONNET</div>
              <div>VOICE: ELEVENLABS</div>
              <div>MEM: ACTIVE</div>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div style={{gridColumn:'1/-1',borderTop:'1px solid rgba(77,123,255,0.06)',display:'flex',alignItems:'center',justifyContent:'center',padding:'0 20px',background:'rgba(3,5,13,0.95)',gap:16}}>
          <button onClick={toggleActive} style={{
            padding:'8px 24px',
            background:active?'rgba(239,68,68,0.08)':'rgba(77,123,255,0.08)',
            border:`1px solid ${active?'rgba(239,68,68,0.2)':'rgba(77,123,255,0.2)'}`,
            borderRadius:8,color:active?'#ef4444':'#4c7bff',
            fontFamily:'JetBrains Mono,monospace',fontSize:10,
            letterSpacing:'0.15em',cursor:'pointer',transition:'all 0.2s'
          }}>
            {active?'⏹ STOP':'▶ AKTIVASI ZANITH'}
          </button>
          <div style={{fontSize:8,color:'rgba(77,123,255,0.2)',letterSpacing:'0.1em'}}>
            TAP ORB ATAU KLIK AKTIVASI · ZANITH AKAN MENDENGARKAN OTOMATIS
          </div>
        </div>
      </div>
    </>
  )
}
