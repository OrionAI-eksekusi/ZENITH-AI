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

export default function Dashboard() {
  const [state, setState] = useState<State>('idle')
  const [active, setActive] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [response, setResponse] = useState('')
  const [userName, setUserName] = useState('Bos')
  const [time, setTime] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [panels, setPanels] = useState<Panel[]>([])

  const stateRef = useRef<State>('idle')
  const activeRef = useRef(false)
  const streamRef = useRef<MediaStream | null>(null)
  const contextRef = useRef<AudioContext | null>(null)
  const processorRef = useRef<ScriptProcessorNode | null>(null)
  const chunksRef = useRef<Float32Array[]>([])
  const recordingRef = useRef(false)
  const silenceTimerRef = useRef<any>(null)
  const audioCtxRef = useRef<any>(null)

  const updateState = (s: State) => { setState(s); stateRef.current = s }
  const isDesktop = () => typeof window !== 'undefined' && navigator.userAgent.includes('Electron')
  const showError = (msg: string) => { setErrorMsg(msg); setTimeout(() => setErrorMsg(''), 4000) }

  const addPanel = (url: string) => {
    setPanels(prev => {
      if (prev.some(p => p.url === url)) return prev
      return [...prev, { id: Date.now() + Math.floor(Math.random() * 1000), url, title: domainOf(url) }].slice(-4)
    })
  }
  const closePanel = (id: number) => setPanels(prev => prev.filter(p => p.id !== id))

  useEffect(() => {
    if (typeof window === 'undefined') return
    const user = JSON.parse(localStorage.getItem('zenith_user') || '{}')
    if (!user.user_id) { window.location.href = '/login'; return }
    setUserName((user.name || 'Bos').split(' ')[0])
  }, [])

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('id-ID', { hour12: false }))
    tick(); const t = setInterval(tick, 1000); return () => clearInterval(t)
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { sampleRate: 16000, channelCount: 1 } })
      streamRef.current = stream
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 })
      contextRef.current = ctx
      const source = ctx.createMediaStreamSource(stream)
      const processor = ctx.createScriptProcessor(4096, 1, 1)
      processorRef.current = processor
      chunksRef.current = []
      recordingRef.current = true
      let silenceCount = 0, hasSpeech = false
      processor.onaudioprocess = (e: AudioProcessingEvent) => {
        if (!recordingRef.current) return
        const data = e.inputBuffer.getChannelData(0)
        chunksRef.current.push(new Float32Array(data))
        const vol = Math.sqrt(data.reduce((s, v) => s + v * v, 0) / data.length)
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
      updateState('listening')
    } catch { showError('Izinkan akses microphone') }
  }

  const stopAndProcess = async () => {
    if (!recordingRef.current) return
    recordingRef.current = false
    processorRef.current?.disconnect()
    streamRef.current?.getTracks().forEach(t => t.stop())
    const allChunks = chunksRef.current; chunksRef.current = []
    if (allChunks.length === 0) { if (activeRef.current) startRecording(); return }
    updateState('thinking')
    const total = allChunks.reduce((s, c) => s + c.length, 0)
    const merged = new Float32Array(total)
    let offset = 0; for (const c of allChunks) { merged.set(c, offset); offset += c.length }
    const wav = encodeWav(merged, 16000)
    const blob = new Blob([wav], { type: 'audio/wav' })
    try {
      const form = new FormData()
      form.append('audio', blob, 'audio.wav')
      form.append('user_id', getUserId())
      const res = await fetch(`${BACKEND}/voice/transcribe`, { method: 'POST', body: form })
      const data = await res.json()
      if (data.status === 'limit') {
        showError(data.response || 'Limit tercapai'); updateState('idle')
        setActive(false); activeRef.current = false
        setTimeout(() => { window.location.href = '/upgrade' }, 2000); return
      }
      if (data.status !== 'success' || !data.transcript?.trim()) { if (activeRef.current) startRecording(); return }
      setTranscript(data.transcript)
      setResponse(data.response)

      // === DASHBOARD: tiap [OPEN:URL] jadi panel di layar (bisa banyak sekaligus) ===
      const opens = [...String(data.response || '').matchAll(/\[OPEN:(.*?)\]/g)]
      opens.forEach(m => addPanel(m[1]))

      // [APP:name] buka aplikasi lokal (desktop)
      const appMatch = String(data.response || '').match(/\[APP:(.*?)\]/)
      if (appMatch) {
        if ((window as any).electronAPI) (window as any).electronAPI.openApp(appMatch[1])
        else if (isDesktop()) window.open('zenith-app://' + encodeURIComponent(appMatch[1]), '_blank')
      }

      if (data.audio_b64) {
        updateState('speaking')
        try {
          if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
          const audioCtx = audioCtxRef.current
          if (audioCtx.state === 'suspended') await audioCtx.resume()
          const raw = atob(data.audio_b64); const buf = new Uint8Array(raw.length)
          for (let i = 0; i < raw.length; i++) buf[i] = raw.charCodeAt(i)
          audioCtx.decodeAudioData(buf.buffer, (decoded: AudioBuffer) => {
            const src = audioCtx.createBufferSource(); src.buffer = decoded; src.connect(audioCtx.destination)
            src.onended = () => { updateState('listening'); if (activeRef.current) startRecording() }
            src.start(0)
          }, () => { updateState('listening'); if (activeRef.current) startRecording() })
        } catch { updateState('listening'); if (activeRef.current) startRecording() }
      } else { updateState('listening'); if (activeRef.current) startRecording() }
    } catch { showError('Koneksi bermasalah'); updateState('listening'); if (activeRef.current) startRecording() }
  }

  const encodeWav = (samples: Float32Array, rate: number): ArrayBuffer => {
    const buf = new ArrayBuffer(44 + samples.length * 2)
    const v = new DataView(buf)
    const ws = (s: string, o: number) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)) }
    ws('RIFF', 0); v.setUint32(4, 36 + samples.length * 2, true); ws('WAVE', 8)
    ws('fmt ', 12); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true)
    v.setUint32(24, rate, true); v.setUint32(28, rate * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true)
    ws('data', 36); v.setUint32(40, samples.length * 2, true)
    let o = 44; for (const s of samples) { const x = Math.max(-1, Math.min(1, s)); v.setInt16(o, x < 0 ? x * 0x8000 : x * 0x7FFF, true); o += 2 }
    return buf
  }

  const unlockAudio = async () => {
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      const ctx = audioCtxRef.current
      if (ctx.state === 'suspended') await ctx.resume()
      const b = ctx.createBuffer(1, 1, 22050); const s = ctx.createBufferSource(); s.buffer = b; s.connect(ctx.destination); s.start(0)
    } catch {}
  }

  const toggleActive = async () => {
    await unlockAudio()
    if (active) {
      recordingRef.current = false; activeRef.current = false
      processorRef.current?.disconnect()
      streamRef.current?.getTracks().forEach(t => t.stop())
      setActive(false); updateState('idle')
    } else { setActive(true); activeRef.current = true; await startRecording() }
  }

  const ticks: [string, string, string, number][] = [
    ['BTC', '72,480', '+4.18%', 1], ['ETH', '3,902', '+2.07%', 1], ['AAPL', '228.4', '-0.62%', 0],
    ['IDR/USD', '15,840', '+0.31%', 1], ['GOLD', '2,418', '+1.12%', 1], ['NVDA', '1,204', '+3.55%', 1], ['BBCA', '9,750', '+0.77%', 1]
  ]
  const stateLabel: any = { idle: 'STANDBY', listening: 'LISTENING', thinking: 'THINKING', speaking: 'SPEAKING' }
  const stateColor: any = { idle: 'rgba(255,255,255,0.2)', listening: '#4c7bff', thinking: '#8b5cf6', speaking: '#00e5ff' }
  const cols = panels.length <= 1 ? 1 : 2
  const hasPanels = panels.length > 0

  const Orb = ({ size }: { size: number }) => (
    <div onClick={toggleActive} style={{ cursor: 'pointer', width: size, height: size, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px solid rgba(77,123,255,0.5)', boxShadow: '0 0 40px rgba(77,123,255,0.4), inset 0 0 40px rgba(77,123,255,0.2)' }} />
      <div style={{ position: 'absolute', inset: '14%', borderRadius: '50%', border: '1px dashed rgba(0,229,255,0.35)', animation: 'zspin 9s linear infinite' }} />
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#eaf2ff', boxShadow: `0 0 20px 6px ${active ? stateColor[state] : '#4c7bff'}, 0 0 44px 12px rgba(77,123,255,0.5)`, animation: 'zpulse 2.6s ease-in-out infinite' }} />
    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;}
        html,body{width:100%;height:100%;background:#050814;overflow:hidden;}
        @keyframes zspin{to{transform:rotate(360deg)}}
        @keyframes zpulse{50%{transform:scale(1.7);opacity:0.7}}
        @keyframes zscroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        @keyframes zrise{from{opacity:0;transform:translateY(16px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes zfade{from{opacity:0}to{opacity:1}}
      `}</style>

      <div style={{ width: '100vw', height: '100vh', background: 'radial-gradient(circle at 50% 0%, #0a1230 0%, #050814 55%)', color: '#cdd8f4', fontFamily: 'JetBrains Mono,monospace', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* TOP BAR */}
        <div style={{ height: 52, borderBottom: '1px solid rgba(77,123,255,0.18)', display: 'flex', alignItems: 'center', background: 'rgba(7,11,30,0.6)', flexShrink: 0 }}>
          <div style={{ fontFamily: 'Chakra Petch,sans-serif', fontWeight: 700, letterSpacing: '0.5em', fontSize: 14, color: '#fff', padding: '0 24px', textShadow: '0 0 16px rgba(77,123,255,0.5)', whiteSpace: 'nowrap' }}>ZENITH</div>
          <div style={{ flex: 1, overflow: 'hidden', height: '100%', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 30, height: '100%', whiteSpace: 'nowrap', position: 'absolute', animation: 'zscroll 36s linear infinite', fontSize: 11 }}>
              {[...ticks, ...ticks].map((t, i) => (
                <span key={i} style={{ display: 'inline-flex', gap: 7, alignItems: 'center' }}>
                  <span style={{ color: 'rgba(255,255,255,0.4)' }}>{t[0]}</span>
                  <span style={{ color: t[3] ? '#3ddc84' : '#ff5d6c' }}>{t[1]} {t[3] ? '▲' : '▼'} {t[2]}</span>
                </span>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '0 22px', whiteSpace: 'nowrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: active ? stateColor[state] : 'rgba(255,255,255,0.15)', boxShadow: active ? `0 0 8px ${stateColor[state]}` : 'none' }} />
              <span style={{ fontSize: 8, color: active ? stateColor[state] : 'rgba(255,255,255,0.25)', letterSpacing: '0.14em' }}>{stateLabel[state]}</span>
            </div>
            <span style={{ fontSize: 10, color: '#5fd4ff' }}>{time}</span>
          </div>
        </div>

        {/* STAGE */}
        <div style={{ flex: 1, position: 'relative', minHeight: 0, padding: hasPanels ? 16 : 0 }}>
          {!hasPanels ? (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22 }}>
              <Orb size={210} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Chakra Petch,sans-serif', letterSpacing: '0.35em', fontSize: 12, color: '#5fd4ff' }}>{active ? stateLabel[state] : 'ZENITH'}</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.2em', marginTop: 6 }}>{active ? 'mendengarkan perintah…' : 'ketuk orb / tombol untuk aktivasi'}</div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols},1fr)`, gap: 14, height: '100%' }}>
              {panels.map(p => (
                <div key={p.id} style={{ background: 'rgba(14,23,48,0.55)', border: '1px solid rgba(77,123,255,0.22)', borderRadius: 14, overflow: 'hidden', display: 'flex', flexDirection: 'column', animation: 'zrise 0.6s cubic-bezier(0.2,0.8,0.2,1) both' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 13px', borderBottom: '1px solid rgba(77,123,255,0.18)', flexShrink: 0 }}>
                    <div style={{ fontFamily: 'Chakra Petch,sans-serif', fontSize: 10, fontWeight: 600, letterSpacing: '0.18em', color: '#cdd8f4', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#5fd4ff', boxShadow: '0 0 8px #5fd4ff' }} />
                      {p.title.toUpperCase()}
                    </div>
                    <button onClick={() => closePanel(p.id)} style={{ background: 'rgba(255,93,108,0.1)', border: '1px solid rgba(255,93,108,0.25)', borderRadius: 6, color: 'rgba(255,93,108,0.8)', fontSize: 9, letterSpacing: '0.1em', cursor: 'pointer', padding: '3px 9px', fontFamily: 'JetBrains Mono,monospace' }}>✕</button>
                  </div>
                  <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
                    {isDesktop() ? (
                      <webview src={p.url} style={{ width: '100%', height: '100%' }} allowpopups useragent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"></webview>
                    ) : (
                      <iframe src={p.url} style={{ width: '100%', height: '100%', border: 'none' }} sandbox="allow-scripts allow-same-origin allow-forms allow-popups" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ORB DI POJOK saat ada panel */}
        {hasPanels && (
          <div style={{ position: 'fixed', bottom: 24, right: 28, zIndex: 50, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <Orb size={84} />
            <div style={{ fontFamily: 'Chakra Petch,sans-serif', letterSpacing: '0.4em', fontSize: 9, color: '#5fd4ff', textIndent: '0.4em' }}>ZENITH</div>
          </div>
        )}

        {/* RESPONSE / TRANSCRIPT STRIP */}
        {(transcript || response) && (
          <div style={{ position: 'fixed', bottom: hasPanels ? 24 : 90, left: 24, zIndex: 40, maxWidth: hasPanels ? '52vw' : '60vw', background: 'rgba(7,11,30,0.82)', border: '1px solid rgba(77,123,255,0.22)', borderRadius: 12, padding: '12px 16px', animation: 'zfade 0.3s ease', backdropFilter: 'blur(10px)' }}>
            {transcript && <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontStyle: 'italic', marginBottom: 6 }}>"{transcript}"</div>}
            {response && <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.85)', lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: String(response).replace(/\[OPEN:.*?\]/g, '').replace(/\[APP:.*?\]/g, '').replace(/#{1,3} /g, '').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }} />}
          </div>
        )}

        {/* BOTTOM BAR */}
        <div style={{ height: 64, borderTop: '1px solid rgba(77,123,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexShrink: 0, background: 'rgba(7,11,30,0.6)' }}>
          <button onClick={toggleActive} style={{ padding: '10px 30px', background: active ? 'rgba(239,68,68,0.08)' : 'rgba(77,123,255,0.1)', border: `1px solid ${active ? 'rgba(239,68,68,0.25)' : 'rgba(77,123,255,0.3)'}`, borderRadius: 10, color: active ? 'rgba(239,68,68,0.85)' : '#cdd8f4', fontFamily: 'JetBrains Mono,monospace', fontSize: 10, letterSpacing: '0.18em', cursor: 'pointer' }}>
            {active ? '⏹  STOP' : '▶  AKTIVASI ZENITH'}
          </button>
          {hasPanels && <button onClick={() => setPanels([])} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid rgba(77,123,255,0.18)', borderRadius: 10, color: 'rgba(255,255,255,0.4)', fontFamily: 'JetBrains Mono,monospace', fontSize: 10, letterSpacing: '0.14em', cursor: 'pointer' }}>BERSIHKAN LAYAR</button>}
          <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)', letterSpacing: '0.1em' }}>ZENITH DASHBOARD · MODE JARVIS</span>
        </div>

        {errorMsg && (
          <div style={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', zIndex: 60, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, padding: '9px 16px', fontSize: 9, color: 'rgba(239,68,68,0.85)', letterSpacing: '0.1em' }}>⚠ {errorMsg}</div>
        )}
      </div>
    </>
  )
}
