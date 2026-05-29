'use client'
import { useEffect, useState } from 'react'

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [typed, setTyped] = useState('')
  const [cmdIdx, setCmdIdx] = useState(0)
  const commands = ['buka VS Code', 'ada email penting?', 'putar lagu favorit', 'balas email dari Budi']

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  useEffect(() => {
    const fn = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    let cancelled = false
    const cmd = commands[cmdIdx]
    let i = 0; let erasing = false
    const tick = () => {
      if (cancelled) return
      if (!erasing) {
        if (i <= cmd.length) { setTyped(cmd.slice(0, i++)); setTimeout(tick, 68) }
        else { erasing = true; setTimeout(tick, 2000) }
      } else {
        if (i > 0) { setTyped(cmd.slice(0, --i)); setTimeout(tick, 36) }
        else { setTimeout(() => setCmdIdx(p => (p + 1) % commands.length), 300) }
      }
    }
    tick()
    return () => { cancelled = true }
  }, [cmdIdx])

  const features = [
    ['Kontrol suara penuh', 'Buka aplikasi, cari info, kelola file — semua dengan suara tanpa sentuh keyboard.'],
    ['Gmail terintegrasi', 'Baca, ringkas, dan balas email tanpa menyentuh keyboard sama sekali.'],
    ['Dashboard multi-panel', 'Kelola hingga 4 tab browser sekaligus dalam satu layar Jarvis-style.'],
    ['Mac & Windows native', 'Berjalan di semua platform desktop modern dengan auto-update otomatis.'],
    ['Respons real-time', 'Tidak ada delay. Perintah dieksekusi dalam hitungan milidetik.'],
    ['Memori kontekstual', 'ZENITH mengingat preferensi dan gaya kerja Anda dari waktu ke waktu.'],
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=JetBrains+Mono:wght@300;400&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;}
        html{scroll-behavior:smooth;}
        body{background:#0d0d12;color:#e8e8f0;font-family:'Inter',system-ui,sans-serif;overflow-x:hidden;-webkit-font-smoothing:antialiased;}
        @keyframes shimmer{0%{background-position:0%}100%{background-position:200%}}
        @keyframes floatcard{0%,100%{transform:translateY(0) rotate(-1deg)}50%{transform:translateY(-10px) rotate(-1deg)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes fadeup{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
        @keyframes breathe{0%,100%{box-shadow:0 0 36px 8px rgba(99,102,241,0.14)}50%{box-shadow:0 0 64px 18px rgba(99,102,241,0.28)}}
        @keyframes pulse{0%,100%{opacity:0.55}50%{opacity:1}}
        .navlink{font-size:13px;color:rgba(232,232,240,0.4);text-decoration:none;transition:color .15s;}
        .navlink:hover{color:rgba(232,232,240,0.88);}
        .frow{padding:24px 14px;border-bottom:1px solid rgba(255,255,255,0.042);display:grid;grid-template-columns:200px 1fr;gap:40px;border-radius:8px;transition:background .2s;cursor:default;}
        .frow:first-child{border-top:1px solid rgba(255,255,255,0.042);}
        .frow:hover{background:rgba(255,255,255,0.018);}
        .ctap{padding:11px 24px;background:#fff;border-radius:7px;color:#0d0d12;font-size:13px;font-weight:600;text-decoration:none;transition:all .18s;display:inline-block;letter-spacing:-.01em;}
        .ctap:hover{background:rgba(255,255,255,0.88);transform:translateY(-1px);}
        .ctag{padding:11px 24px;background:transparent;border:1px solid rgba(255,255,255,0.1);border-radius:7px;color:rgba(232,232,240,0.55);font-size:13px;text-decoration:none;transition:all .18s;display:inline-block;letter-spacing:-.01em;}
        .ctag:hover{border-color:rgba(255,255,255,0.22);color:#e8e8f0;}
        .dlrow{padding:16px 20px;background:rgba(255,255,255,0.028);border:1px solid rgba(255,255,255,0.06);border-radius:11px;color:#e8e8f0;text-decoration:none;display:flex;align-items:center;gap:14px;transition:all .2s;}
        .dlrow:hover{background:rgba(255,255,255,0.06);border-color:rgba(255,255,255,0.12);transform:translateX(4px);}
        .fl{font-size:12px;color:rgba(232,232,240,0.22);text-decoration:none;transition:color .15s;}
        .fl:hover{color:rgba(232,232,240,0.6);}
        .div{height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent);margin:0 48px;}
        .label{font-size:10px;color:rgba(99,102,241,0.55);font-family:'JetBrains Mono',monospace;letter-spacing:.16em;margin-bottom:20px;}
      `}</style>

      <div style={{position:'fixed',inset:0,zIndex:0,pointerEvents:'none',overflow:'hidden'}}>
        <div style={{position:'absolute',top:'-20%',left:'-5%',width:'60%',height:'70%',background:'radial-gradient(ellipse,rgba(99,102,241,0.055),transparent 65%)',filter:'blur(60px)'}}/>
        <div style={{position:'absolute',bottom:'-15%',right:'-10%',width:'50%',height:'60%',background:'radial-gradient(ellipse,rgba(139,92,246,0.04),transparent 65%)',filter:'blur(60px)'}}/>
        <div style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(255,255,255,0.01) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.01) 1px,transparent 1px)',backgroundSize:'88px 88px'}}/>
      </div>

      <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:100,height:58,display:'flex',alignItems:'center',justifyContent:'space-between',padding:isMobile?'0 20px':'0 48px',background:scrollY>40?'rgba(13,13,18,0.82)':'transparent',backdropFilter:scrollY>40?'blur(24px)':'none',borderBottom:scrollY>40?'1px solid rgba(255,255,255,0.048)':'none',transition:'all .3s'}}>
        <div style={{display:'flex',alignItems:'center',gap:9}}>
          <svg viewBox="0 0 200 200" width="24" height="24" style={{filter:'drop-shadow(0 0 8px rgba(99,102,241,0.5))'}}>
            <defs>
              <radialGradient id="o1" cx="50%" cy="50%" r="60%"><stop offset="40%" stopColor="#6366f1" stopOpacity="0"/><stop offset="58%" stopColor="#6366f1" stopOpacity="0.9"/><stop offset="70%" stopColor="#6366f1" stopOpacity="0"/></radialGradient>
              <radialGradient id="o2" cx="35%" cy="25%" r="80%"><stop offset="0%" stopColor="#1e2060"/><stop offset="100%" stopColor="#06060f"/></radialGradient>
            </defs>
            <circle cx="100" cy="100" r="100" fill="url(#o2)"/>
            <circle cx="100" cy="100" r="72" fill="url(#o1)"/>
            <circle cx="100" cy="100" r="68" fill="none" stroke="rgba(99,102,241,0.8)" strokeWidth="2"/>
            <circle cx="100" cy="100" r="58" fill="#06060f"/>
            <circle cx="78" cy="76" r="4" fill="rgba(255,255,255,0.8)"/>
          </svg>
          <span style={{fontWeight:700,fontSize:15,letterSpacing:'-.01em',color:'#fff'}}>ZENITH</span>
        </div>
        <div style={{display:isMobile?'none':'flex',gap:32,alignItems:'center'}}>
          {[['Fitur','#fitur'],['Harga','#harga'],['Download','#download']].map(([l,h])=>(<a key={l} href={h} className="navlink">{l}</a>))}
          <a href="/login" style={{padding:'7px 17px',background:'rgba(255,255,255,0.055)',border:'1px solid rgba(255,255,255,0.09)',borderRadius:6,color:'rgba(232,232,240,0.75)',fontSize:13,textDecoration:'none',letterSpacing:'-.01em'}}>Masuk</a>
        </div>
      </nav>

      <section style={{position:'relative',zIndex:1,minHeight:'100vh',display:'grid',gridTemplateColumns:isMobile?'1fr':'1fr 1fr',alignItems:'center',padding:isMobile?'90px 20px 50px':'110px 48px 80px',maxWidth:1280,margin:'0 auto',gap:isMobile?32:64}}>
        <div style={{animation:'fadeup .65s ease both'}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:8,padding:'5px 14px',background:'rgba(99,102,241,0.07)',border:'1px solid rgba(99,102,241,0.18)',borderRadius:100,marginBottom:40}}>
            <span style={{width:5,height:5,borderRadius:'50%',background:'#4ade80',boxShadow:'0 0 8px rgba(74,222,128,0.6)',display:'inline-block',animation:'pulse 2s ease infinite'}}/>
            <span style={{fontSize:11,color:'rgba(232,232,240,0.48)',fontFamily:'JetBrains Mono,monospace',letterSpacing:'.08em'}}>v1.0.1 — Mac & Windows</span>
          </div>
          <h1 style={{fontSize:isMobile?38:80,fontWeight:900,lineHeight:.95,letterSpacing:'-.045em',marginBottom:30,color:'#fff',fontStyle:'italic'}}>
            Asisten AI<br/>
            yang <span style={{background:'linear-gradient(135deg,#c7d2fe 0%,#818cf8 45%,#a78bfa 100%)',backgroundSize:'200%',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',animation:'shimmer 5s linear infinite',fontStyle:'normal'}}>benar-benar</span><br/>
            bekerja.
          </h1>
          <p style={{fontSize:16,color:'rgba(232,232,240,0.38)',lineHeight:1.72,marginBottom:44,maxWidth:isMobile?'100%':420,fontWeight:400,letterSpacing:'-.01em'}}>Ucapkan perintah — ZENITH membuka aplikasi, membaca email, mencari informasi, dan mengelola hari Anda. Tanpa klik, tanpa ketik.</p>
          <div style={{display:'flex',gap:10,alignItems:'center',marginBottom:isMobile?28:52,flexWrap:'wrap'}}>
            <a href="/login" className="ctap">Coba gratis 3 hari</a>
            <a href="/download" className="ctag">Download app ↓</a>
          </div>
          <div style={{display:'flex',gap:isMobile?20:36,flexWrap:'wrap'}}>
            {[['< 0.3s','waktu respons'],['Mac & Win','cross-platform'],['3 hari','trial gratis']].map(([n,l])=>(
              <div key={l}><div style={{fontSize:18,fontWeight:700,color:'#fff',letterSpacing:'-.03em'}}>{n}</div><div style={{fontSize:11,color:'rgba(232,232,240,0.24)',marginTop:3}}>{l}</div></div>
            ))}
          </div>
        </div>

        <div style={{animation:'fadeup .65s .12s ease both',position:'relative',display:isMobile?'none':'block'}}>
          <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:360,height:360,background:'radial-gradient(circle,rgba(99,102,241,0.09),transparent 70%)',filter:'blur(50px)',pointerEvents:'none'}}/>
          <div style={{background:'rgba(14,14,20,0.94)',border:'1px solid rgba(255,255,255,0.065)',borderRadius:20,overflow:'hidden',backdropFilter:'blur(30px)',boxShadow:'0 48px 120px rgba(0,0,0,0.7),0 0 0 1px rgba(255,255,255,0.03)',animation:'floatcard 6s ease-in-out infinite'}}>
            <div style={{display:'flex',alignItems:'center',gap:6,padding:'13px 18px',borderBottom:'1px solid rgba(255,255,255,0.048)',background:'rgba(255,255,255,0.016)'}}>
              {['#ff5f57','#febc2e','#28c840'].map(c=>(<div key={c} style={{width:10,height:10,borderRadius:'50%',background:c}}/>))}
              <span style={{marginLeft:8,fontSize:10,color:'rgba(255,255,255,0.18)',fontFamily:'JetBrains Mono,monospace',letterSpacing:'.1em'}}>ZENITH AI · ACTIVE</span>
            </div>
            <div style={{padding:28}}>
              <div style={{display:'flex',justifyContent:'center',marginBottom:26}}>
                <div style={{width:88,height:88,borderRadius:'50%',background:'radial-gradient(circle at 32% 28%,#1e3060,#0a1230 40%,#050814)',border:'1px solid rgba(99,102,241,0.45)',animation:'breathe 3.5s ease-in-out infinite',position:'relative'}}>
                  <div style={{position:'absolute',width:5,height:5,borderRadius:'50%',background:'rgba(255,255,255,0.82)',top:'27%',left:'25%',boxShadow:'0 0 9px rgba(255,255,255,0.6)'}}/>
                  <div style={{position:'absolute',inset:0,borderRadius:'50%',background:'radial-gradient(circle at 30% 24%,rgba(255,255,255,0.07),transparent 50%)'}}/>
                </div>
              </div>
              <div style={{background:'rgba(255,255,255,0.036)',border:'1px solid rgba(255,255,255,0.065)',borderRadius:11,padding:'13px 15px',marginBottom:12}}>
                <div style={{fontSize:9,color:'rgba(232,232,240,0.22)',fontFamily:'JetBrains Mono,monospace',letterSpacing:'.12em',marginBottom:9}}>PERINTAH SUARA</div>
                <div style={{fontSize:14,color:'#e8e8f0',fontFamily:'JetBrains Mono,monospace',minHeight:21,display:'flex',alignItems:'center',gap:2}}>
                  <span style={{color:'rgba(232,232,240,0.3)'}}>❝</span>
                  <span style={{margin:'0 4px'}}>{typed}</span>
                  <span style={{width:2,height:15,background:'#818cf8',borderRadius:1,animation:'blink 1s step-end infinite',display:'inline-block'}}/>
                  <span style={{color:'rgba(232,232,240,0.3)'}}>❞</span>
                </div>
              </div>
              <div style={{background:'rgba(99,102,241,0.055)',border:'1px solid rgba(99,102,241,0.14)',borderRadius:11,padding:'13px 15px',marginBottom:18}}>
                <div style={{fontSize:9,color:'rgba(99,102,241,0.5)',fontFamily:'JetBrains Mono,monospace',letterSpacing:'.12em',marginBottom:8}}>ZENITH</div>
                <div style={{fontSize:13,color:'rgba(232,232,240,0.55)',lineHeight:1.65,fontWeight:300}}>Memproses perintah Anda sekarang...</div>
              </div>
              <div style={{display:'flex',gap:6}}>
                {['Gmail','VS Code','Spotify','Chrome'].map(t=>(<div key={t} style={{padding:'4px 10px',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.055)',borderRadius:100,fontSize:10,color:'rgba(232,232,240,0.26)',fontFamily:'JetBrains Mono,monospace'}}>{t}</div>))}
              </div>
            </div>
          </div>
          <div style={{position:'absolute',top:-18,right:-18,background:'rgba(14,14,20,0.95)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:12,padding:'11px 18px',backdropFilter:'blur(20px)',boxShadow:'0 8px 32px rgba(0,0,0,0.5)'}}>
            <div style={{fontSize:9,color:'rgba(232,232,240,0.25)',fontFamily:'JetBrains Mono,monospace',marginBottom:4,letterSpacing:'.1em'}}>RESPONS</div>
            <div style={{fontSize:20,fontWeight:800,color:'#fff',letterSpacing:'-.04em'}}>0.3s</div>
          </div>
          <div style={{position:'absolute',bottom:-18,left:-18,background:'rgba(14,14,20,0.95)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:12,padding:'11px 18px',backdropFilter:'blur(20px)',boxShadow:'0 8px 32px rgba(0,0,0,0.5)'}}>
            <div style={{fontSize:9,color:'rgba(232,232,240,0.25)',fontFamily:'JetBrains Mono,monospace',marginBottom:4,letterSpacing:'.1em'}}>PLATFORM</div>
            <div style={{fontSize:13,fontWeight:600,color:'#fff',letterSpacing:'-.01em'}}> Mac  🪟 Windows</div>
          </div>
        </div>
      </section>

      <div className="div"/>

      <section id="fitur" style={{position:'relative',zIndex:1,padding:isMobile?'60px 20px':'100px 48px',maxWidth:1280,margin:'0 auto'}}>
        <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'260px 1fr',gap:isMobile?0:88,alignItems:'start'}}>
          <div style={{position:'sticky',top:80}}>
            <div className="label">Kemampuan</div>
            <h2 style={{fontSize:isMobile?26:38,fontWeight:800,color:'#fff',letterSpacing:'-.03em',lineHeight:1.08,marginBottom:18}}>Dirancang untuk produktivitas nyata.</h2>
            <p style={{fontSize:14,color:'rgba(232,232,240,0.3)',lineHeight:1.75,fontWeight:300}}>Bukan sekadar demo — ZENITH benar-benar mengerjakan pekerjaan Anda.</p>
          </div>
          <div>
            {features.map(([label,desc],i)=>(
              <div key={i} className="frow">
                <div style={{fontSize:14,fontWeight:600,color:'rgba(232,232,240,0.85)',letterSpacing:'-.01em'}}>{label}</div>
                <div style={{fontSize:14,color:'rgba(232,232,240,0.32)',fontWeight:300,lineHeight:1.68}}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="div"/>

      <section id="harga" style={{position:'relative',zIndex:1,padding:isMobile?'60px 20px':'100px 48px',maxWidth:1280,margin:'0 auto'}}>
        <div className="label">Harga</div>
        <h2 style={{fontSize:isMobile?34:56,fontWeight:900,color:'#fff',letterSpacing:'-.04em',lineHeight:.98,marginBottom:16,fontStyle:'italic'}}>Sederhana.<br/>Tidak ada kejutan.</h2>
        <p style={{fontSize:15,color:'rgba(232,232,240,0.3)',fontWeight:300,marginBottom:60}}>Mulai gratis. Upgrade kapan Anda siap.</p>
        <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'1fr 1fr',gap:16,maxWidth:760}}>
          <div style={{padding:36,background:'rgba(255,255,255,0.018)',border:'1px solid rgba(255,255,255,0.055)',borderRadius:16}}>
            <div style={{fontSize:10,color:'rgba(232,232,240,0.28)',fontFamily:'JetBrains Mono,monospace',letterSpacing:'.14em',marginBottom:24}}>TRIAL</div>
            <div style={{fontSize:isMobile?34:56,fontWeight:900,color:'#fff',letterSpacing:'-.04em',lineHeight:1,marginBottom:8}}>Gratis</div>
            <div style={{fontSize:13,color:'rgba(232,232,240,0.22)',marginBottom:36,fontWeight:300}}>Selama 3 hari pertama</div>
            <div style={{borderTop:'1px solid rgba(255,255,255,0.048)',paddingTop:28}}>
              {['10 perintah / hari','Semua fitur dasar','Mac & Windows','Tanpa kartu kredit'].map((f,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:12,marginBottom:13}}>
                  <div style={{width:16,height:16,borderRadius:'50%',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.09)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><span style={{fontSize:7,color:'rgba(255,255,255,0.45)'}}>✓</span></div>
                  <span style={{fontSize:13,color:'rgba(232,232,240,0.4)',fontWeight:300}}>{f}</span>
                </div>
              ))}
            </div>
            <a href="/login" style={{display:'block',marginTop:28,padding:'12px 0',textAlign:'center',background:'transparent',border:'1px solid rgba(255,255,255,0.09)',borderRadius:9,color:'rgba(232,232,240,0.45)',textDecoration:'none',fontSize:13,fontWeight:400}}>Mulai gratis</a>
          </div>
          <div style={{padding:36,background:'rgba(99,102,241,0.055)',border:'1px solid rgba(99,102,241,0.2)',borderRadius:16,position:'relative'}}>
            <div style={{position:'absolute',top:18,right:18,padding:'3px 11px',background:'rgba(99,102,241,0.18)',border:'1px solid rgba(99,102,241,0.28)',borderRadius:100,fontSize:9,color:'rgba(165,180,252,0.85)',fontFamily:'JetBrains Mono,monospace',letterSpacing:'.1em'}}>POPULER</div>
            <div style={{fontSize:10,color:'rgba(99,102,241,0.55)',fontFamily:'JetBrains Mono,monospace',letterSpacing:'.14em',marginBottom:24}}>PREMIUM</div>
            <div style={{display:'flex',alignItems:'baseline',gap:8,marginBottom:8}}>
              <div style={{fontSize:isMobile?34:56,fontWeight:900,color:'#fff',letterSpacing:'-.04em',lineHeight:1}}>130rb</div>
              <div style={{fontSize:13,color:'rgba(232,232,240,0.28)',fontWeight:300}}>/bln</div>
            </div>
            <div style={{fontSize:13,color:'rgba(232,232,240,0.22)',marginBottom:36,fontWeight:300}}>Batalkan kapan saja</div>
            <div style={{borderTop:'1px solid rgba(99,102,241,0.1)',paddingTop:28}}>
              {['20 perintah / hari','Gmail terintegrasi','Jarvis multi-panel','Buka aplikasi lokal','Auto update','Prioritas support'].map((f,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:12,marginBottom:13}}>
                  <div style={{width:16,height:16,borderRadius:'50%',background:'rgba(99,102,241,0.15)',border:'1px solid rgba(99,102,241,0.28)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><span style={{fontSize:7,color:'#a5b4fc'}}>✓</span></div>
                  <span style={{fontSize:13,color:'rgba(232,232,240,0.6)',fontWeight:300}}>{f}</span>
                </div>
              ))}
            </div>
            <a href="/upgrade" style={{display:'block',marginTop:28,padding:'12px 0',textAlign:'center',background:'#fff',borderRadius:9,color:'#0d0d12',textDecoration:'none',fontSize:13,fontWeight:600}}>Upgrade sekarang</a>
          </div>
        </div>
      </section>

      <div className="div"/>

      <section id="download" style={{position:'relative',zIndex:1,padding:isMobile?'60px 20px':'100px 48px',maxWidth:1280,margin:'0 auto'}}>
        <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'1fr 1fr',gap:isMobile?32:80,alignItems:'center'}}>
          <div>
            <div className="label">Download</div>
            <h2 style={{fontSize:isMobile?32:52,fontWeight:900,color:'#fff',letterSpacing:'-.04em',lineHeight:.98,marginBottom:20,fontStyle:'italic'}}>Mulai hari ini,<br/>bukan besok.</h2>
            <p style={{fontSize:15,color:'rgba(232,232,240,0.3)',fontWeight:300,lineHeight:1.72,maxWidth:320}}>Install dalam 30 detik. Trial 3 hari gratis langsung aktif, tanpa kartu kredit.</p>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <a href="/download" className="dlrow">
              <span style={{fontSize:26,lineHeight:1,flexShrink:0}}></span>
              <div><div style={{fontSize:11,color:'rgba(232,232,240,0.28)',marginBottom:4,fontWeight:300}}>Download untuk</div><div style={{fontSize:15,fontWeight:600,letterSpacing:'-.02em'}}>macOS Apple Silicon</div><div style={{fontSize:10,color:'rgba(232,232,240,0.18)',marginTop:3,fontFamily:'JetBrains Mono,monospace'}}>DMG · v1.0.1 · Gratis</div></div>
            </a>
            <a href="/download" className="dlrow">
              <span style={{fontSize:26,lineHeight:1,flexShrink:0}}>🪟</span>
              <div><div style={{fontSize:11,color:'rgba(232,232,240,0.28)',marginBottom:4,fontWeight:300}}>Download untuk</div><div style={{fontSize:15,fontWeight:600,letterSpacing:'-.02em'}}>Windows x64</div><div style={{fontSize:10,color:'rgba(232,232,240,0.18)',marginTop:3,fontFamily:'JetBrains Mono,monospace'}}>EXE · v1.0.1 · Gratis</div></div>
            </a>
          </div>
        </div>
      </section>

      <footer style={{position:'relative',zIndex:1,borderTop:'1px solid rgba(255,255,255,0.048)',padding:isMobile?'28px 20px':'36px 48px',maxWidth:1280,margin:'0 auto',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:20}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <svg viewBox="0 0 200 200" width="18" height="18"><defs><radialGradient id="fo" cx="35%" cy="25%" r="80%"><stop offset="0%" stopColor="#1e2060"/><stop offset="100%" stopColor="#06060f"/></radialGradient></defs><circle cx="100" cy="100" r="100" fill="url(#fo)"/><circle cx="100" cy="100" r="68" fill="none" stroke="rgba(99,102,241,0.45)" strokeWidth="2"/><circle cx="100" cy="100" r="58" fill="#06060f"/><circle cx="78" cy="76" r="4" fill="rgba(255,255,255,0.7)"/></svg>
          <span style={{fontWeight:700,fontSize:13,letterSpacing:'-.01em',color:'rgba(232,232,240,0.38)'}}>ZENITH</span>
          <span style={{fontSize:12,color:'rgba(232,232,240,0.13)',marginLeft:6}}>© 2026 OrionAI</span>
        </div>
        <div style={{display:'flex',gap:28,flexWrap:'wrap'}}>
          {[['Privacy','/privacy'],['Terms','/terms'],['Refund','/refund'],['Contact','/contact']].map(([l,h])=>(<a key={l} href={h} className="fl">{l}</a>))}
        </div>
      </footer>
    </>
  )
}
