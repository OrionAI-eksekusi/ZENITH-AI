'use client'
import { useState, useRef, useEffect } from 'react'

const BACKEND = 'http://localhost:8002'
const USER_ID = 'azvicky'

type VoiceState = 'idle' | 'listening' | 'thinking' | 'speaking'

export default function Home() {
  const [messages, setMessages] = useState<{role:string,text:string,time:string}[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [voiceState, setVoiceState] = useState<VoiceState>('idle')
  const msgEndRef = useRef<HTMLDivElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder|null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement|null>(null)
  const streamRef = useRef<MediaStream|null>(null)

  useEffect(() => { msgEndRef.current?.scrollIntoView({behavior:'smooth'}) }, [messages, loading])

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({audio:true})
      streamRef.current = stream
      const mr = new MediaRecorder(stream)
      mediaRecorderRef.current = mr
      audioChunksRef.current = []

      mr.ondataavailable = e => { if(e.data.size > 0) audioChunksRef.current.push(e.data) }

      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop())
        const blob = new Blob(audioChunksRef.current, {type:'audio/webm'})
        await processAudio(blob)
      }

      mr.start()
      setVoiceState('listening')
    } catch(e) {
      console.error('[MIC ERROR]', e)
      alert('Izinkan akses microphone di browser kamu.')
    }
  }

  const stopListening = () => {
    mediaRecorderRef.current?.stop()
    setVoiceState('thinking')
  }

  const processAudio = async (blob: Blob) => {
    setLoading(true)
    const time = new Date().toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'})
    try {
      const form = new FormData()
      form.append('audio', blob, 'audio.webm')
      form.append('user_id', USER_ID)

      const res = await fetch(`${BACKEND}/voice/transcribe`, {method:'POST', body:form})
      const data = await res.json()

      if (data.status !== 'success') {
        setVoiceState('idle')
        setLoading(false)
        return
      }

      // Tampilkan transcript user
      setMessages(prev => [...prev, {role:'user', text: data.transcript, time}])

      // Tampilkan response ZANITH
      const t = new Date().toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'})
      setMessages(prev => [...prev, {role:'ai', text: data.response, time: t}])

      // Play audio
      if (data.audio_b64) {
        setVoiceState('speaking')
        const audio = new Audio(`data:audio/mp3;base64,${data.audio_b64}`)
        audioRef.current = audio
        audio.onended = () => setVoiceState('idle')
        audio.play().catch(e => { console.error('[AUDIO PLAY]', e); setVoiceState('idle') })
      } else {
        setVoiceState('idle')
      }
    } catch(e) {
      console.error('[PROCESS ERROR]', e)
      setMessages(prev => [...prev, {role:'ai', text:'Koneksi bermasalah.', time}])
      setVoiceState('idle')
    }
    setLoading(false)
  }

  const toggleVoice = async () => {
    if (voiceState === 'idle') {
      await startListening()
    } else if (voiceState === 'listening') {
      stopListening()
    } else if (voiceState === 'speaking') {
      audioRef.current?.pause()
      setVoiceState('idle')
    }
  }

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim()
    if (!msg || loading) return
    setInput('')
    setLoading(true)
    const time = new Date().toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'})
    setMessages(prev => [...prev, {role:'user', text:msg, time}])
    try {
      const res = await fetch(`${BACKEND}/chat/`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({user_id: USER_ID, message: msg})
      })
      const data = await res.json()
      const t = new Date().toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'})
      setMessages(prev => [...prev, {role:'ai', text: data.response, time: t}])
    } catch {
      setMessages(prev => [...prev, {role:'ai', text:'Koneksi bermasalah.', time:'--:--'}])
    }
    setLoading(false)
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const sugs = [
    {icon:'📋', text:'Agenda penting hari ini?'},
    {icon:'📧', text:'Cek email urgent'},
    {icon:'🔍', text:'Riset AI terbaru 2026'},
    {icon:'📅', text:'Jadwal meeting hari ini?'},
  ]

  const voiceLabel: Record<VoiceState,string> = {
    idle:'VOICE', listening:'● RECORDING — tap untuk stop', thinking:'◌ PROCESSING', speaking:'▶ SPEAKING'
  }

  const voiceIcon: Record<VoiceState,string> = {
    idle:'🎙', listening:'⏹', thinking:'◌', speaking:'⏹'
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;}
        html,body{width:100%;height:100%;background:#03050d;overflow:hidden;}
        @keyframes pulse{0%,100%{opacity:0.4}50%{opacity:1}}
        @keyframes shimmer{0%{background-position:0%}100%{background-position:200%}}
        @keyframes fadeup{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes wave{0%,100%{transform:scaleY(0.15);opacity:0.2}50%{transform:scaleY(1);opacity:1}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes ripple{0%{transform:scale(1);opacity:0.4}100%{transform:scale(2.5);opacity:0}}
        @keyframes glow{0%,100%{box-shadow:0 0 20px rgba(77,159,255,0.1)}50%{box-shadow:0 0 40px rgba(77,159,255,0.25)}}
        .zanith-brand{background:linear-gradient(90deg,#4d9fff,#00e5ff,#4d9fff);background-size:200%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:shimmer 4s linear infinite;}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-thumb{background:rgba(77,159,255,0.1);border-radius:4px;}
        .sug:hover{border-color:rgba(77,159,255,0.2)!important;background:rgba(77,159,255,0.04)!important;transform:translateY(-1px);}
        .send-btn:hover{transform:scale(1.05);box-shadow:0 0 16px rgba(77,159,255,0.3);}
      `}</style>

      <div style={{display:'flex',flexDirection:'column',height:'100vh',background:'#03050d',color:'#dce8ff',fontFamily:"'Outfit',sans-serif",overflow:'hidden'}}>

        {/* HEADER */}
        <div style={{height:52,borderBottom:'1px solid rgba(77,159,255,0.06)',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 24px',background:'rgba(3,5,13,0.9)',backdropFilter:'blur(20px)',flexShrink:0}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:28,height:28,background:'linear-gradient(135deg,#4d9fff,#00e5ff)',borderRadius:7,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:12,color:'#000',boxShadow:'0 0 14px rgba(77,159,255,0.4)'}}>Z</div>
            <span className="zanith-brand" style={{fontFamily:'JetBrains Mono,monospace',fontSize:13,fontWeight:700,letterSpacing:'0.2em'}}>ZANITH</span>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <span style={{fontFamily:'JetBrains Mono,monospace',fontSize:9,color:'#3a4d6a',background:'rgba(255,255,255,0.02)',border:'1px solid rgba(77,159,255,0.06)',padding:'3px 8px',borderRadius:5}}>claude · sonnet-4</span>
            <div style={{display:'flex',alignItems:'center',gap:5,background:'rgba(0,229,255,0.04)',border:'1px solid rgba(0,229,255,0.1)',borderRadius:20,padding:'3px 10px'}}>
              <div style={{width:4,height:4,background:'#00e5ff',borderRadius:'50%',boxShadow:'0 0 5px #00e5ff',animation:'pulse 2s ease-in-out infinite'}} />
              <span style={{fontFamily:'JetBrains Mono,monospace',fontSize:8,color:'#00e5ff',letterSpacing:'0.12em'}}>ONLINE</span>
            </div>
          </div>
        </div>

        {/* MESSAGES */}
        <div style={{flex:1,overflowY:'auto',display:'flex',flexDirection:'column'}}>
          <div style={{width:'100%',maxWidth:740,margin:'0 auto',padding:'32px 24px',display:'flex',flexDirection:'column',gap:20,flex:1}}>

            {messages.length === 0 && (
              <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:24,textAlign:'center',minHeight:'55vh',animation:'fadeup 0.4s ease'}}>

                {/* Orb */}
                <div style={{position:'relative',width:90,height:90,display:'flex',alignItems:'center',justifyContent:'center'}}>
                  {voiceState === 'listening' && [0,0.5,1].map((d,i) => (
                    <div key={i} style={{position:'absolute',inset:0,borderRadius:'50%',border:'1px solid rgba(239,68,68,0.3)',animation:`ripple 2s ease-out ${d}s infinite`}} />
                  ))}
                  <div style={{
                    width:72,height:72,borderRadius:'50%',
                    background:'rgba(77,159,255,0.04)',
                    border:`1px solid ${voiceState==='listening'?'rgba(239,68,68,0.4)':voiceState!=='idle'?'rgba(77,159,255,0.3)':'rgba(77,159,255,0.1)'}`,
                    display:'flex',alignItems:'center',justifyContent:'center',
                    animation:voiceState!=='idle'?'glow 2s ease-in-out infinite':'pulse 3s ease-in-out infinite',
                    transition:'all 0.4s',
                  }}>
                    {voiceState === 'listening' && (
                      <div style={{display:'flex',alignItems:'center',gap:2,height:24}}>
                        {[6,12,18,22,18,12,6].map((h,i) => (
                          <div key={i} style={{width:2.5,height:h,borderRadius:2,background:'linear-gradient(to top,#ef4444,#f97316)',animation:`wave 0.4s ease-in-out ${i*0.06}s infinite`}} />
                        ))}
                      </div>
                    )}
                    {voiceState === 'thinking' && <div style={{width:24,height:24,borderRadius:'50%',border:'2px solid rgba(124,111,255,0.2)',borderTop:'2px solid #7c6fff',animation:'spin 0.8s linear infinite'}} />}
                    {voiceState === 'speaking' && (
                      <div style={{display:'flex',alignItems:'center',gap:2,height:24}}>
                        {[8,16,22,18,12,20,8].map((h,i) => (
                          <div key={i} style={{width:2.5,height:h,borderRadius:2,background:'linear-gradient(to top,#00e5ff,#4d9fff)',animation:`wave 0.5s ease-in-out ${i*0.09}s infinite`}} />
                        ))}
                      </div>
                    )}
                    {voiceState === 'idle' && <div style={{width:22,height:22,borderRadius:'50%',background:'rgba(77,159,255,0.12)',border:'1px solid rgba(77,159,255,0.25)'}} />}
                  </div>
                </div>

                <div>
                  <div style={{fontSize:24,fontWeight:600,background:'linear-gradient(135deg,#dce8ff,#4d9fff,#00e5ff)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Halo, saya ZANITH</div>
                  <div style={{fontSize:14,color:'#3a4d6a',marginTop:8,lineHeight:1.7}}>Ketik atau tekan 🎙 untuk bicara. Tap lagi untuk stop recording.</div>
                </div>

                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,width:'100%',maxWidth:480}}>
                  {sugs.map((s,i) => (
                    <button key={i} className="sug" onClick={() => sendMessage(s.text)} style={{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(77,159,255,0.08)',borderRadius:10,padding:'12px 14px',cursor:'pointer',textAlign:'left',display:'flex',alignItems:'center',gap:10,color:'#dce8ff',fontFamily:"'Outfit',sans-serif",transition:'all 0.2s'}}>
                      <span style={{fontSize:15}}>{s.icon}</span>
                      <span style={{fontSize:13,fontWeight:500}}>{s.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m,i) => (
              <div key={i} style={{display:'flex',gap:12,alignSelf:m.role==='user'?'flex-end':'flex-start',maxWidth:'85%',flexDirection:m.role==='user'?'row-reverse':'row',animation:'fadeup 0.25s ease'}}>
                <div style={{width:28,height:28,borderRadius:7,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,flexShrink:0,marginTop:2,background:m.role==='ai'?'rgba(77,159,255,0.1)':'rgba(124,111,255,0.1)',border:`1px solid ${m.role==='ai'?'rgba(77,159,255,0.2)':'rgba(124,111,255,0.2)'}`,color:m.role==='ai'?'#4d9fff':'#7c6fff'}}>
                  {m.role==='ai'?'Z':'A'}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontFamily:'JetBrains Mono,monospace',fontSize:8,color:'#2a3a52',letterSpacing:'0.08em',marginBottom:4,textAlign:m.role==='user'?'right':'left'}}>
                    {m.role==='ai'?'ZANITH':'KAMU'} · {m.time}
                  </div>
                  <div style={{background:m.role==='ai'?'rgba(255,255,255,0.025)':'rgba(77,159,255,0.05)',border:`1px solid ${m.role==='ai'?'rgba(77,159,255,0.07)':'rgba(77,159,255,0.12)'}`,borderRadius:14,padding:'12px 16px',fontSize:14,lineHeight:1.8,color:'#dce8ff',whiteSpace:'pre-wrap'}}>
                    {m.text}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div style={{display:'flex',gap:12,animation:'fadeup 0.25s ease'}}>
                <div style={{width:28,height:28,borderRadius:7,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,flexShrink:0,marginTop:2,background:'rgba(77,159,255,0.1)',border:'1px solid rgba(77,159,255,0.2)',color:'#4d9fff'}}>Z</div>
                <div>
                  <div style={{fontFamily:'JetBrains Mono,monospace',fontSize:8,color:'#2a3a52',marginBottom:4}}>ZANITH · thinking</div>
                  <div style={{background:'rgba(255,255,255,0.025)',border:'1px solid rgba(77,159,255,0.07)',borderRadius:14,padding:'12px 16px',display:'flex',gap:5,alignItems:'center'}}>
                    {[0,0.2,0.4].map((d,i) => <div key={i} style={{width:5,height:5,background:'#4d9fff',borderRadius:'50%',animation:`pulse 1.2s ease-in-out ${d}s infinite`}} />)}
                  </div>
                </div>
              </div>
            )}
            <div ref={msgEndRef} />
          </div>
        </div>

        {/* INPUT */}
        <div style={{borderTop:'1px solid rgba(77,159,255,0.06)',padding:'14px 24px 20px',background:'rgba(3,5,13,0.85)',backdropFilter:'blur(20px)',flexShrink:0}}>
          <div style={{maxWidth:740,margin:'0 auto'}}>
            {voiceState !== 'idle' && (
              <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,marginBottom:10,animation:'fadeup 0.2s ease'}}>
                <div style={{display:'flex',alignItems:'center',gap:2,height:18}}>
                  {[5,9,13,16,13,9,5].map((h,i) => (
                    <div key={i} style={{width:2,height:h,borderRadius:2,background:voiceState==='listening'?'#ef4444':voiceState==='speaking'?'#00e5ff':'#4d9fff',animation:`wave 0.6s ease-in-out ${i*0.07}s infinite`}} />
                  ))}
                </div>
                <span style={{fontFamily:'JetBrains Mono,monospace',fontSize:9,color:voiceState==='listening'?'#ef4444':voiceState==='thinking'?'#7c6fff':voiceState==='speaking'?'#00e5ff':'#4d9fff',letterSpacing:'0.1em',animation:'pulse 1.5s ease-in-out infinite'}}>
                  {voiceLabel[voiceState]}
                </span>
              </div>
            )}

            <div style={{background:'rgba(255,255,255,0.025)',border:'1px solid rgba(77,159,255,0.1)',borderRadius:16,padding:'12px 14px',display:'flex',alignItems:'flex-end',gap:10}}>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder={voiceState !== 'idle' ? voiceLabel[voiceState] : "Tanya apa saja ke ZANITH..."}
                rows={1}
                disabled={voiceState !== 'idle'}
                style={{flex:1,background:'none',border:'none',outline:'none',color:'#dce8ff',fontFamily:"'Outfit',sans-serif",fontSize:14,lineHeight:1.6,resize:'none',minHeight:22,maxHeight:120,opacity:voiceState==='idle'?1:0.5}}
              />
              <button
                onClick={toggleVoice}
                disabled={voiceState === 'thinking'}
                style={{
                  width:32,height:32,borderRadius:8,
                  border:`1px solid ${voiceState==='listening'?'rgba(239,68,68,0.5)':voiceState!=='idle'?'rgba(0,229,255,0.35)':'rgba(77,159,255,0.12)'}`,
                  background:voiceState==='listening'?'rgba(239,68,68,0.1)':voiceState!=='idle'?'rgba(0,229,255,0.06)':'transparent',
                  color:voiceState==='listening'?'#ef4444':voiceState!=='idle'?'#00e5ff':'#3a4d6a',
                  cursor:voiceState==='thinking'?'not-allowed':'pointer',
                  fontSize:15,display:'flex',alignItems:'center',justifyContent:'center',
                  flexShrink:0,transition:'all 0.2s',
                  animation:voiceState==='listening'?'glow 1s ease-in-out infinite':'none',
                }}
              >{voiceIcon[voiceState]}</button>
              <button
                className="send-btn"
                onClick={() => sendMessage()}
                disabled={loading || voiceState !== 'idle'}
                style={{width:32,height:32,borderRadius:8,border:'none',background:'linear-gradient(135deg,#4d9fff,#00e5ff)',color:'#000',cursor:'pointer',fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:16,opacity:(loading||voiceState!=='idle')?0.4:1,transition:'all 0.2s'}}
              >↑</button>
            </div>
            <div style={{fontFamily:'JetBrains Mono,monospace',fontSize:8,color:'#1e2a3a',textAlign:'center',marginTop:7,letterSpacing:'0.06em'}}>
              Enter kirim · 🎙 tap untuk record · tap lagi untuk stop & kirim
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
