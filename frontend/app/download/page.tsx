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
        @keyframes fadeIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmer{0%{background-position:0%}100%{background-position:200%}}
        @keyframes pulse{0%,100%{opacity:0.4}50%{opacity:1}}
        .dl-btn{transition:all 0.25s ease!important;}
        .dl-btn:hover{background:rgba(77,123,255,0.18)!important;border-color:rgba(77,123,255,0.5)!important;transform:translateY(-1px);box-shadow:0 8px 32px rgba(77,123,255,0.15)!important;}
      `}</style>

      <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#020610 0%,#050814 50%,#030a1a 100%)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'40px 24px',fontFamily:'JetBrains Mono,monospace',position:'relative',overflow:'hidden'}}>
        
        {/* Background glow */}
        <div style={{position:'absolute',top:'20%',left:'50%',transform:'translateX(-50%)',width:600,height:600,background:'radial-gradient(circle,rgba(77,123,255,0.04) 0%,transparent 70%)',pointerEvents:'none'}}/>

        {/* Logo */}
        <div style={{textAlign:'center',marginBottom:56,animation:'fadeIn 0.5s ease'}}>
          <svg viewBox="0 0 200 200" width="72" height="72" style={{filter:'drop-shadow(0 0 24px rgba(77,123,255,0.5))',marginBottom:20}}>
            <defs>
              <radialGradient id="g1" cx="50%" cy="50%" r="60%">
                <stop offset="40%" stopColor="#4c7bff" stopOpacity="0"/>
                <stop offset="58%" stopColor="#4c7bff" stopOpacity="0.9"/>
                <stop offset="70%" stopColor="#4c7bff" stopOpacity="0"/>
              </radialGradient>
              <radialGradient id="g2" cx="35%" cy="25%" r="80%">
                <stop offset="0%" stopColor="#1a2347"/>
                <stop offset="100%" stopColor="#050814"/>
              </radialGradient>
            </defs>
            <circle cx="100" cy="100" r="100" fill="url(#g2)"/>
            <circle cx="100" cy="100" r="72" fill="url(#g1)"/>
            <circle cx="100" cy="100" r="68" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1"/>
            <circle cx="100" cy="100" r="58" fill="#080d1a"/>
            <circle cx="78" cy="76" r="3.5" fill="rgba(255,255,255,0.85)"/>
          </svg>
          <div style={{fontSize:20,fontWeight:600,letterSpacing:'0.25em',background:'linear-gradient(90deg,#fff 0%,rgba(77,123,255,0.9) 50%,#fff 100%)',backgroundSize:'200%',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',animation:'shimmer 5s linear infinite',marginBottom:6}}>ZENITH</div>
          <div style={{fontSize:9,color:'rgba(255,255,255,0.25)',letterSpacing:'0.22em'}}>AUTONOMOUS INTELLIGENCE OS</div>
        </div>

        {/* Content */}
        <div style={{width:'100%',maxWidth:480,animation:'fadeIn 0.6s ease'}}>
          <div style={{textAlign:'center',marginBottom:36}}>
            <div style={{fontSize:16,fontWeight:600,color:'rgba(255,255,255,0.9)',marginBottom:6,letterSpacing:'0.05em'}}>Download Desktop App</div>
            <div style={{fontSize:9,color:'rgba(255,255,255,0.25)',letterSpacing:'0.12em'}}>ZENITH AI · V1.0.0</div>
          </div>

          {/* Mac Card */}
          <div style={{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(77,123,255,0.2)',borderRadius:16,padding:28,marginBottom:12,backdropFilter:'blur(10px)'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
              <div style={{display:'flex',alignItems:'center',gap:14}}>
                {/* Mac SVG Icon */}
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.1 22C7.78 22.05 6.8 20.68 5.96 19.47C4.25 17 2.94 12.45 4.7 9.39C5.57 7.87 7.13 6.91 8.82 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z" fill="rgba(255,255,255,0.7)"/>
                </svg>
                <div>
                  <div style={{fontSize:13,color:'rgba(255,255,255,0.9)',fontWeight:500,letterSpacing:'0.06em',marginBottom:3}}>macOS</div>
                  <div style={{fontSize:8,color:'rgba(255,255,255,0.3)',letterSpacing:'0.08em'}}>Apple Silicon · M1 / M2 / M3</div>
                </div>
              </div>
              <div style={{padding:'4px 10px',background:'rgba(77,123,255,0.1)',border:'1px solid rgba(77,123,255,0.2)',borderRadius:20,fontSize:8,color:'rgba(77,123,255,0.7)',letterSpacing:'0.1em'}}>AVAILABLE</div>
            </div>
            <a href={DMG_URL} className="dl-btn" style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,width:'100%',padding:'13px 0',background:'rgba(77,123,255,0.08)',border:'1px solid rgba(77,123,255,0.25)',borderRadius:10,color:'#6b9fff',fontFamily:'JetBrains Mono,monospace',fontSize:9,letterSpacing:'0.18em',textDecoration:'none',boxShadow:'0 0 20px rgba(77,123,255,0.05)'}}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
              DOWNLOAD .DMG
            </a>
            <div style={{fontSize:7,color:'rgba(255,255,255,0.15)',textAlign:'center',marginTop:10,letterSpacing:'0.1em'}}>110 MB · macOS 11 Big Sur keatas</div>
          </div>

          {/* Windows Card */}
          <div style={{background:'rgba(255,255,255,0.01)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:16,padding:28,marginBottom:32}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
              <div style={{display:'flex',alignItems:'center',gap:14}}>
                {/* Windows SVG Icon */}
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M3 5.557L10.373 4.5V11.5H3V5.557ZM3 18.443L10.373 19.5V12.5H3V18.443ZM11.373 19.645L21 21V12.5H11.373V19.645ZM11.373 4.355V11.5H21V3L11.373 4.355Z" fill="rgba(255,255,255,0.25)"/>
                </svg>
                <div>
                  <div style={{fontSize:13,color:'rgba(255,255,255,0.4)',fontWeight:500,letterSpacing:'0.06em',marginBottom:3}}>Windows</div>
                  <div style={{fontSize:8,color:'rgba(255,255,255,0.2)',letterSpacing:'0.08em'}}>Windows 10 / 11</div>
                </div>
              </div>
              <div style={{padding:'4px 10px',background:'rgba(255,165,0,0.06)',border:'1px solid rgba(255,165,0,0.15)',borderRadius:20,fontSize:8,color:'rgba(255,165,0,0.5)',letterSpacing:'0.1em'}}>SOON</div>
            </div>
            <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,width:'100%',padding:'13px 0',background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.05)',borderRadius:10,color:'rgba(255,255,255,0.15)',fontFamily:'JetBrains Mono,monospace',fontSize:9,letterSpacing:'0.18em'}}>
              COMING SOON
            </div>
          </div>

          {/* Install Guide */}
          <div style={{background:'rgba(77,123,255,0.02)',border:'1px solid rgba(77,123,255,0.07)',borderRadius:12,padding:20,marginBottom:28}}>
            <div style={{fontSize:8,color:'rgba(77,123,255,0.4)',letterSpacing:'0.18em',marginBottom:14}}>CARA INSTALL</div>
            {['Download file .DMG','Buka file yang ter-download','Drag ZENITH → Applications','Buka dari Launchpad atau Spotlight','Izinkan akses saat diminta'].map((step,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
                <div style={{width:16,height:16,borderRadius:'50%',background:'rgba(77,123,255,0.1)',border:'1px solid rgba(77,123,255,0.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:7,color:'rgba(77,123,255,0.6)',flexShrink:0}}>{i+1}</div>
                <div style={{fontSize:8,color:'rgba(255,255,255,0.35)',letterSpacing:'0.05em'}}>{step}</div>
              </div>
            ))}
          </div>

          <div style={{display:'flex',gap:16,justifyContent:'center',alignItems:'center'}}>
            <button onClick={()=>router.push('/')} style={{background:'none',border:'none',color:'rgba(255,255,255,0.2)',fontFamily:'JetBrains Mono,monospace',fontSize:8,letterSpacing:'0.1em',cursor:'pointer'}}>← KEMBALI</button>
            <span style={{color:'rgba(255,255,255,0.08)'}}>·</span>
            <a href='/privacy' style={{color:'rgba(77,123,255,0.2)',textDecoration:'none',fontSize:8,letterSpacing:'0.08em'}}>PRIVACY</a>
            <span style={{color:'rgba(255,255,255,0.08)'}}>·</span>
            <a href='/terms' style={{color:'rgba(77,123,255,0.2)',textDecoration:'none',fontSize:8,letterSpacing:'0.08em'}}>TERMS</a>
          </div>
        </div>

        <div style={{marginTop:40,fontSize:7,color:'rgba(255,255,255,0.08)',letterSpacing:'0.12em'}}>©️ ZENITH AI 2026</div>
      </div>
    </>
  )
}
