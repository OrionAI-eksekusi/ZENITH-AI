'use client'
import { useRouter } from 'next/navigation'

export default function Download() {
  const router = useRouter()
  const DMG_URL = 'https://github.com/OrionAI-eksekusi/ZENITH-desktop/releases/download/v1.0.0/ZENITH-1.0.0-arm64.dmg'

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;}
        body{background:#050814;color:#fff;font-family:JetBrains Mono,monospace;}
        @keyframes shimmer{0%{background-position:0%}100%{background-position:200%}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes glow{0%,100%{box-shadow:0 0 20px rgba(77,123,255,0.1)}50%{box-shadow:0 0 40px rgba(77,123,255,0.3)}}
        .dl-btn:hover{background:rgba(77,123,255,0.2)!important;border-color:rgba(77,123,255,0.4)!important;}
      `}</style>
      <div style={{minHeight:'100vh',background:'#050814',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'40px 24px',fontFamily:'JetBrains Mono,monospace'}}>
        <div style={{textAlign:'center',marginBottom:48,animation:'fadeIn 0.4s ease'}}>
          <div style={{fontSize:22,fontWeight:600,letterSpacing:'0.2em',color:'#fff',marginBottom:8}}>ZENITH</div>
          <div style={{fontSize:10,color:'rgba(255,255,255,0.3)',letterSpacing:'0.2em'}}>AUTONOMOUS INTELLIGENCE OS</div>
        </div>
        <div style={{width:'100%',maxWidth:500}}>
          <div style={{textAlign:'center',marginBottom:32}}>
            <div style={{fontSize:18,fontWeight:600,color:'#fff',marginBottom:8}}>Download ZENITH Desktop</div>
            <div style={{fontSize:10,color:'rgba(255,255,255,0.35)',letterSpacing:'0.1em'}}>AI Operating Companion untuk komputer kamu</div>
          </div>
          <div style={{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(77,123,255,0.15)',borderRadius:16,padding:24,marginBottom:16}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <span style={{fontSize:28}}>🍎</span>
                <div>
                  <div style={{fontSize:12,color:'#fff',fontWeight:500}}>Mac</div>
                  <div style={{fontSize:9,color:'rgba(255,255,255,0.3)'}}>Apple Silicon (M1/M2/M3)</div>
                </div>
              </div>
              <div style={{fontSize:9,color:'rgba(77,123,255,0.5)'}}>v1.0.0</div>
            </div>
            <a href={DMG_URL} style={{display:'block',width:'100%',padding:'12px 0',background:'rgba(77,123,255,0.1)',border:'1px solid rgba(77,123,255,0.2)',borderRadius:8,color:'#4c7bff',fontFamily:'JetBrains Mono,monospace',fontSize:10,letterSpacing:'0.15em',textAlign:'center',textDecoration:'none'}}>
              ↓ DOWNLOAD .DMG
            </a>
            <div style={{fontSize:8,color:'rgba(255,255,255,0.2)',textAlign:'center',marginTop:8}}>~110 MB · macOS 11+</div>
          </div>
          <div style={{background:'rgba(255,255,255,0.01)',border:'1px solid rgba(255,255,255,0.05)',borderRadius:16,padding:24,marginBottom:32,opacity:0.5}}>
            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16}}>
              <span style={{fontSize:28}}>🪟</span>
              <div>
                <div style={{fontSize:12,color:'#fff',fontWeight:500}}>Windows</div>
                <div style={{fontSize:9,color:'rgba(255,255,255,0.3)'}}>Windows 10/11 — Coming Soon</div>
              </div>
            </div>
            <div style={{padding:'12px 0',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.05)',borderRadius:8,color:'rgba(255,255,255,0.2)',fontFamily:'JetBrains Mono,monospace',fontSize:10,textAlign:'center'}}>COMING SOON</div>
          </div>
          <div style={{background:'rgba(77,123,255,0.03)',border:'1px solid rgba(77,123,255,0.08)',borderRadius:12,padding:20,marginBottom:24}}>
            <div style={{fontSize:9,color:'rgba(77,123,255,0.5)',letterSpacing:'0.15em',marginBottom:12}}>CARA INSTALL MAC</div>
            {['1. Download file .DMG di atas','2. Buka file DMG yang ter-download','3. Drag ZENITH ke folder Applications','4. Buka ZENITH dari Applications','5. Klik Allow jika ada notifikasi izin'].map((step,i)=>(
              <div key={i} style={{fontSize:9,color:'rgba(255,255,255,0.4)',marginBottom:6}}>{step}</div>
            ))}
          </div>
          <div style={{display:'flex',gap:12,justifyContent:'center'}}>
            <button onClick={()=>router.push('/')} style={{background:'none',border:'none',color:'rgba(255,255,255,0.2)',fontFamily:'JetBrains Mono,monospace',fontSize:9,cursor:'pointer'}}>← KEMBALI</button>
            <a href='/privacy' style={{color:'rgba(77,123,255,0.2)',textDecoration:'none',fontSize:9}}>PRIVACY</a>
            <a href='/terms' style={{color:'rgba(77,123,255,0.2)',textDecoration:'none',fontSize:9}}>TERMS</a>
          </div>
        </div>
        <div style={{marginTop:32,fontSize:8,color:'rgba(255,255,255,0.1)',letterSpacing:'0.1em'}}>©️ ZENITH AI 2026 · AUTONOMOUS INTELLIGENCE OS</div>
      </div>
    </>
  )
}
