'use client'
import { useState } from 'react'
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

  const googleLogin = () => {
    window.location.href = `${BACKEND}/gmail/login`
  }

  const submit = async () => {
    if (!email || !password || (mode === 'register' && !name)) {
      setError('Semua field wajib diisi')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${BACKEND}/auth/${mode}`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email, password, name})
      })
      const data = await res.json()
      if (data.status === 'success') {
        localStorage.setItem('zanith_token', data.token)
        localStorage.setItem('zanith_user', JSON.stringify(data.user))
        router.push('/')
      } else {
        setError(data.message || 'Terjadi kesalahan')
      }
    } catch(e) {
      setError('Koneksi bermasalah')
    }
    setLoading(false)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;}
        html,body{width:100%;height:100%;background:#06090f;}
        @keyframes shimmer{0%{background-position:0%}100%{background-position:200%}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        input::placeholder{color:rgba(77,123,255,0.3);}
        input:focus{outline:none;border-color:rgba(77,123,255,0.4)!important;}
        .gbtn:hover{border-color:rgba(255,255,255,0.15)!important;background:rgba(255,255,255,0.05)!important;}
      `}</style>

      <div style={{width:'100vw',height:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#06090f',fontFamily:'JetBrains Mono,monospace'}}>
        <div style={{width:380,animation:'fadeIn 0.4s ease'}}>

          <div style={{textAlign:'center',marginBottom:36}}>
            <div style={{margin:'0 auto 16px',width:80,height:80,display:'flex',alignItems:'center',justifyContent:'center'}}>
              <svg viewBox="0 0 200 200" width="80" height="80" style={{filter:'drop-shadow(0 0 20px rgba(77,123,255,0.4))'}}>
                <defs>
                  <radialGradient id="lg1" cx="50%" cy="50%" r="60%">
                    <stop offset="40%" stopColor="#4c7bff" stopOpacity="0"/>
                    <stop offset="58%" stopColor="#4c7bff" stopOpacity="0.9"/>
                    <stop offset="70%" stopColor="#4c7bff" stopOpacity="0"/>
                  </radialGradient>
                  <radialGradient id="lg2" cx="50%" cy="50%" r="55%">
                    <stop offset="55%" stopColor="#8b5cf6" stopOpacity="0"/>
                    <stop offset="80%" stopColor="#8b5cf6" stopOpacity="0.2"/>
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0"/>
                  </radialGradient>
                  <radialGradient id="lg3" cx="35%" cy="25%" r="80%">
                    <stop offset="0%" stopColor="#1a2347"/>
                    <stop offset="60%" stopColor="#0a0f24"/>
                    <stop offset="100%" stopColor="#050814"/>
                  </radialGradient>
                </defs>
                <circle cx="100" cy="100" r="100" fill="url(#lg3)"/>
                <circle cx="100" cy="100" r="98" fill="url(#lg2)"/>
                <circle cx="100" cy="100" r="72" fill="url(#lg1)"/>
                <circle cx="100" cy="100" r="68" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1" opacity="0.8"/>
                <circle cx="100" cy="100" r="58" fill="#080d1a"/>
                <circle cx="78" cy="76" r="3.5" fill="rgba(255,255,255,0.8)"/>
              </svg>
            </div>
            <div style={{fontSize:14,fontWeight:500,letterSpacing:'0.3em',background:'linear-gradient(90deg,#4c7bff,#8b5cf6,#4c7bff)',backgroundSize:'200%',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',animation:'shimmer 4s linear infinite'}}>ZANITH</div>
            <div style={{fontSize:9,color:'rgba(77,123,255,0.35)',letterSpacing:'0.18em',marginTop:5}}>AUTONOMOUS INTELLIGENCE OS</div>
          </div>

          <div style={{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(77,123,255,0.08)',borderRadius:16,padding:28,boxShadow:'0 0 40px rgba(0,0,0,0.3)'}}>

            {/* Google Button */}
            <button className="gbtn" onClick={googleLogin} style={{width:'100%',padding:'11px 0',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:10,color:'rgba(220,232,255,0.85)',fontFamily:'JetBrains Mono,monospace',fontSize:10,letterSpacing:'0.1em',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:10,marginBottom:18,transition:'all 0.2s'}}>
              <svg width="15" height="15" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              MASUK DENGAN GOOGLE
            </button>

            {/* Divider */}
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:18}}>
              <div style={{flex:1,height:1,background:'rgba(77,123,255,0.07)'}}/>
              <span style={{fontSize:8,color:'rgba(77,123,255,0.25)',letterSpacing:'0.1em'}}>ATAU</span>
              <div style={{flex:1,height:1,background:'rgba(77,123,255,0.07)'}}/>
            </div>

            {/* Toggle */}
            <div style={{display:'flex',marginBottom:18,background:'rgba(0,0,0,0.2)',borderRadius:7,padding:3}}>
              {(['login','register'] as const).map(m => (
                <button key={m} onClick={() => {setMode(m);setError('')}} style={{flex:1,padding:'7px 0',borderRadius:5,border:'none',cursor:'pointer',fontFamily:'JetBrains Mono,monospace',fontSize:9,letterSpacing:'0.1em',transition:'all 0.2s',background:mode===m?'rgba(77,123,255,0.12)':'transparent',color:mode===m?'#4c7bff':'rgba(77,123,255,0.3)'}}>
                  {m==='login'?'MASUK':'DAFTAR'}
                </button>
              ))}
            </div>

            {mode==='register'&&(
              <div style={{marginBottom:11}}>
                <div style={{fontSize:8,color:'rgba(77,123,255,0.4)',letterSpacing:'0.12em',marginBottom:5}}>NAMA</div>
                <input value={name} onChange={e=>setName(e.target.value)} placeholder="Nama kamu" style={{width:'100%',background:'rgba(77,123,255,0.03)',border:'1px solid rgba(77,123,255,0.1)',borderRadius:7,padding:'9px 12px',color:'#dce8ff',fontFamily:'JetBrains Mono,monospace',fontSize:12}}/>
              </div>
            )}

            <div style={{marginBottom:11}}>
              <div style={{fontSize:8,color:'rgba(77,123,255,0.4)',letterSpacing:'0.12em',marginBottom:5}}>EMAIL</div>
              <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="email@kamu.com" type="email" style={{width:'100%',background:'rgba(77,123,255,0.03)',border:'1px solid rgba(77,123,255,0.1)',borderRadius:7,padding:'9px 12px',color:'#dce8ff',fontFamily:'JetBrains Mono,monospace',fontSize:12}}/>
            </div>

            <div style={{marginBottom:18}}>
              <div style={{fontSize:8,color:'rgba(77,123,255,0.4)',letterSpacing:'0.12em',marginBottom:5}}>PASSWORD</div>
              <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" type="password" onKeyDown={e=>e.key==='Enter'&&submit()} style={{width:'100%',background:'rgba(77,123,255,0.03)',border:'1px solid rgba(77,123,255,0.1)',borderRadius:7,padding:'9px 12px',color:'#dce8ff',fontFamily:'JetBrains Mono,monospace',fontSize:12}}/>
            </div>

            {error&&<div style={{fontSize:10,color:'#ef4444',marginBottom:12,padding:'7px 10px',background:'rgba(239,68,68,0.05)',borderRadius:6,border:'1px solid rgba(239,68,68,0.1)'}}>{error}</div>}

            <button onClick={submit} disabled={loading} style={{width:'100%',padding:'11px 0',background:loading?'rgba(77,123,255,0.04)':'linear-gradient(135deg,rgba(77,123,255,0.12),rgba(139,92,246,0.12))',border:'1px solid rgba(77,123,255,0.15)',borderRadius:8,color:loading?'rgba(77,123,255,0.3)':'#4c7bff',fontFamily:'JetBrains Mono,monospace',fontSize:10,letterSpacing:'0.15em',cursor:loading?'not-allowed':'pointer',transition:'all 0.2s'}}>
              {loading?'MEMPROSES...':mode==='login'?'MASUK KE ZANITH':'BUAT AKUN'}
            </button>
          </div>

          <div style={{textAlign:'center',marginTop:14,fontSize:8,color:'rgba(77,123,255,0.15)',letterSpacing:'0.1em'}}>ZANITH AI · AUTONOMOUS INTELLIGENCE</div>
        </div>
      </div>
    </>
  )
}
