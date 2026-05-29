'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8002'

export default function Login() {
  const router = useRouter()
  const [mode, setMode] = useState<'login'|'register'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isElectron, setIsElectron] = useState(false)
  const [time, setTime] = useState('')

  // Hydration-safe Electron detection
  useEffect(() => {
    setIsElectron(!!(window as any).electronAPI || navigator.userAgent.includes('Electron'))
    const t = setInterval(() => setTime(new Date().toLocaleTimeString('id-ID', { hour12: false })), 1000)
    return () => clearInterval(t)
  }, [])

  const googleLogin = () => {
    if (isElectron) {
      (window as any).electronAPI?.openURL(`${BACKEND}/gmail/login?desktop=true`)
    } else {
      window.location.href = `${BACKEND}/gmail/login`
    }
  }

  const submit = async () => {
    if (!email || !password || (mode === 'register' && !name)) {
      setError('Semua field wajib diisi'); return
    }
    setLoading(true); setError('')
    try {
      const res = await fetch(`${BACKEND}/auth/${mode}`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email, password, name})
      })
      const data = await res.json()
      if (data.status === 'success') {
        localStorage.setItem('zenith_token', data.token)
        localStorage.setItem('zenith_user', JSON.stringify(data.user))
        router.push('/')
      } else {
        setError(data.message || 'Terjadi kesalahan')
      }
    } catch { setError('Koneksi bermasalah') }
    setLoading(false)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;500;600;700&family=JetBrains+Mono:wght@300;400;500&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;}
        html,body{width:100%;height:100%;background:#050814;overflow:hidden;}
        @keyframes shimmer{0%{background-position:0%}100%{background-position:200%}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:0.4}50%{opacity:1}}
        @keyframes orbpulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
        @keyframes scan{0%{transform:translateY(-100%)}100%{transform:translateY(100vh)}}
        input::placeholder{color:rgba(77,123,255,0.25);}
        input:focus{outline:none;border-color:rgba(77,123,255,0.5)!important;background:rgba(77,123,255,0.06)!important;}
        .gbtn:hover{border-color:rgba(77,123,255,0.3)!important;background:rgba(77,123,255,0.07)!important;}
        .sbtn:hover{opacity:0.85;transform:translateY(-1px);}
        .tab:hover{color:rgba(77,123,255,0.6)!important;}
      `}</style>

      {/* BACKGROUND */}
      <div style={{position:'fixed',inset:0,background:'radial-gradient(circle at 30% 40%,rgba(77,123,255,0.08) 0%,transparent 60%)',pointerEvents:'none'}}/>
      <div style={{position:'fixed',inset:0,background:'radial-gradient(circle at 75% 70%,rgba(139,92,246,0.06) 0%,transparent 55%)',pointerEvents:'none'}}/>
      {/* Grid */}
      <div style={{position:'fixed',inset:0,backgroundImage:'linear-gradient(rgba(77,123,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(77,123,255,0.04) 1px,transparent 1px)',backgroundSize:'48px 48px',pointerEvents:'none'}}/>
      {/* Scan line */}
      <div style={{position:'fixed',left:0,right:0,height:120,background:'linear-gradient(transparent,rgba(77,123,255,0.025),transparent)',animation:'scan 8s linear infinite',pointerEvents:'none'}}/>

      {/* TOP BAR */}
      <div style={{position:'fixed',top:0,left:0,right:0,height:48,borderBottom:'1px solid rgba(77,123,255,0.12)',background:'rgba(5,8,20,0.7)',backdropFilter:'blur(10px)',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 28px',zIndex:10}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <svg viewBox="0 0 200 200" width="22" height="22" style={{filter:'drop-shadow(0 0 6px rgba(77,123,255,0.4))'}}>
            <defs>
              <radialGradient id="tlg1" cx="50%" cy="50%" r="60%">
                <stop offset="40%" stopColor="#4c7bff" stopOpacity="0"/>
                <stop offset="58%" stopColor="#4c7bff" stopOpacity="0.9"/>
                <stop offset="70%" stopColor="#4c7bff" stopOpacity="0"/>
              </radialGradient>
              <radialGradient id="tlg2" cx="35%" cy="25%" r="80%">
                <stop offset="0%" stopColor="#1a2347"/>
                <stop offset="100%" stopColor="#06090f"/>
              </radialGradient>
            </defs>
            <circle cx="100" cy="100" r="100" fill="url(#tlg2)"/>
            <circle cx="100" cy="100" r="72" fill="url(#tlg1)"/>
            <circle cx="100" cy="100" r="68" fill="none" stroke="#4c7bff" strokeWidth="2" opacity="0.9"/>
            <circle cx="100" cy="100" r="58" fill="#08101f"/>
            <circle cx="78" cy="76" r="3.5" fill="#4c7bff" opacity="0.8"/>
          </svg>
          <span style={{fontFamily:'Chakra Petch,sans-serif',fontWeight:700,fontSize:12,letterSpacing:'0.35em',background:'linear-gradient(90deg,#fff,rgba(77,123,255,0.8),#fff)',backgroundSize:'200%',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',animation:'shimmer 5s linear infinite'}}>Z E N I T H</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:16}}>
          <div style={{display:'flex',alignItems:'center',gap:6}}>
            <span style={{width:5,height:5,borderRadius:'50%',background:'#5fd4ff',boxShadow:'0 0 6px #5fd4ff',animation:'pulse 2s infinite',display:'inline-block'}}/>
            <span style={{fontSize:8,color:'rgba(95,212,255,0.7)',letterSpacing:'0.14em',fontFamily:'JetBrains Mono'}}>SYSTEM ONLINE</span>
          </div>
          <span style={{fontSize:10,color:'rgba(255,255,255,0.25)',fontFamily:'JetBrains Mono'}}>{time}</span>
        </div>
      </div>

      {/* MAIN */}
      <div style={{width:'100vw',height:'100vh',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'JetBrains Mono,monospace',paddingTop:48}}>
        <div style={{width:400,animation:'fadeIn 0.5s ease'}}>

          {/* LOGO */}
          <div style={{textAlign:'center',marginBottom:32}}>
            <div style={{margin:'0 auto 18px',width:88,height:88,display:'flex',alignItems:'center',justifyContent:'center',animation:'orbpulse 4s ease-in-out infinite'}}>
              <svg viewBox="0 0 200 200" width="88" height="88" style={{filter:'drop-shadow(0 0 24px rgba(77,123,255,0.45))'}}>
                <defs>
                  <radialGradient id="llg1" cx="50%" cy="50%" r="60%">
                    <stop offset="40%" stopColor="#4c7bff" stopOpacity="0"/>
                    <stop offset="58%" stopColor="#4c7bff" stopOpacity="0.85"/>
                    <stop offset="70%" stopColor="#4c7bff" stopOpacity="0"/>
                  </radialGradient>
                  <radialGradient id="llg2" cx="50%" cy="50%" r="55%">
                    <stop offset="55%" stopColor="#8b5cf6" stopOpacity="0"/>
                    <stop offset="80%" stopColor="#8b5cf6" stopOpacity="0.2"/>
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0"/>
                  </radialGradient>
                  <radialGradient id="llg3" cx="35%" cy="25%" r="80%">
                    <stop offset="0%" stopColor="#1a2347"/>
                    <stop offset="60%" stopColor="#0a0f24"/>
                    <stop offset="100%" stopColor="#050814"/>
                  </radialGradient>
                </defs>
                <circle cx="100" cy="100" r="100" fill="url(#llg3)"/>
                <circle cx="100" cy="100" r="98" fill="url(#llg2)"/>
                <circle cx="100" cy="100" r="72" fill="url(#llg1)"/>
                <circle cx="100" cy="100" r="68" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1" opacity="0.8"/>
                <circle cx="100" cy="100" r="58" fill="#080d1a"/>
                <circle cx="78" cy="76" r="3.5" fill="rgba(255,255,255,0.75)"/>
              </svg>
            </div>
            <div style={{fontFamily:'Chakra Petch,sans-serif',fontSize:22,fontWeight:700,letterSpacing:'0.45em',background:'linear-gradient(90deg,#fff 0%,rgba(77,123,255,0.9) 50%,#fff 100%)',backgroundSize:'200%',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',animation:'shimmer 5s linear infinite',marginBottom:6}}>ZENITH</div>
            <div style={{fontSize:8,color:'rgba(77,123,255,0.4)',letterSpacing:'0.22em'}}>AUTONOMOUS INTELLIGENCE OS</div>
          </div>

          {/* CARD */}
          <div style={{background:'rgba(10,16,36,0.7)',border:'1px solid rgba(77,123,255,0.15)',borderRadius:18,padding:28,boxShadow:'0 24px 80px rgba(0,0,0,0.5), 0 0 40px rgba(77,123,255,0.06)',backdropFilter:'blur(12px)'}}>

            {/* Google Button */}
            <button className="gbtn" onClick={googleLogin} style={{width:'100%',padding:'12px 0',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.09)',borderRadius:10,color:'rgba(220,232,255,0.85)',fontFamily:'JetBrains Mono,monospace',fontSize:10,letterSpacing:'0.1em',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:10,marginBottom:20,transition:'all 0.2s'}}>
              <svg width="15" height="15" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {isElectron ? 'BUKA LOGIN DI BROWSER' : 'MASUK DENGAN GOOGLE'}
            </button>

            {/* Divider */}
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20}}>
              <div style={{flex:1,height:1,background:'rgba(77,123,255,0.08)'}}/>
              <span style={{fontSize:8,color:'rgba(77,123,255,0.25)',letterSpacing:'0.14em'}}>ATAU</span>
              <div style={{flex:1,height:1,background:'rgba(77,123,255,0.08)'}}/>
            </div>

            {/* Toggle */}
            <div style={{display:'flex',marginBottom:20,background:'rgba(0,0,0,0.25)',borderRadius:8,padding:3,gap:3}}>
              {(['login','register'] as const).map(m => (
                <button key={m} className="tab" onClick={() => {setMode(m);setError('')}} style={{flex:1,padding:'8px 0',borderRadius:6,border:'none',cursor:'pointer',fontFamily:'JetBrains Mono,monospace',fontSize:9,letterSpacing:'0.1em',transition:'all 0.2s',background:mode===m?'rgba(77,123,255,0.14)':'transparent',color:mode===m?'#4c7bff':'rgba(77,123,255,0.3)',boxShadow:mode===m?'0 0 12px rgba(77,123,255,0.1)':'none'}}>
                  {m==='login'?'MASUK':'DAFTAR'}
                </button>
              ))}
            </div>

            {mode==='register'&&(
              <div style={{marginBottom:13}}>
                <div style={{fontSize:8,color:'rgba(77,123,255,0.45)',letterSpacing:'0.14em',marginBottom:6}}>NAMA</div>
                <input value={name} onChange={e=>setName(e.target.value)} placeholder="Nama kamu" style={{width:'100%',background:'rgba(77,123,255,0.04)',border:'1px solid rgba(77,123,255,0.12)',borderRadius:8,padding:'10px 13px',color:'#dce8ff',fontFamily:'JetBrains Mono,monospace',fontSize:12,transition:'all 0.2s'}}/>
              </div>
            )}

            <div style={{marginBottom:13}}>
              <div style={{fontSize:8,color:'rgba(77,123,255,0.45)',letterSpacing:'0.14em',marginBottom:6}}>EMAIL</div>
              <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="email@kamu.com" type="email" style={{width:'100%',background:'rgba(77,123,255,0.04)',border:'1px solid rgba(77,123,255,0.12)',borderRadius:8,padding:'10px 13px',color:'#dce8ff',fontFamily:'JetBrains Mono,monospace',fontSize:12,transition:'all 0.2s'}}/>
            </div>

            <div style={{marginBottom:20}}>
              <div style={{fontSize:8,color:'rgba(77,123,255,0.45)',letterSpacing:'0.14em',marginBottom:6}}>PASSWORD</div>
              <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" type="password" onKeyDown={e=>e.key==='Enter'&&submit()} style={{width:'100%',background:'rgba(77,123,255,0.04)',border:'1px solid rgba(77,123,255,0.12)',borderRadius:8,padding:'10px 13px',color:'#dce8ff',fontFamily:'JetBrains Mono,monospace',fontSize:12,transition:'all 0.2s'}}/>
            </div>

            {error&&(
              <div style={{fontSize:10,color:'#ef4444',marginBottom:14,padding:'8px 12px',background:'rgba(239,68,68,0.06)',borderRadius:7,border:'1px solid rgba(239,68,68,0.12)',letterSpacing:'0.04em'}}>
                ⚠ {error}
              </div>
            )}

            <button className="sbtn" onClick={submit} disabled={loading} style={{width:'100%',padding:'12px 0',background:loading?'rgba(77,123,255,0.04)':'linear-gradient(135deg,rgba(77,123,255,0.15),rgba(139,92,246,0.12))',border:`1px solid ${loading?'rgba(77,123,255,0.08)':'rgba(77,123,255,0.25)'}`,borderRadius:10,color:loading?'rgba(77,123,255,0.3)':'#4c7bff',fontFamily:'JetBrains Mono,monospace',fontSize:10,letterSpacing:'0.18em',cursor:loading?'not-allowed':'pointer',transition:'all 0.2s',boxShadow:loading?'none':'0 4px 20px rgba(77,123,255,0.12)'}}>
              {loading ? 'MEMPROSES...' : mode==='login' ? '▶  MASUK KE ZENITH' : '▶  BUAT AKUN'}
            </button>
          </div>

          <div style={{textAlign:'center',marginTop:16,fontSize:8,color:'rgba(77,123,255,0.15)',letterSpacing:'0.1em'}}>
            © ZENITH AI 2026 · AUTONOMOUS INTELLIGENCE ·{' '}
            <a href="/privacy" style={{color:'rgba(77,123,255,0.3)',textDecoration:'none'}}>Privacy</a> ·{' '}
            <a href="/terms" style={{color:'rgba(77,123,255,0.3)',textDecoration:'none'}}>Terms</a>
          </div>
        </div>
      </div>
    </>
  )
}
