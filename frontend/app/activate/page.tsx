'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://zenith-ai-production-c5d7.up.railway.app'

export default function Activate() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [status, setStatus] = useState('')

  const activate = async () => {
    if (!code || code.length < 6) { setStatus('Kode tidak valid'); return }
    setStatus('Memproses...')
    try {
      const stored = localStorage.getItem('zenith_token')
      const user = localStorage.getItem('zenith_user')
      if (!stored || !user) { setStatus('Login dulu sebelum aktivasi'); return }
      const userData = JSON.parse(user)
      const res = await fetch(`${BACKEND}/auth/device-activate`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({code: code.toUpperCase(), token: stored, user: userData})
      })
      const data = await res.json()
      if (data.status === 'success') {
        setStatus('✅ Desktop app berhasil login!')
      } else {
        setStatus('Kode tidak valid atau sudah expired')
      }
    } catch { setStatus('Gagal koneksi') }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;}
        body{background:#050814;color:#fff;font-family:JetBrains Mono,monospace;}
      `}</style>
      <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:24}}>
        <div style={{fontSize:14,fontWeight:600,letterSpacing:'0.2em',color:'#fff',marginBottom:8}}>ZENITH</div>
        <div style={{fontSize:9,color:'rgba(77,123,255,0.5)',letterSpacing:'0.2em',marginBottom:40}}>AKTIVASI DESKTOP APP</div>
        <div style={{width:'100%',maxWidth:400,background:'rgba(255,255,255,0.02)',border:'1px solid rgba(77,123,255,0.15)',borderRadius:16,padding:32}}>
          <div style={{fontSize:10,color:'rgba(255,255,255,0.4)',marginBottom:16,letterSpacing:'0.1em'}}>Masukkan kode yang tampil di desktop app ZENITH:</div>
          <input
            value={code}
            onChange={e=>setCode(e.target.value.toUpperCase())}
            placeholder="CONTOH: A3B7C9"
            maxLength={6}
            style={{width:'100%',padding:'12px 16px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(77,123,255,0.2)',borderRadius:8,color:'#fff',fontFamily:'JetBrains Mono,monospace',fontSize:18,letterSpacing:'0.3em',textAlign:'center',marginBottom:16,outline:'none'}}
          />
          <button onClick={activate} style={{width:'100%',padding:'12px 0',background:'rgba(77,123,255,0.1)',border:'1px solid rgba(77,123,255,0.25)',borderRadius:8,color:'#4c7bff',fontFamily:'JetBrains Mono,monospace',fontSize:10,letterSpacing:'0.15em',cursor:'pointer'}}>
            AKTIVASI
          </button>
          {status && <div style={{marginTop:16,fontSize:9,color:'rgba(255,255,255,0.5)',textAlign:'center'}}>{status}</div>}
        </div>
        <button onClick={()=>router.push('/login')} style={{marginTop:24,background:'none',border:'none',color:'rgba(255,255,255,0.2)',fontFamily:'JetBrains Mono,monospace',fontSize:9,cursor:'pointer'}}>← LOGIN DULU</button>
      </div>
    </>
  )
}
