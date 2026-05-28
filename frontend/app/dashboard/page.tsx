'use client'
import { useState, useRef, useEffect } from 'react'

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8002'

function getUserId(): string {
  if (typeof window === 'undefined') return 'guest'
  try {
    const raw = localStorage.getItem('zenith_user')
    if (!raw) return 'guest'
    const user = JSON.parse(raw)
    return user.user_id ? String(user.user_id) : 'guest'
  } catch { return 'guest' }
}

type State = 'idle' | 'listening' | 'thinking' | 'speaking'
type Panel = { id: number; url: string; title: string }

function domainOf(url: string): string {
  try { return new URL(url).hostname.replace('www.', '') } catch { return url }
}
function normalizeUrl(url: string): string {
  if (!url) return url
  if (!url.startsWith('http://') && !url.startsWith('https://')) return 'https://' + url
  return url
}

export default function Home() {
  const [state, setState] = useState<State>('idle')
  const [active, setActive] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [response, setResponse] = useState('')
  const [userName, setUserName] = useState('Bos')
  const [time, setTime] = useState('')
  const [waveform, setWaveform] = useState<number[]>(Array(20).fill(2))
  const [errorMsg, setErrorMsg] = useState('')
  const [userPlan, setUserPlan] = useState<any>(null)
  const [presenceMsg, setPresenceMsg] = useState('')
  const [memories, setMemories] = useState<any[]>([])
  const [chatHistory, setChatHistory] = useState<string[]>([])
  const [webviewUrl, setWebviewUrl] = useState('')
  const [orbMini, setOrbMini] = useState(false)

  // Mode desktop (Jarvis dashboard). Dideteksi SETELAH mount agar tidak hydration mismatch.
  const [isDesktop, setIsDesktop] = useState(false)
  const [panels, setPanels] = useState<Panel[]>([])

  const stateRef = useRef<State>('idle')
  const clapRef = useRef<number>(0)
  const clapTimerRef = useRef<any>(null)
  const clapDetectRef = useRef<boolean>(false)
  const activeRef = useRef(false)
  const streamRef = useRef<MediaStream|null>(null)
  const contextRef = useRef<AudioContext|null>(null)
  const processorRef = useRef<ScriptProcessorNode|null>(null)
  const chunksRef = useRef<Float32Array[]>([])
  const recordingRef = useRef(false)
  const silenceTimerRef = useRef<any>(null)
  const analyserRef = useRef<AnalyserNode|null>(null)
  const waveAnimRef = useRef<any>(null)
  const audioUnlockRef = useRef(false)
  const audioCtxRef = useRef<any>(null)

  const updateState = (s: State) => { setState(s); stateRef.current = s }

  const addPanel = (url: string) => {
    const safe = normalizeUrl(url)
    setPanels(prev => {
      if (prev.some(p => p.url === safe)) return prev
      return [...prev, { id: Date.now() + Math.floor(Math.random() * 1000), url: safe, title: domainOf(safe) }].slice(-4)
    })
  }
  const closePanel = (id: number) => setPanels(prev => prev.filter(p => p.id !== id))

  // Deteksi desktop setelah mount (hydration-safe)
  useEffect(() => {
    if (typeof navigator !== 'undefined' && (navigator.userAgent.includes('Electron') || !!(window as any).electronAPI)) setIsDesktop(true)
  }, [])

  // Clap detection untuk desktop — tepuk tangan 2x balik ke ZENITH
  useEffect(() => {
    if (typeof window === 'undefined' || !(navigator.userAgent.includes('Electron') || !!(window as any).electronAPI)) return
    let clapCount = 0
    let lastClap = 0
    let clapTimer: any = null
    let prevAvg = 0
    navigator.mediaDevices.getUserMedia({audio: true}).then(stream => {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const analyser = audioCtx.createAnalyser()
      const source = audioCtx.createMediaStreamSource(stream)
      source.connect(analyser)
      analyser.fftSize = 256
      const data = new Uint8Array(analyser.frequencyBinCount)
      const detect = () => {
        analyser.getByteFrequencyData(data)
        const avg = data.reduce((a,b) => a+b, 0) / data.length
        const now = Date.now()
        const isClap = avg > 90 && (avg - prevAvg) > 40
        prevAvg = avg
        if (isClap && now - lastClap > 250) {
          lastClap = now
          clapCount++
          if (clapCount >= 2) {
            clapCount = 0
            try { (window as any).electronAPI?.clap() } catch {}
          }
          clearTimeout(clapTimer)
          clapTimer = setTimeout(() => { clapCount = 0 }, 1000)
        }
        requestAnimationFrame(detect)
      }
      detect()
    }).catch(() => {})
  }, [])

  // Clap detection — tepuk tangan 2x untuk tutup webview (mode orb web)
  const startClapDetection = () => {
    if (clapDetectRef.current) return
    clapDetectRef.current = true
    navigator.mediaDevices.getUserMedia({audio: true}).then(stream => {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const analyser = audioCtx.createAnalyser()
      const source = audioCtx.createMediaStreamSource(stream)
      source.connect(analyser)
      analyser.fftSize = 256
      analyserRef.current = analyser
      const data = new Uint8Array(analyser.frequencyBinCount)
      let lastClap = 0
      let prevAvg = 0
      const detect = () => {
        if (!clapDetectRef.current) return
        analyser.getByteFrequencyData(data)
        const avg = data.reduce((a,b) => a+b, 0) / data.length
        const now = Date.now()
        const isClap = avg > 90 && (avg - prevAvg) > 40
        prevAvg = avg
        if (isClap && now - lastClap > 250) {
          lastClap = now
          clapRef.current += 1
          if (clapRef.current >= 2) {
            clapRef.current = 0
            setWebviewUrl('')
            setOrbMini(false)
            clapDetectRef.current = false
            stream.getTracks().forEach(t => t.stop())
            return
          }
          clearTimeout(clapTimerRef.current)
          clapTimerRef.current = setTimeout(() => { clapRef.current = 0 }, 1000)
        }
        requestAnimationFrame(detect)
      }
      detect()
    }).catch(() => {})
  }

  useEffect(() => {
    if (orbMini) startClapDetection()
    else { clapDetectRef.current = false; clapRef.current = 0 }
  }, [orbMini])

  const showError = (msg: string) => {
    setErrorMsg(msg)
    setTimeout(() => setErrorMsg(''), 4000)
  }

  useEffect(() => {
    if (typeof window === 'undefined') return
    const user = JSON.parse(localStorage.getItem('zenith_user') || '{}')
    if (!user.user_id) { window.location.href = '/login'; return }
    const fullName = user.name || 'Bos'
    setUserName(fullName.split(' ')[0])

    fetch(`${BACKEND}/auth/memory/${user.user_id}`)
      .then(r => r.json())
      .then(d => { if(d.memories) setMemories(d.memories) })
      .catch(() => {})

    const checkPresence = async () => {
      try {
        const res = await fetch(`${BACKEND}/presence/check/${user.user_id}`)
        const data = await res.json()
        if (data.has_message && data.messages.length > 0) {
          setPresenceMsg(data.messages[0])
          setTimeout(() => setPresenceMsg(''), 8000)
        }
      } catch {}
    }
    checkPresence()
    const presenceInterval = setInterval(checkPresence, 5 * 60 * 1000)
    setTimeout(() => clearInterval(presenceInterval), 60 * 60 * 1000)

    const isFirstVisit = !localStorage.getItem('zenith_visited')
    if (isFirstVisit) {
      localStorage.setItem('zenith_visited', '1')
      setTimeout(() => {
        fetch(`${BACKEND}/chat/`, {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({user_id: user.user_id, message: `halo zenith, sapa aku dengan nama ${user.name?.split(' ')[0] || 'Bos'} dan perkenalkan diri kamu secara singkat tanpa markdown, tanpa bullet points, cukup 2-3 kalimat natural`})
        }).then(r=>r.json()).then(d=>{
          if(d.response) setResponse(d.response)
        }).catch(()=>{})
      }, 1500)
    }

    fetch(`${BACKEND}/auth/info/${user.user_id}`)
      .then(r => r.json())
      .then(d => { if(d.status === 'success') setUserPlan(d) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('id-ID', {hour:'2-digit',minute:'2-digit',second:'2-digit'}))
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [])

  const animateWaveform = (analyser: AnalyserNode) => {
    const data = new Uint8Array(analyser.frequencyBinCount)
    const animate = () => {
      analyser.getByteFrequencyData(data)
      setWaveform(Array.from({length:20}, (_,i) => Math.max(2, (data[Math.floor(i*data.length/20)]/255)*40)))
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
      let silenceCount = 0, hasSpeech = false
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
            silenceTimerRef.current = setTimeout(() => { if (hasSpeech && recordingRef.current) stopAndProcess() }, 100)
          }
        }
      }
      source.connect(processor)
      processor.connect(ctx.destination)
      animateWaveform(analyser)
      updateState('listening')
    } catch { showError('Izinkan akses microphone di browser kamu') }
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
      if (data.status === 'limit') {
        showError(data.response || 'Limit tercapai')
        updateState('idle')
        setActive(false)
        activeRef.current = false
        setTimeout(() => { window.location.href = '/upgrade' }, 2000)
        return
      }
      if (data.status !== 'success' || !data.transcript?.trim()) { if (activeRef.current) startRecording(); return }
      setTranscript(data.transcript)
      setResponse(data.response)
      if(data.transcript) setChatHistory(prev => [data.transcript, ...prev].slice(0, 5))

      // Detect OPEN command — desktop: panel di dalam; web: orb klik
      if (data.response && data.response.includes('[OPEN:')) {
        const matches = [...String(data.response).matchAll(/\[OPEN:(.*?)\]/g)]
        if ((navigator.userAgent.includes('Electron') || !!(window as any).electronAPI)) {
          matches.forEach(m => addPanel(m[1]))
        } else {
          const first = matches[0]
          if (first) { setWebviewUrl(normalizeUrl(first[1])); setOrbMini(true) }
        }
      }

      // Detect APP command (desktop only)
      if (data.response && data.response.includes('[APP:')) {
        const match = data.response.match(/\[APP:(.*?)\]/)
        if (match) {
          if ((window as any).electronAPI) (window as any).electronAPI.openApp(match[1])
          else if ((navigator.userAgent.includes('Electron') || !!(window as any).electronAPI)) window.open('zenith-app://' + encodeURIComponent(match[1]), '_blank')
        }
      }

      if (data.audio_b64) {
        updateState('speaking')
        try {
          if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
          }
          const audioCtx = audioCtxRef.current
          if (audioCtx.state === 'suspended') await audioCtx.resume()
          const raw = atob(data.audio_b64)
          const buf = new Uint8Array(raw.length)
          for(let i=0;i<raw.length;i++) buf[i]=raw.charCodeAt(i)
          audioCtx.decodeAudioData(buf.buffer, (decoded: AudioBuffer) => {
            const src = audioCtx.createBufferSource()
            src.buffer = decoded
            src.connect(audioCtx.destination)
            src.onended = () => { setTranscript(''); setResponse(''); updateState('listening'); if(activeRef.current) startRecording() }
            src.start(0)
          }, () => { updateState('listening'); if(activeRef.current) startRecording() })
        } catch { updateState('listening'); if(activeRef.current) startRecording() }
      } else { updateState('listening'); if(activeRef.current) startRecording() }
    } catch { showError('Koneksi bermasalah, coba lagi'); updateState('listening'); if(activeRef.current) startRecording() }
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

  const unlockAudio = async () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
      const ctx = audioCtxRef.current
      if (ctx.state === 'suspended') await ctx.resume()
      const buf = ctx.createBuffer(1, 1, 22050)
      const src = ctx.createBufferSource()
      src.buffer = buf
      src.connect(ctx.destination)
      src.start(0)
      audioUnlockRef.current = true
    } catch {}
  }

  const toggleActive = async () => {
    await unlockAudio()
    if (active) {
      recordingRef.current = false; activeRef.current = false
      cancelAnimationFrame(waveAnimRef.current)
      setWaveform(Array(20).fill(2))
      processorRef.current?.disconnect()
      streamRef.current?.getTracks().forEach(t => t.stop())
      setActive(false); updateState('idle'); setTranscript(''); setResponse('')
    } else { setActive(true); activeRef.current = true; await startRecording() }
  }

  const sendTextMessage = async (message: string) => {
    setSidebarOpen(false)
    updateState('thinking')
    setTranscript(message)
    try {
      const res = await fetch(`${BACKEND}/chat/`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({user_id: getUserId(), message})
      })
      const data = await res.json()
      setResponse(data.response)
      if (data.response && data.response.includes('[OPEN:')) {
        const matches = [...String(data.response).matchAll(/\[OPEN:(.*?)\]/g)]
        if ((navigator.userAgent.includes('Electron') || !!(window as any).electronAPI)) matches.forEach(m => addPanel(m[1]))
        else { const f = matches[0]; if (f) { setWebviewUrl(normalizeUrl(f[1])); setOrbMini(true) } }
      }
      updateState('idle')
    } catch {
      showError('Koneksi bermasalah, coba lagi')
      updateState('idle')
    }
  }

  const logout = () => { localStorage.removeItem('zenith_token'); localStorage.removeItem('zenith_user'); window.location.reload() }

  const getGreeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Pagi'
    if (h < 17) return 'Siang'
    if (h < 20) return 'Sore'
    return 'Malam'
  }

  const stateLabel: any = { idle:'STANDBY', listening:'LISTENING', thinking:'THINKING', speaking:'SPEAKING' }
  const stateColor: any = { idle:'rgba(255,255,255,0.2)', listening:'#4c7bff', thinking:'#8b5cf6', speaking:'#00e5ff' }

  const ticks: [string,string,string,number][] = [
    ['BTC','72,480','+4.18%',1],['ETH','3,902','+2.07%',1],['AAPL','228.4','-0.62%',0],
    ['IDR/USD','15,840','+0.31%',1],['GOLD','2,418','+1.12%',1],['NVDA','1,204','+3.55%',1],['BBCA','9,750','+0.77%',1]
  ]

  const dashboardActive = isDesktop && panels.length > 0
  const cols = panels.length <= 1 ? 1 : 2

  // Orb SVG (dipakai di tengah & pojok — konsisten dengan desain lama)
  const OrbSVG = ({ size }: { size: number }) => (
    <svg viewBox="0 0 200 200" width={size} height={size} style={{
      animation:state==='speaking'?'speakglow 1.2s ease-in-out infinite':state==='listening'?'breathe 1.5s ease-in-out infinite':'breathe 4s ease-in-out infinite',
      filter:!active?'drop-shadow(0 0 16px rgba(77,123,255,0.15))':
             state==='listening'?'drop-shadow(0 0 28px rgba(77,123,255,0.4))':
             state==='thinking'?'drop-shadow(0 0 24px rgba(139,92,246,0.4))':
             'drop-shadow(0 0 36px rgba(0,229,255,0.5))',
      transition:'filter 0.5s',
    }}>
      <defs>
        <radialGradient id="og1" cx="50%" cy="50%" r="60%">
          <stop offset="40%" stopColor="#4c7bff" stopOpacity="0"/>
          <stop offset="58%" stopColor={state==='speaking'?'#00e5ff':'#4c7bff'} stopOpacity="0.85"/>
          <stop offset="70%" stopColor="#4c7bff" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="og3" cx="35%" cy="25%" r="80%">
          <stop offset="0%" stopColor="#1a2347"/>
          <stop offset="60%" stopColor="#0a0f24"/>
          <stop offset="100%" stopColor="#050814"/>
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="100" fill="url(#og3)"/>
      <circle cx="100" cy="100" r="72" fill="url(#og1)"/>
      <circle cx="100" cy="100" r="68" fill="none" stroke={state==='speaking'?'#00e5ff':'rgba(255,255,255,0.6)'} strokeWidth="1" opacity="0.8"/>
      <circle cx="100" cy="100" r="58" fill="#080d1a"/>
      <circle cx="78" cy="76" r="3.5" fill="rgba(255,255,255,0.7)" opacity="0.8"/>
    </svg>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;}
        html,body{width:100%;height:100%;background:#050814;overflow:hidden;}
        @keyframes breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}
        @keyframes ripple{0%{transform:scale(1);opacity:0.4}100%{transform:scale(2.4);opacity:0}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes speakglow{0%,100%{filter:drop-shadow(0 0 24px rgba(0,229,255,0.3))}50%{filter:drop-shadow(0 0 60px rgba(0,229,255,0.7))}}
        @keyframes shimmer{0%{background-position:0%}100%{background-position:200%}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:0.3}50%{opacity:1}}
        @keyframes slideIn{from{opacity:0;transform:translateX(-20px)}to{opacity:1;transform:translateX(0)}}
        @keyframes zscroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        @keyframes zrise{from{opacity:0;transform:translateY(16px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}
        .sidebar-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:40;animation:fadeIn 0.2s ease}
        .sidebar{position:fixed;left:0;top:0;bottom:0;width:260px;background:#080d1a;border-right:1px solid rgba(255,255,255,0.06);z-index:50;animation:slideIn 0.25s ease;padding:24px 20px}
      `}</style>

      {/* SIDEBAR */}
      {sidebarOpen && (
        <>
          <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}/>
          <div className="sidebar" style={{overflowY:'auto'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:32}}>
              <span style={{fontFamily:'JetBrains Mono,monospace',fontSize:11,letterSpacing:'0.25em',color:'rgba(255,255,255,0.8)'}}>ZENITH</span>
              <button onClick={()=>setSidebarOpen(false)} style={{background:'none',border:'none',color:'rgba(255,255,255,0.3)',cursor:'pointer',fontSize:16}}>✕</button>
            </div>
            <div style={{display:'flex',gap:6,marginBottom:28}}>
              {['#00e5ff','#00e5ff','#00e5ff','#00e5ff','#00e5ff','#00e5ff'].map((c,i)=>(
                <div key={i} style={{width:5,height:5,borderRadius:'50%',background:c,boxShadow:`0 0 6px ${c}`}}/>
              ))}
            </div>
            <div style={{height:1,background:'rgba(255,255,255,0.05)',marginBottom:24}}/>
            <div style={{marginBottom:28}}>
              <div style={{fontSize:8,color:'rgba(255,255,255,0.25)',letterSpacing:'0.15em',marginBottom:12}}>AKSI CEPAT</div>
              {[
                {icon:'📧', label:'Cek Email', msg:'ada email penting hari ini?'},
                {icon:'🔍', label:'Web Search', msg:'cari berita AI terbaru hari ini'},
                {icon:'📋', label:'Buat Catatan', msg:'bantu saya buat catatan penting'},
                {icon:'📅', label:'Jadwal Hari Ini', msg:'apa yang perlu saya kerjakan hari ini?'},
              ].map((a,i) => (
                <div key={i} onClick={()=>sendTextMessage(a.msg)} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 10px',borderRadius:8,marginBottom:4,cursor:'pointer',border:'1px solid transparent',transition:'all 0.2s',color:'rgba(255,255,255,0.5)'}}
                  onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor='rgba(255,255,255,0.08)';(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.03)'}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor='transparent';(e.currentTarget as HTMLElement).style.background='transparent'}}
                >
                  <span style={{fontSize:13}}>{a.icon}</span>
                  <span style={{fontSize:9,letterSpacing:'0.08em'}}>{a.label}</span>
                </div>
              ))}
            </div>
            <div style={{height:1,background:'rgba(255,255,255,0.05)',marginBottom:24}}/>
            {memories.length > 0 && (
              <div style={{marginBottom:20}}>
                <div style={{fontSize:7,color:'rgba(255,255,255,0.25)',letterSpacing:'0.15em',marginBottom:10}}>ZENITH INGAT</div>
                {memories.slice(0,4).map((m,i) => (
                  <div key={i} style={{marginBottom:8,padding:'6px 8px',background:'rgba(77,123,255,0.03)',border:'1px solid rgba(77,123,255,0.06)',borderRadius:6}}>
                    <div style={{fontSize:7,color:'rgba(77,123,255,0.4)',letterSpacing:'0.08em',marginBottom:2}}>{m.key.toUpperCase()}</div>
                    <div style={{fontSize:8,color:'rgba(255,255,255,0.4)',letterSpacing:'0.04em'}}>{m.value.slice(0,60)}</div>
                  </div>
                ))}
              </div>
            )}
            {chatHistory.length > 0 && (
              <div style={{marginBottom:20}}>
                <div style={{fontSize:7,color:'rgba(255,255,255,0.25)',letterSpacing:'0.15em',marginBottom:10}}>RIWAYAT</div>
                {chatHistory.map((h,i) => (
                  <div key={i} style={{fontSize:8,color:'rgba(255,255,255,0.25)',marginBottom:6,padding:'4px 8px',borderLeft:'1px solid rgba(77,123,255,0.15)',letterSpacing:'0.03em'}}>
                    {h.slice(0,50)}{h.length > 50 ? '...' : ''}
                  </div>
                ))}
              </div>
            )}
            <div style={{height:1,background:'rgba(255,255,255,0.05)',marginBottom:24}}/>
            <div style={{marginBottom:28,fontSize:9,color:'rgba(255,255,255,0.25)',letterSpacing:'0.08em'}}>{userName}</div>
            {userPlan && (
              <div style={{marginBottom:12,padding:'10px 12px',background:'rgba(77,123,255,0.04)',border:'1px solid rgba(77,123,255,0.1)',borderRadius:8}}>
                <div style={{fontSize:8,color:'rgba(255,255,255,0.3)',letterSpacing:'0.1em',marginBottom:6}}>
                  {userPlan.plan === 'trial' ? 'TRIAL' : 'PREMIUM'}
                </div>
                <div style={{fontSize:9,color:'rgba(255,255,255,0.6)',marginBottom:4}}>
                  {userPlan.commands_used}/{userPlan.commands_limit} perintah hari ini
                </div>
                {userPlan.plan === 'trial' && (
                  <div style={{fontSize:8,color:userPlan.trial_days_left <= 1?'rgba(239,68,68,0.7)':'rgba(255,165,0,0.7)',letterSpacing:'0.05em'}}>
                    ⏳ Sisa {userPlan.trial_days_left} hari trial
                  </div>
                )}
              </div>
            )}
            <button onClick={() => {setSidebarOpen(false); window.location.href='/download'}} style={{width:'100%',marginBottom:8,padding:'10px',background:'rgba(0,229,255,0.06)',border:'1px solid rgba(0,229,255,0.15)',borderRadius:8,color:'rgba(0,229,255,0.7)',fontFamily:'JetBrains Mono,monospace',fontSize:9,letterSpacing:'0.12em',cursor:'pointer'}}>
              ↓ DOWNLOAD APP
            </button>
            <button onClick={() => {setSidebarOpen(false); window.location.href='/upgrade'}} style={{width:'100%',marginBottom:8,padding:'10px',background:'linear-gradient(135deg,rgba(77,123,255,0.08),rgba(139,92,246,0.08))',border:'1px solid rgba(77,123,255,0.2)',borderRadius:8,color:'#4c7bff',fontFamily:'JetBrains Mono,monospace',fontSize:9,letterSpacing:'0.12em',cursor:'pointer'}}>
              ⬆ UPGRADE PREMIUM
            </button>
            <button onClick={async () => {
              const pw = prompt('Masukkan password baru (min 6 karakter):')
              if (!pw || pw.length < 6) { alert('Password minimal 6 karakter'); return }
              const res = await fetch(`${BACKEND}/auth/set-password`, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({user_id:getUserId()||'962600',password:pw})})
              const data = await res.json()
              alert(data.message)
            }} style={{width:'100%',marginBottom:8,padding:'10px',background:'rgba(255,200,0,0.06)',border:'1px solid rgba(255,200,0,0.15)',borderRadius:8,color:'rgba(255,200,0,0.7)',fontFamily:'JetBrains Mono,monospace',fontSize:9,letterSpacing:'0.12em',cursor:'pointer'}}>
              SET PASSWORD
            </button>
            <button onClick={logout} style={{width:'100%',padding:'10px',background:'rgba(239,68,68,0.06)',border:'1px solid rgba(239,68,68,0.12)',borderRadius:8,color:'rgba(239,68,68,0.6)',fontFamily:'JetBrains Mono,monospace',fontSize:9,letterSpacing:'0.12em',cursor:'pointer'}}>
              KELUAR
            </button>
          </div>
        </>
      )}

      {/* MAIN */}
      <div style={{width:'100vw',height:'100vh',background:'#050814',color:'#fff',fontFamily:'JetBrains Mono,monospace',display:'flex',flexDirection:'column'}}>

        {/* TOP BAR — gaya orb (hamburger + logo) + ticker (desktop) */}
        <div style={{height:52,borderBottom:'1px solid rgba(255,255,255,0.04)',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 24px',flexShrink:0,gap:18}}>
          <div style={{display:'flex',alignItems:'center',gap:14,flexShrink:0}}>
            <button onClick={()=>setSidebarOpen(true)} style={{background:'none',border:'none',cursor:'pointer',display:'flex',flexDirection:'column',gap:4,padding:'4px'}}>
              <div style={{width:18,height:1.5,background:'rgba(255,255,255,0.5)',borderRadius:1}}/>
              <div style={{width:14,height:1.5,background:'rgba(255,255,255,0.3)',borderRadius:1}}/>
              <div style={{width:18,height:1.5,background:'rgba(255,255,255,0.5)',borderRadius:1}}/>
            </button>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <svg viewBox="0 0 200 200" width="28" height="28" style={{filter:'drop-shadow(0 0 8px rgba(77,123,255,0.4))'}}>
                <defs>
                  <radialGradient id="hg1" cx="50%" cy="50%" r="60%">
                    <stop offset="40%" stopColor="#4c7bff" stopOpacity="0"/>
                    <stop offset="58%" stopColor="#4c7bff" stopOpacity="0.9"/>
                    <stop offset="70%" stopColor="#4c7bff" stopOpacity="0"/>
                  </radialGradient>
                  <radialGradient id="hg2" cx="35%" cy="25%" r="80%">
                    <stop offset="0%" stopColor="#1a2347"/>
                    <stop offset="100%" stopColor="#06090f"/>
                  </radialGradient>
                </defs>
                <circle cx="100" cy="100" r="100" fill="url(#hg2)"/>
                <circle cx="100" cy="100" r="72" fill="url(#hg1)"/>
                <circle cx="100" cy="100" r="68" fill="none" stroke="#4c7bff" strokeWidth="2" opacity="0.9"/>
                <circle cx="100" cy="100" r="58" fill="#08101f"/>
                <circle cx="78" cy="76" r="4" fill="#4c7bff" opacity="0.8"/>
              </svg>
              <span style={{fontSize:12,fontWeight:600,letterSpacing:'0.28em',background:'linear-gradient(90deg,#fff,rgba(77,123,255,0.8),#fff)',backgroundSize:'200%',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',animation:'shimmer 5s linear infinite'}}>ZENITH</span>
            </div>
          </div>

          {/* Ticker hanya tampil di desktop */}
          {isDesktop && (
            <div style={{flex:1,overflow:'hidden',height:'100%',position:'relative',minWidth:0}}>
              <div style={{display:'flex',alignItems:'center',gap:28,height:'100%',whiteSpace:'nowrap',position:'absolute',animation:'zscroll 36s linear infinite',fontSize:10}}>
                {[...ticks,...ticks].map((t,i)=>(
                  <span key={i} style={{display:'inline-flex',gap:6,alignItems:'center'}}>
                    <span style={{color:'rgba(255,255,255,0.35)'}}>{t[0]}</span>
                    <span style={{color:t[3]?'#3ddc84':'#ff5d6c'}}>{t[1]} {t[3]?'▲':'▼'} {t[2]}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div style={{display:'flex',alignItems:'center',gap:16,flexShrink:0}}>
            <span style={{fontSize:10,color:'rgba(255,255,255,0.25)',letterSpacing:'0.1em'}}>{time}</span>
            <div style={{display:'flex',alignItems:'center',gap:6}}>
              <div style={{width:5,height:5,borderRadius:'50%',background:active?stateColor[state]:'rgba(255,255,255,0.15)',boxShadow:active?`0 0 8px ${stateColor[state]}`:'none',animation:active?'pulse 1.5s ease-in-out infinite':'none',transition:'all 0.3s'}}/>
              <span style={{fontSize:8,color:active?stateColor[state]:'rgba(255,255,255,0.2)',letterSpacing:'0.14em'}}>{stateLabel[state]}</span>
            </div>
            {!isDesktop && <span style={{fontSize:9,color:'rgba(255,255,255,0.3)',letterSpacing:'0.08em'}}>{getGreeting()}, {userName}</span>}
          </div>
        </div>

        {/* WEBVIEW OVERLAY (mode orb web — klik orb mini) */}
        {webviewUrl && (
          <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,zIndex:90,background:'#050814',display:'flex',flexDirection:'column'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 20px',borderBottom:'1px solid rgba(77,123,255,0.1)',background:'#080d1a'}}>
              <div style={{fontSize:10,color:'rgba(255,255,255,0.4)',letterSpacing:'0.1em',fontFamily:'JetBrains Mono,monospace'}}>{webviewUrl}</div>
              <button onClick={()=>{setWebviewUrl('');setOrbMini(false)}} style={{background:'rgba(255,77,77,0.1)',border:'1px solid rgba(255,77,77,0.2)',borderRadius:6,color:'rgba(255,77,77,0.7)',fontFamily:'JetBrains Mono,monospace',fontSize:9,letterSpacing:'0.1em',cursor:'pointer',padding:'4px 12px'}}>✕ TUTUP</button>
            </div>
            {isDesktop ? (
              <webview src={webviewUrl} style={{flex:1,width:'100%',height:'100%'}} allowpopups useragent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"></webview>
            ) : (
              <iframe src={webviewUrl} style={{flex:1,border:'none',width:'100%',height:'100%'}} allow="microphone; camera" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation"/>
            )}
          </div>
        )}

        {/* CENTER */}
        <div style={{flex:1,display:'flex',flexDirection:'column',position:'relative',overflow:'hidden',padding:dashboardActive?16:0}}>

          {dashboardActive ? (
            /* ===== MODE DASHBOARD (desktop + ada panel) ===== */
            <div style={{display:'grid',gridTemplateColumns:`repeat(${cols},1fr)`,gap:14,height:'100%'}}>
              {panels.map(p => (
                <div key={p.id} style={{background:'rgba(14,23,48,0.55)',border:'1px solid rgba(77,123,255,0.22)',borderRadius:14,overflow:'hidden',display:'flex',flexDirection:'column',animation:'zrise 0.6s cubic-bezier(0.2,0.8,0.2,1) both'}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'9px 13px',borderBottom:'1px solid rgba(77,123,255,0.18)',flexShrink:0}}>
                    <div style={{fontSize:10,fontWeight:600,letterSpacing:'0.18em',color:'rgba(255,255,255,0.85)',display:'flex',alignItems:'center',gap:8}}>
                      <span style={{width:6,height:6,borderRadius:'50%',background:'#00e5ff',boxShadow:'0 0 8px #00e5ff'}}/>
                      {p.title.toUpperCase()}
                    </div>
                    <button onClick={()=>closePanel(p.id)} style={{background:'rgba(255,77,77,0.1)',border:'1px solid rgba(255,77,77,0.2)',borderRadius:6,color:'rgba(255,77,77,0.8)',fontSize:9,cursor:'pointer',padding:'3px 9px',fontFamily:'JetBrains Mono,monospace'}}>✕</button>
                  </div>
                  <div style={{flex:1,minHeight:0,position:'relative',display:'flex',flexDirection:'column'}}>
                    <webview src={p.url} style={{flex:1,width:'100%',minHeight:0}} allowpopups partition="persist:main" useragent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"></webview>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* ===== MODE ORB (web, atau desktop tanpa panel) ===== */
            <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',position:'relative'}}>
              <div style={{position:'absolute',width:500,height:500,borderRadius:'50%',background:'radial-gradient(circle,rgba(77,123,255,0.03) 0%,transparent 70%)',pointerEvents:'none'}}/>
              {orbMini && <div style={{position:'fixed',bottom:8,right:4,zIndex:101,textAlign:'center',fontSize:'7px',color:'rgba(77,123,255,0.8)',fontFamily:'JetBrains Mono,monospace',letterSpacing:'0.1em',width:96}}>KETUK UNTUK BUKA</div>}
              <div onClick={() => { if(orbMini && webviewUrl) { window.open(webviewUrl, '_blank'); setOrbMini(false); setWebviewUrl('') } }} style={{position: orbMini ? 'fixed' : 'relative', bottom: orbMini ? 24 : 'auto', right: orbMini ? 24 : 'auto', width: orbMini ? 80 : 220, height: orbMini ? 80 : 220, display:'flex',alignItems:'center',justifyContent:'center',marginBottom: orbMini ? 0 : 40, zIndex: orbMini ? 100 : 'auto', transition:'all 0.5s cubic-bezier(0.4,0,0.2,1)', cursor: orbMini ? 'pointer' : 'default'}}>
                {state==='listening'&&[0,0.5,1].map((d,i)=>(
                  <div key={i} style={{position:'absolute',width:200,height:200,borderRadius:'50%',border:'1px solid rgba(77,123,255,0.15)',animation:`ripple 2.5s ease-out ${d}s infinite`}}/>
                ))}
                {state==='thinking'&&(
                  <div style={{position:'absolute',width:210,height:210,borderRadius:'50%',border:'1px solid transparent',borderTop:'1px solid rgba(139,92,246,0.4)',animation:'spin 1s linear infinite'}}/>
                )}
                <div onClick={toggleActive} style={{cursor:'pointer'}}>
                  <OrbSVG size={170} />
                </div>
              </div>

              {active && (
                <div style={{display:'flex',alignItems:'center',gap:2,height:32,marginBottom:20,animation:'fadeIn 0.3s ease'}}>
                  {waveform.map((h,i)=>(
                    <div key={i} style={{width:3,height:`${h}px`,borderRadius:2,background:state==='listening'?'rgba(77,123,255,0.7)':state==='speaking'?'rgba(0,229,255,0.6)':'rgba(139,92,246,0.5)',transition:'height 0.05s'}}/>
                  ))}
                </div>
              )}

              <div style={{textAlign:'center',maxWidth:500,padding:'0 24px',minHeight:60}}>
                {!active && (
                  <div style={{animation:'fadeIn 0.4s ease'}}>
                    <div style={{fontSize:11,color:'rgba(255,255,255,0.25)',letterSpacing:'0.2em',marginBottom:6}}>TAP UNTUK AKTIVASI</div>
                    <div style={{fontSize:9,color:'rgba(255,255,255,0.1)',letterSpacing:'0.15em'}}>ZENITH SIAP MELAYANI</div>
                  </div>
                )}
                {transcript&&<div style={{fontSize:11,color:'rgba(255,255,255,0.35)',marginBottom:10,animation:'fadeIn 0.2s ease',fontStyle:'italic'}}>"{transcript}"</div>}
                {response&&(
                  <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:14,padding:'14px 18px',animation:'fadeIn 0.3s ease',maxHeight:200,overflowY:'auto'}}>
                    <div style={{fontSize:12,color:'rgba(255,255,255,0.8)',lineHeight:1.8,letterSpacing:'0.02em'}} dangerouslySetInnerHTML={{__html: String(response).replace(/\[OPEN:.*?\]/g,'').replace(/\[APP:.*?\]/g,'').replace(/#{1,3} /g,'').replace(/---/g,'').replace(/\*\*(.+?)\*\*/g,'<strong style="color:rgba(255,255,255,0.95)">$1</strong>').replace(/\*(.+?)\*/g,'<em>$1</em>').replace(/\n/g,'<br/>')}}/>
                  </div>
                )}
              </div>

              {presenceMsg && (
                <div style={{position:'absolute',top:20,left:'50%',transform:'translateX(-50%)',background:'rgba(77,123,255,0.08)',border:'1px solid rgba(77,123,255,0.2)',borderRadius:8,padding:'10px 18px',fontSize:9,color:'rgba(77,123,255,0.8)',letterSpacing:'0.1em',animation:'fadeIn 0.3s ease',whiteSpace:'nowrap',maxWidth:'80vw',textAlign:'center'}}>
                  🤖 {presenceMsg}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ORB POJOK (mode dashboard) */}
        {dashboardActive && (
          <div onClick={toggleActive} style={{position:'fixed',bottom:74,right:26,zIndex:60,display:'flex',flexDirection:'column',alignItems:'center',gap:4,cursor:'pointer'}}>
            <OrbSVG size={78} />
            <div style={{fontSize:9,letterSpacing:'0.4em',color:'#00e5ff',textIndent:'0.4em',fontFamily:'JetBrains Mono,monospace'}}>ZENITH</div>
          </div>
        )}

        {/* RESPONSE strip saat mode dashboard */}
        {dashboardActive && (transcript || response) && (
          <div style={{position:'fixed',bottom:74,left:24,zIndex:55,maxWidth:'52vw',background:'rgba(7,11,30,0.85)',border:'1px solid rgba(77,123,255,0.22)',borderRadius:12,padding:'11px 15px',animation:'fadeIn 0.3s ease',backdropFilter:'blur(10px)'}}>
            {transcript && <div style={{fontSize:10,color:'rgba(255,255,255,0.4)',fontStyle:'italic',marginBottom:5}}>"{transcript}"</div>}
            {response && <div style={{fontSize:11,color:'rgba(255,255,255,0.85)',lineHeight:1.6}} dangerouslySetInnerHTML={{__html: String(response).replace(/\[OPEN:.*?\]/g,'').replace(/\[APP:.*?\]/g,'').replace(/#{1,3} /g,'').replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\n/g,'<br/>')}}/>}
          </div>
        )}

        {/* BOTTOM */}
        <div style={{height:64,borderTop:'1px solid rgba(255,255,255,0.04)',display:'flex',alignItems:'center',justifyContent:'center',gap:16,flexShrink:0}}>
          <button onClick={toggleActive} style={{
            padding:'10px 32px',
            background:active?'rgba(239,68,68,0.06)':'rgba(255,255,255,0.04)',
            border:`1px solid ${active?'rgba(239,68,68,0.2)':'rgba(255,255,255,0.1)'}`,
            borderRadius:10,
            color:active?'rgba(239,68,68,0.8)':'rgba(255,255,255,0.6)',
            fontFamily:'JetBrains Mono,monospace',fontSize:10,letterSpacing:'0.18em',
            cursor:'pointer',transition:'all 0.2s'
          }}>
            {active?'⏹  STOP':'▶  AKTIVASI ZENITH'}
          </button>
          {dashboardActive && <button onClick={()=>setPanels([])} style={{padding:'10px 20px',background:'transparent',border:'1px solid rgba(77,123,255,0.18)',borderRadius:10,color:'rgba(255,255,255,0.4)',fontFamily:'JetBrains Mono,monospace',fontSize:10,letterSpacing:'0.14em',cursor:'pointer'}}>BERSIHKAN LAYAR</button>}
          <span style={{fontSize:8,color:'rgba(255,255,255,0.1)',letterSpacing:'0.1em'}}>© ZENITH AI 2026  ·  {isDesktop?'MODE JARVIS':'TAP ORB ATAU KLIK AKTIVASI'}</span>
        </div>

        {errorMsg && (
          <div style={{position:'fixed',bottom:90,left:'50%',transform:'translateX(-50%)',zIndex:80,background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:8,padding:'10px 18px',fontSize:9,color:'rgba(239,68,68,0.8)',letterSpacing:'0.1em',animation:'fadeIn 0.3s ease',whiteSpace:'nowrap'}}>
            ⚠ {errorMsg}
          </div>
        )}
      </div>
    </>
  )
}
