'use client'
import { useRouter } from 'next/navigation'

export default function Landing() {
  const router = useRouter()
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;}
        body{background:#050814;color:#fff;font-family:JetBrains Mono,monospace;}
        @keyframes shimmer{0%{background-position:0%}100%{background-position:200%}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .cta:hover{background:rgba(77,123,255,0.2)!important;transform:translateY(-2px);}
      `}</style>
      <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#020610 0%,#050814 50%,#030a1a 100%)',fontFamily:'JetBrains Mono,monospace'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'24px 48px',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
          <div style={{fontSize:14,fontWeight:600,letterSpacing:'0.2em',background:'linear-gradient(90deg,#fff,rgba(77,123,255,0.9))',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>ZENITH</div>
          <div style={{display:'flex',gap:24,alignItems:'center'}}>
            <a href='/download' style={{fontSize:9,color:'rgba(255,255,255,0.3)',textDecoration:'none',letterSpacing:'0.1em'}}>DOWNLOAD</a>
            <a href='/upgrade' style={{fontSize:9,color:'rgba(255,255,255,0.3)',textDecoration:'none',letterSpacing:'0.1em'}}>PRICING</a>
            <button onClick={()=>router.push('/login')} style={{padding:'8px 20px',background:'rgba(77,123,255,0.1)',border:'1px solid rgba(77,123,255,0.2)',borderRadius:8,color:'#4c7bff',fontFamily:'JetBrains Mono,monospace',fontSize:9,letterSpacing:'0.1em',cursor:'pointer'}}>MASUK</button>
          </div>
        </div>
        <div style={{textAlign:'center',padding:'100px 24px 60px',animation:'fadeIn 0.6s ease'}}>
          <div style={{fontSize:9,color:'rgba(77,123,255,0.6)',letterSpacing:'0.3em',marginBottom:24}}>AUTONOMOUS INTELLIGENCE OS</div>
          <h1 style={{fontSize:48,fontWeight:600,letterSpacing:'0.05em',color:'#fff',marginBottom:16,lineHeight:1.2}}>ZENITH AI</h1>
          <p style={{fontSize:12,color:'rgba(255,255,255,0.4)',maxWidth:500,margin:'0 auto 40px',lineHeight:1.8}}>Asisten AI berbasis suara yang bisa membaca Gmail, membuka Calendar, mencari informasi, dan mengeksekusi perintah Anda — seperti Jarvis.</p>
          <div style={{display:'flex',gap:12,justifyContent:'center'}}>
            <button onClick={()=>router.push('/login')} className="cta" style={{padding:'14px 32px',background:'rgba(77,123,255,0.12)',border:'1px solid rgba(77,123,255,0.3)',borderRadius:10,color:'#6b9fff',fontFamily:'JetBrains Mono,monospace',fontSize:10,letterSpacing:'0.15em',cursor:'pointer',transition:'all 0.2s'}}>MULAI GRATIS →</button>
            <button onClick={()=>router.push('/download')} className="cta" style={{padding:'14px 32px',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:10,color:'rgba(255,255,255,0.5)',fontFamily:'JetBrains Mono,monospace',fontSize:10,letterSpacing:'0.15em',cursor:'pointer',transition:'all 0.2s'}}>DOWNLOAD APP</button>
          </div>
        </div>
        <div style={{borderTop:'1px solid rgba(255,255,255,0.04)',padding:'24px 48px',display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:40}}>
          <div style={{fontSize:8,color:'rgba(255,255,255,0.15)',letterSpacing:'0.1em'}}>©️ ZENITH AI 2026</div>
          <div style={{display:'flex',gap:16}}>
            <a href='/privacy' style={{fontSize:8,color:'rgba(77,123,255,0.3)',textDecoration:'none'}}>PRIVACY</a>
            <a href='/terms' style={{fontSize:8,color:'rgba(77,123,255,0.3)',textDecoration:'none'}}>TERMS</a>
          </div>
        </div>
      </div>
    </>
  )
}
