'use client'
import { useEffect, useRef, useState } from 'react'

export default function LandingPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)
    const stars = Array.from({ length: 280 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.8 + 0.2,
      op: Math.random() * 0.7 + 0.1,
      speed: Math.random() * 0.12 + 0.02,
      phase: Math.random() * Math.PI * 2,
    }))
    let id: number; let f = 0
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      f++
      stars.forEach(s => {
        const op = s.op * (0.6 + 0.4 * Math.sin(f * 0.015 + s.phase))
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${op})`
        ctx.fill()
        if (s.r > 1.3) {
          ctx.strokeStyle = `rgba(200,220,255,${op * 0.35})`
          ctx.lineWidth = 0.5
          ctx.beginPath()
          ctx.moveTo(s.x - s.r * 2.5, s.y); ctx.lineTo(s.x + s.r * 2.5, s.y)
          ctx.moveTo(s.x, s.y - s.r * 2.5); ctx.lineTo(s.x, s.y + s.r * 2.5)
          ctx.stroke()
        }
      })
      id = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(id); window.removeEventListener('resize', resize) }
  }, [])

  useEffect(() => {
    const fn = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const features = [
    { icon: '🎙️', title: 'Suara = Perintah', desc: 'Tidak perlu keyboard. Ucapkan perintah, ZENITH langsung bertindak secara instan.', c: '#4c7bff' },
    { icon: '📧', title: 'Kelola Email', desc: 'Baca, ringkas, dan balas email Gmail hanya dengan suara Anda tanpa membuka browser.', c: '#8b5cf6' },
    { icon: '🚀', title: 'Buka Aplikasi', desc: 'VS Code, Excel, Spotify — semua terbuka hanya dengan satu kata perintah.', c: '#06b6d4' },
    { icon: '🪟', title: 'Jarvis Dashboard', desc: 'Multi-panel seperti Jarvis Iron Man. Kelola hingga 4 tab browser sekaligus.', c: '#4c7bff' },
    { icon: '🔍', title: 'Cari Informasi', desc: 'Tanya apa saja di dunia, ZENITH carikan dan bacakan jawabannya untuk Anda.', c: '#8b5cf6' },
    { icon: '💻', title: 'Mac & Windows', desc: 'Satu ekosistem cerdas yang berjalan di semua platform desktop modern.', c: '#06b6d4' },
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@300;400;600;700&family=JetBrains+Mono:wght@300;400;500&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;}
        html{scroll-behavior:smooth;}
        body{background:#030308;color:#e2e8f0;font-family:'JetBrains Mono',monospace;overflow-x:hidden;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-track{background:#030308;}
        ::-webkit-scrollbar-thumb{background:rgba(76,123,255,0.4);border-radius:2px;}

        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-18px)}}
        @keyframes orb-pulse{0%,100%{box-shadow:0 0 80px 20px rgba(76,123,255,0.2),0 0 160px 40px rgba(76,123,255,0.08),inset 0 0 60px rgba(76,123,255,0.08)}50%{box-shadow:0 0 120px 40px rgba(76,123,255,0.35),0 0 240px 80px rgba(76,123,255,0.12),inset 0 0 80px rgba(76,123,255,0.15)}}
        @keyframes ring-a{from{transform:rotateX(78deg) rotateZ(0deg)}to{transform:rotateX(78deg) rotateZ(360deg)}}
        @keyframes ring-b{from{transform:rotateX(55deg) rotateY(25deg) rotateZ(0deg)}to{transform:rotateX(55deg) rotateY(25deg) rotateZ(-360deg)}}
        @keyframes ring-c{from{transform:rotateX(25deg) rotateY(65deg) rotateZ(0deg)}to{transform:rotateX(25deg) rotateY(65deg) rotateZ(360deg)}}
        @keyframes ring-d{from{transform:rotateX(10deg) rotateY(80deg) rotateZ(0deg)}to{transform:rotateX(10deg) rotateY(80deg) rotateZ(-360deg)}}
        @keyframes shimmer{0%{background-position:0%}100%{background-position:200%}}
        @keyframes scan{0%{transform:translateY(-100%)}100%{transform:translateY(110vh)}}
        @keyframes pulse-dot{0%,100%{opacity:0.5;transform:scale(1)}50%{opacity:1;transform:scale(1.3)}}
        @keyframes nebula-drift{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(20px,-15px) scale(1.05)}}

        .orb-wrap{width:400px;height:400px;position:relative;margin:0 auto;animation:float 7s ease-in-out infinite;perspective:900px;}
        .orb{width:210px;height:210px;border-radius:50%;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:radial-gradient(circle at 32% 28%,#1e3f7a 0%,#0d1f47 25%,#080d1a 55%,#030308 100%);animation:orb-pulse 4s ease-in-out infinite;}
        .orb-inner{position:absolute;inset:18px;border-radius:50%;background:radial-gradient(circle at 28% 22%,rgba(255,255,255,0.1) 0%,transparent 45%);pointer-events:none;}
        .orb-dot{position:absolute;width:5px;height:5px;border-radius:50%;background:#fff;top:30%;left:28%;box-shadow:0 0 10px rgba(255,255,255,0.9),0 0 20px rgba(200,220,255,0.5);}
        .ring{position:absolute;top:50%;left:50%;border-radius:50%;border:1px solid;}
        .ring-1{width:270px;height:270px;margin:-135px 0 0 -135px;border-color:rgba(76,123,255,0.55);box-shadow:0 0 8px rgba(76,123,255,0.2);animation:ring-a 5s linear infinite;}
        .ring-2{width:315px;height:315px;margin:-157px 0 0 -157px;border-color:rgba(139,92,246,0.38);animation:ring-b 8s linear infinite;}
        .ring-3{width:358px;height:358px;margin:-179px 0 0 -179px;border-color:rgba(6,182,212,0.26);animation:ring-c 11s linear infinite reverse;}
        .ring-4{width:398px;height:398px;margin:-199px 0 0 -199px;border-color:rgba(76,123,255,0.1);animation:ring-d 15s linear infinite;}
        .orb-glow{position:absolute;bottom:-50px;left:50%;transform:translateX(-50%);width:200px;height:36px;background:radial-gradient(ellipse,rgba(76,123,255,0.45),transparent 70%);filter:blur(18px);border-radius:50%;}

        .feature-card{padding:30px 26px;background:rgba(255,255,255,0.022);border:1px solid rgba(76,123,255,0.09);border-radius:18px;transition:all 0.4s cubic-bezier(0.23,1,0.32,1);cursor:default;position:relative;overflow:hidden;}
        .feature-card:hover{border-color:rgba(76,123,255,0.28);transform:translateY(-8px);background:rgba(76,123,255,0.04);box-shadow:0 24px 60px rgba(0,0,0,0.4),0 0 40px rgba(76,123,255,0.06);}

        .cta-p{padding:15px 38px;background:linear-gradient(135deg,#4c7bff,#7c3aed);border-radius:12px;color:#fff;text-decoration:none;font-size:11px;letter-spacing:0.18em;font-weight:600;box-shadow:0 8px 32px rgba(76,123,255,0.3);transition:all 0.3s;display:inline-block;}
        .cta-p:hover{transform:translateY(-3px);box-shadow:0 16px 48px rgba(76,123,255,0.5);}
        .cta-s{padding:15px 38px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.11);border-radius:12px;color:rgba(226,232,240,0.75);text-decoration:none;font-size:11px;letter-spacing:0.18em;transition:all 0.3s;display:inline-block;}
        .cta-s:hover{background:rgba(255,255,255,0.08);border-color:rgba(255,255,255,0.22);transform:translateY(-3px);}

        .nav-lnk{font-size:10px;letter-spacing:0.2em;color:rgba(226,232,240,0.38);text-decoration:none;transition:color 0.2s;}
        .nav-lnk:hover{color:#4c7bff;}
        .dl-btn{padding:18px 26px;background:rgba(255,255,255,0.035);border:1px solid rgba(255,255,255,0.09);border-radius:14px;color:#fff;text-decoration:none;display:flex;align-items:center;gap:16px;transition:all 0.3s;min-width:230px;}
        .dl-btn:hover{background:rgba(255,255,255,0.08);border-color:rgba(255,255,255,0.18);transform:translateY(-4px);box-shadow:0 16px 40px rgba(0,0,0,0.4);}
        .footer-lnk{font-size:9px;letter-spacing:0.18em;color:rgba(226,232,240,0.16);text-decoration:none;transition:color 0.2s;}
        .footer-lnk:hover{color:rgba(76,123,255,0.5);}
      `}</style>

      <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />

      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '8%', left: '12%', width: 560, height: 560, background: 'radial-gradient(circle,rgba(76,123,255,0.07),transparent 70%)', filter: 'blur(48px)', animation: 'nebula-drift 18s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', top: '45%', right: '8%', width: 440, height: 440, background: 'radial-gradient(circle,rgba(139,92,246,0.06),transparent 70%)', filter: 'blur(48px)', animation: 'nebula-drift 22s ease-in-out infinite reverse' }} />
        <div style={{ position: 'absolute', bottom: '15%', left: '35%', width: 380, height: 380, background: 'radial-gradient(circle,rgba(6,182,212,0.05),transparent 70%)', filter: 'blur(48px)', animation: 'nebula-drift 15s ease-in-out infinite' }} />
      </div>

      <div style={{ position: 'fixed', left: 0, right: 0, height: 180, background: 'linear-gradient(transparent,rgba(76,123,255,0.018),transparent)', animation: 'scan 14s linear infinite', zIndex: 0, pointerEvents: 'none' }} />

      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: 66, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 52px', background: scrollY > 60 ? 'rgba(3,3,8,0.88)' : 'transparent', backdropFilter: scrollY > 60 ? 'blur(28px)' : 'none', borderBottom: scrollY > 60 ? '1px solid rgba(76,123,255,0.07)' : 'none', transition: 'all 0.4s' }}>
        <div style={{ fontFamily: "'Chakra Petch',sans-serif", fontWeight: 700, fontSize: 17, letterSpacing: '0.38em', background: 'linear-gradient(90deg,#fff 0%,#4c7bff 50%,#8b5cf6 100%)', backgroundSize: '200%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'shimmer 6s linear infinite' }}>ZENITH</div>
        <div style={{ display: 'flex', gap: 38, alignItems: 'center' }}>
          {[['Fitur', '#fitur'], ['Harga', '#harga'], ['Download', '#download']].map(([l, h]) => (
            <a key={l} href={h} className="nav-lnk">{l.toUpperCase()}</a>
          ))}
          <a href="/login" style={{ padding: '8px 24px', background: 'rgba(76,123,255,0.12)', border: '1px solid rgba(76,123,255,0.22)', borderRadius: 8, color: '#4c7bff', textDecoration: 'none', fontSize: 9, letterSpacing: '0.22em', transition: 'all 0.2s' }}>MASUK</a>
        </div>
      </nav>

      <section style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '130px 24px 90px', textAlign: 'center' }}>
        <div className="orb-wrap" style={{ marginBottom: 64 }}>
          <div className="ring ring-4" />
          <div className="ring ring-3" />
          <div className="ring ring-2" />
          <div className="ring ring-1" />
          <div className="orb"><div className="orb-inner" /><div className="orb-dot" /></div>
          <div className="orb-glow" />
        </div>

        <div style={{ marginBottom: 28, display: 'inline-flex', alignItems: 'center', gap: 10, padding: '7px 20px', background: 'rgba(76,123,255,0.06)', border: '1px solid rgba(76,123,255,0.16)', borderRadius: 100, backdropFilter: 'blur(12px)' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 10px #4ade80', display: 'inline-block', animation: 'pulse-dot 2.5s ease infinite' }} />
          <span style={{ fontSize: 9, letterSpacing: '0.22em', color: 'rgba(76,123,255,0.75)' }}>LIVE · VERSI 1.0.1 · MAC & WINDOWS</span>
        </div>

        <h1 style={{ fontFamily: "'Chakra Petch',sans-serif", fontSize: 68, fontWeight: 700, lineHeight: 1.04, marginBottom: 26, letterSpacing: '-0.01em', maxWidth: 720 }}>
          <span style={{ display: 'block', color: '#fff' }}>Kecerdasan yang</span>
          <span style={{ display: 'block', background: 'linear-gradient(135deg,#4c7bff 0%,#8b5cf6 45%,#06b6d4 100%)', backgroundSize: '200%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'shimmer 5s linear infinite' }}>melampaui batas.</span>
        </h1>

        <p style={{ fontSize: 14, color: 'rgba(226,232,240,0.42)', maxWidth: 530, lineHeight: 1.95, marginBottom: 48 }}>
          Asisten AI personal berbasis suara untuk Mac & Windows. Cukup bicara — ZENITH membuka aplikasi, membaca email, mencari informasi, dan mengelola hari Anda.
        </p>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 22 }}>
          <a href="/login" className="cta-p">✦ COBA GRATIS 3 HARI</a>
          <a href="/download" className="cta-s">↓ DOWNLOAD APP</a>
        </div>
        <p style={{ fontSize: 9, color: 'rgba(226,232,240,0.16)', letterSpacing: '0.2em' }}>TIDAK PERLU KARTU KREDIT · TRIAL 3 HARI GRATIS</p>

        <div style={{ position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, opacity: 0.28 }}>
          <div style={{ width: 1, height: 52, background: 'linear-gradient(to bottom,transparent,#4c7bff)' }} />
          <span style={{ fontSize: 8, letterSpacing: '0.28em', color: '#4c7bff' }}>SCROLL</span>
        </div>
      </section>

      <section id="fitur" style={{ position: 'relative', zIndex: 1, padding: '110px 52px', maxWidth: 1120, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 80 }}>
          <div style={{ fontSize: 9, color: 'rgba(76,123,255,0.5)', letterSpacing: '0.38em', marginBottom: 16 }}>KEMAMPUAN</div>
          <h2 style={{ fontFamily: "'Chakra Petch',sans-serif", fontSize: 42, fontWeight: 700, color: '#fff', marginBottom: 18 }}>Apa yang bisa ZENITH lakukan?</h2>
          <p style={{ fontSize: 13, color: 'rgba(226,232,240,0.33)', maxWidth: 480, margin: '0 auto', lineHeight: 1.95 }}>Satu asisten untuk semua kebutuhan produktivitas harian Anda.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
          {features.map((f, i) => (
            <div key={i} className="feature-card">
              <div style={{ width: 52, height: 52, borderRadius: 14, background: `rgba(76,123,255,0.08)`, border: `1px solid rgba(76,123,255,0.15)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 20 }}>{f.icon}</div>
              <div style={{ fontFamily: "'Chakra Petch',sans-serif", fontSize: 14, fontWeight: 600, color: '#dce8ff', marginBottom: 12, letterSpacing: '0.04em' }}>{f.title}</div>
              <div style={{ fontSize: 12, color: 'rgba(226,232,240,0.38)', lineHeight: 1.85 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ position: 'relative', zIndex: 1, padding: '110px 52px', textAlign: 'center' }}>
        <div style={{ fontSize: 9, color: 'rgba(76,123,255,0.5)', letterSpacing: '0.38em', marginBottom: 16 }}>CARA KERJA</div>
        <h2 style={{ fontFamily: "'Chakra Petch',sans-serif", fontSize: 42, fontWeight: 700, color: '#fff', marginBottom: 80 }}>Tiga langkah mudah.</h2>
        <div style={{ display: 'flex', justifyContent: 'center', maxWidth: 920, margin: '0 auto', flexWrap: 'wrap' }}>
          {[
            { n: '01', t: 'Download & Install', d: 'Download ZENITH untuk Mac atau Windows. Install selesai dalam 30 detik.' },
            { n: '02', t: 'Login & Aktifkan', d: 'Login dengan Google. Trial 3 hari langsung aktif, tanpa kartu kredit.' },
            { n: '03', t: 'Bicara & Rasakan', d: 'Klik orb atau ucapkan perintah. ZENITH siap melayani Anda sepenuhnya.' },
          ].map((s, i) => (
            <div key={i} style={{ flex: 1, minWidth: 220, padding: '0 36px', position: 'relative' }}>
              {i < 2 && <div style={{ position: 'absolute', top: 28, right: 0, left: '60%', height: 1, background: 'linear-gradient(90deg,rgba(76,123,255,0.35),transparent)' }} />}
              <div style={{ fontFamily: "'Chakra Petch',sans-serif", fontSize: 52, fontWeight: 700, color: 'rgba(76,123,255,0.13)', marginBottom: 20 }}>{s.n}</div>
              <div style={{ fontFamily: "'Chakra Petch',sans-serif", fontSize: 15, fontWeight: 600, color: '#dce8ff', marginBottom: 14 }}>{s.t}</div>
              <div style={{ fontSize: 12, color: 'rgba(226,232,240,0.35)', lineHeight: 1.85 }}>{s.d}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="harga" style={{ position: 'relative', zIndex: 1, padding: '110px 52px', textAlign: 'center' }}>
        <div style={{ fontSize: 9, color: 'rgba(76,123,255,0.5)', letterSpacing: '0.38em', marginBottom: 16 }}>HARGA</div>
        <h2 style={{ fontFamily: "'Chakra Petch',sans-serif", fontSize: 42, fontWeight: 700, color: '#fff', marginBottom: 14 }}>Mulai gratis. Upgrade kapan saja.</h2>
        <p style={{ fontSize: 13, color: 'rgba(226,232,240,0.32)', marginBottom: 72 }}>Batalkan kapan saja, tanpa pertanyaan.</p>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap', maxWidth: 840, margin: '0 auto' }}>
          <div style={{ flex: 1, minWidth: 310, padding: '44px 38px', background: 'rgba(255,255,255,0.022)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 22, textAlign: 'left', backdropFilter: 'blur(10px)' }}>
            <div style={{ fontSize: 9, color: 'rgba(226,232,240,0.28)', letterSpacing: '0.28em', marginBottom: 22 }}>TRIAL</div>
            <div style={{ fontFamily: "'Chakra Petch',sans-serif", fontSize: 48, fontWeight: 700, color: '#fff', marginBottom: 6 }}>Gratis</div>
            <div style={{ fontSize: 11, color: 'rgba(226,232,240,0.22)', marginBottom: 38 }}>3 hari pertama</div>
            {['10 perintah per hari', '3 hari trial penuh', 'Semua fitur dasar', 'Tanpa kartu kredit'].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <span style={{ color: '#4ade80', fontSize: 12 }}>✓</span>
                <span style={{ fontSize: 12, color: 'rgba(226,232,240,0.48)' }}>{f}</span>
              </div>
            ))}
            <a href="/login" style={{ display: 'block', marginTop: 38, padding: '14px 0', textAlign: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 11, color: 'rgba(226,232,240,0.5)', textDecoration: 'none', fontSize: 10, letterSpacing: '0.18em', transition: 'all 0.2s' }}>MULAI TRIAL GRATIS</a>
          </div>
          <div style={{ flex: 1, minWidth: 310, padding: '44px 38px', background: 'linear-gradient(135deg,rgba(76,123,255,0.09),rgba(124,58,237,0.06))', border: '1px solid rgba(76,123,255,0.26)', borderRadius: 22, textAlign: 'left', backdropFilter: 'blur(10px)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)', padding: '5px 28px', background: 'linear-gradient(90deg,#4c7bff,#7c3aed)', borderRadius: '0 0 16px 16px', fontSize: 8, letterSpacing: '0.22em', color: '#fff', whiteSpace: 'nowrap' }}>★ PALING POPULER</div>
            <div style={{ fontSize: 9, color: 'rgba(76,123,255,0.58)', letterSpacing: '0.28em', marginBottom: 22, marginTop: 22 }}>PREMIUM</div>
            <div style={{ fontFamily: "'Chakra Petch',sans-serif", fontSize: 48, fontWeight: 700, color: '#4c7bff', marginBottom: 6 }}>Rp 130rb</div>
            <div style={{ fontSize: 11, color: 'rgba(76,123,255,0.38)', marginBottom: 38 }}>per bulan</div>
            {['20 perintah per hari', 'Gmail integration', 'Jarvis multi-panel', 'Buka aplikasi lokal', 'Auto update otomatis', 'Prioritas support'].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <span style={{ color: '#4c7bff', fontSize: 11 }}>✦</span>
                <span style={{ fontSize: 12, color: 'rgba(226,232,240,0.68)' }}>{f}</span>
              </div>
            ))}
            <a href="/upgrade" style={{ display: 'block', marginTop: 38, padding: '14px 0', textAlign: 'center', background: 'linear-gradient(135deg,#4c7bff,#7c3aed)', borderRadius: 11, color: '#fff', textDecoration: 'none', fontSize: 10, letterSpacing: '0.18em', boxShadow: '0 8px 28px rgba(76,123,255,0.28)', transition: 'all 0.2s' }}>UPGRADE SEKARANG</a>
          </div>
        </div>
      </section>

      <section id="download" style={{ position: 'relative', zIndex: 1, padding: '110px 52px', textAlign: 'center' }}>
        <div style={{ maxWidth: 660, margin: '0 auto', padding: '72px 60px', background: 'rgba(76,123,255,0.04)', border: '1px solid rgba(76,123,255,0.11)', borderRadius: 28, backdropFilter: 'blur(24px)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -100, right: -100, width: 320, height: 320, background: 'radial-gradient(circle,rgba(139,92,246,0.1),transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -80, left: -80, width: 280, height: 280, background: 'radial-gradient(circle,rgba(6,182,212,0.07),transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ fontSize: 9, color: 'rgba(76,123,255,0.5)', letterSpacing: '0.38em', marginBottom: 18 }}>DOWNLOAD</div>
          <h2 style={{ fontFamily: "'Chakra Petch',sans-serif", fontSize: 38, fontWeight: 700, color: '#fff', marginBottom: 16 }}>Mulai perjalanan Anda.</h2>
          <p style={{ fontSize: 13, color: 'rgba(226,232,240,0.33)', marginBottom: 48, lineHeight: 1.95, maxWidth: 420, margin: '0 auto 48px' }}>Download ZENITH dan rasakan kecerdasan yang sesungguhnya di desktop Anda.</p>
          <div style={{ display: 'flex', gap: 18, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/download" className="dl-btn">
              <span style={{ fontSize: 32, lineHeight: 1 }}></span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.18em', marginBottom: 4 }}>DOWNLOAD UNTUK</div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>macOS Apple Silicon</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.22)', marginTop: 3 }}>DMG · v1.0.1 · Gratis</div>
              </div>
            </a>
            <a href="/download" className="dl-btn">
              <span style={{ fontSize: 32, lineHeight: 1 }}>🪟</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.18em', marginBottom: 4 }}>DOWNLOAD UNTUK</div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>Windows x64</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.22)', marginTop: 3 }}>EXE · v1.0.1 · Gratis</div>
              </div>
            </a>
          </div>
          <p style={{ marginTop: 28, fontSize: 9, color: 'rgba(226,232,240,0.14)', letterSpacing: '0.18em' }}>TRIAL 3 HARI GRATIS · TANPA KARTU KREDIT</p>
        </div>
      </section>

      <footer style={{ position: 'relative', zIndex: 1, padding: '52px', borderTop: '1px solid rgba(76,123,255,0.06)', textAlign: 'center' }}>
        <div style={{ fontFamily: "'Chakra Petch',sans-serif", fontSize: 22, fontWeight: 700, letterSpacing: '0.38em', background: 'linear-gradient(90deg,rgba(76,123,255,0.28),rgba(139,92,246,0.28))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 22 }}>ZENITH</div>
        <div style={{ display: 'flex', gap: 32, justifyContent: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
          {[['Privacy', '/privacy'], ['Terms', '/terms'], ['Refund', '/refund'], ['Contact', '/contact'], ['Download', '/download']].map(([l, h]) => (
            <a key={l} href={h} className="footer-lnk">{l.toUpperCase()}</a>
          ))}
        </div>
        <div style={{ fontSize: 8, color: 'rgba(226,232,240,0.07)', letterSpacing: '0.14em' }}>© 2026 ZENITH AI · AUTONOMOUS INTELLIGENCE · ALL RIGHTS RESERVED</div>
      </footer>
    </>
  )
}
