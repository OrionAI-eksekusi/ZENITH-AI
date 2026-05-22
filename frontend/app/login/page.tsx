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
      `}</style>

      <div style={{width:'100vw',height:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#06090f',fontFamily:'JetBrains Mono,monospace'}}>
        <div style={{width:380,animation:'fadeIn 0.4s ease'}}>
          <div style={{textAlign:'center',marginBottom:40}}>
            <div style={{width:48,height:48,background:'linear-gradient(135deg,#1a2347,#0d1228)',border:'1px solid rgba(77,123,255,0.3)',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px',boxShadow:'0 0 20px rgba(77,123,255,0.2)'}}>
              <svg viewBox="0 0 200 200" width="36" height="36">
                <defs>
                  <radialGradient id="g1" cx="50%" cy="50%" r="60%">
                    <stop offset="40%" stopColor="#4c7bff" stopOpacity="0"/>
                    <stop offset="58%" stopColor="#4c7bff" stopOpacity="0.9"/>
                    <stop offset="70%" stopColor="#4c7bff" stopOpacity="0"/>
                  </radialGradient>
                </defs>
                <rect width="200" height="200" fill="#0d1228"/>
                <circle cx="100" cy="100" r="72" fill="url(#g1)"/>
                <circle cx="100" cy="100" r="68" fill="none" stroke="#4c7bff" strokeWidth="1.5" opacity="0.9"/>
                <circle cx="100" cy="100" r="58" fill="#08101f"/>
                <circle cx="78" cy="76" r="4" fill="#4c7bff" opacity="0.75"/>
              </svg>
            </div>
            <div style={{fontSize:14,fontWeight:500,letterSpacing:'0.3em',background:'linear-gradient(90deg,#4c7bff,#8b5cf6,#4c7bff)',backgroundSize:'200%',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',animation:'shimmer 4s linear infinite'}}>ZANITH</div>
            <div style={{fontSize:10,color:'rgba(77,123,255,0.4)',letterSpacing:'0.15em',marginTop:6}}>AUTONOMOUS INTELLIGENCE OS</div>
          </div>

          <div style={{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(77,123,255,0.1)',borderRadius:16,padding:32}}>
            <div style={{display:'flex',marginBottom:28,background:'rgba(0,0,0,0.2)',borderRadius:8,padding:3}}>
              {(['login','register'] as const).map(m => (
                <button key={m} onClick={() => {setMode(m);setError('')}} style={{flex:1,padding:'8px 0',borderRadius:6,border:'none',cursor:'pointer',fontFamily:'JetBrains Mono,monospace',fontSize:10,letterSpacing:'0.1em',fontWeight:500,transition:'all 0.2s',background:mode===m?'rgba(77,123,255,0.15)':'transparent',color:mode===m?'#4c7bff':'rgba(77,123,255,0.3)'}}>
                  {m === 'login' ? 'MASUK' : 'DAFTAR'}
                </button>
              ))}
            </div>

            {mode === 'register' && (
              <div style={{marginBottom:14}}>
                <div style={{fontSize:9,color:'rgba(77,123,255,0.5)',letterSpacing:'0.15em',marginBottom:6}}>NAMA</div>
                <input value={name} onChange={e=>setName(e.target.value)} placeholder="Nama kamu" style={{width:'100%',background:'rgba(77,123,255,0.03)',border:'1px solid rgba(77,123,255,0.1)',borderRadius:8,padding:'10px 14px',color:'#dce8ff',fontFamily:'JetBrains Mono,monospace',fontSize:12}}/>
              </div>
            )}

            <div style={{marginBottom:14}}>
              <div style={{fontSize:9,color:'rgba(77,123,255,0.5)',letterSpacing:'0.15em',marginBottom:6}}>EMAIL</div>
              <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="email@kamu.com" type="email" style={{width:'100%',background:'rgba(77,123,255,0.03)',border:'1px solid rgba(77,123,255,0.1)',borderRadius:8,padding:'10px 14px',color:'#dce8ff',fontFamily:'JetBrains Mono,monospace',fontSize:12}}/>
            </div>

            <div style={{marginBottom:24}}>
              <div style={{fontSize:9,color:'rgba(77,123,255,0.5)',letterSpacing:'0.15em',marginBottom:6}}>PASSWORD</div>
              <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" type="password" onKeyDown={e=>e.key==='Enter'&&submit()} style={{width:'100%',background:'rgba(77,123,255,0.03)',border:'1px solid rgba(77,123,255,0.1)',borderRadius:8,padding:'10px 14px',color:'#dce8ff',fontFamily:'JetBrains Mono,monospace',fontSize:12}}/>
            </div>

            {error && <div style={{fontSize:10,color:'#ef4444',marginBottom:16,padding:'8px 12px',background:'rgba(239,68,68,0.05)',borderRadius:6,border:'1px solid rgba(239,68,68,0.1)'}}>{error}</div>}

            <button onClick={submit} disabled={loading} style={{width:'100%',padding:'12px 0',background:loading?'rgba(77,123,255,0.1)':'linear-gradient(135deg,rgba(77,123,255,0.2),rgba(139,92,246,0.2))',border:'1px solid rgba(77,123,255,0.2)',borderRadius:8,color:loading?'rgba(77,123,255,0.4)':'#4c7bff',fontFamily:'JetBrains Mono,monospace',fontSize:11,letterSpacing:'0.15em',cursor:loading?'not-allowed':'pointer'}}>
              {loading ? 'MEMPROSES...' : mode === 'login' ? 'MASUK KE ZANITH' : 'BUAT AKUN'}
            </button>
          </div>
          <div style={{textAlign:'center',marginTop:20,fontSize:9,color:'rgba(77,123,255,0.2)',letterSpacing:'0.1em'}}>ZANITH AI · AUTONOMOUS INTELLIGENCE</div>
        </div>
      </div>
    </>
  )
}
