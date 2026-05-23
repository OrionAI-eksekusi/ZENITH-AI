'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Upgrade() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleUpgrade = () => {
    setLoading(true)
    // Nanti connect ke payment gateway
    setTimeout(() => {
      alert('Payment gateway segera hadir! Hubungi admin@zanith.ai untuk early access.')
      setLoading(false)
    }, 1000)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;}
        html,body{width:100%;height:100%;background:#050814;overflow:hidden;}
        @keyframes shimmer{0%{background-position:0%}100%{background-position:200%}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:0.4}50%{opacity:1}}
        @keyframes glow{0%,100%{box-shadow:0 0 20px rgba(77,123,255,0.1)}50%{box-shadow:0 0 40px rgba(77,123,255,0.25)}}
      `}</style>

      <div style={{width:'100vw',height:'100vh',background:'#050814',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',fontFamily:'JetBrains Mono,monospace',padding:'20px'}}>
        
        {/* Header */}
        <div style={{textAlign:'center',marginBottom:48,animation:'fadeIn 0.4s ease'}}>
          <div style={{fontSize:9,color:'rgba(77,123,255,0.4)',letterSpacing:'0.3em',marginBottom:12}}>ZANITH AI</div>
          <div style={{fontSize:22,fontWeight:600,color:'#fff',letterSpacing:'0.05em',marginBottom:8}}>Pilih Plan Kamu</div>
          <div style={{fontSize:10,color:'rgba(255,255,255,0.3)',letterSpacing:'0.1em'}}>Mulai gratis, upgrade kapan saja</div>
        </div>

        {/* Cards */}
        <div style={{display:'flex',gap:20,animation:'fadeIn 0.5s ease'}}>
          
          {/* Trial Card */}
          <div style={{width:280,background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:16,padding:28}}>
            <div style={{fontSize:8,color:'rgba(255,255,255,0.3)',letterSpacing:'0.2em',marginBottom:16}}>TRIAL</div>
            <div style={{fontSize:28,fontWeight:600,color:'#fff',marginBottom:4}}>Gratis</div>
            <div style={{fontSize:9,color:'rgba(255,255,255,0.25)',letterSpacing:'0.1em',marginBottom:24}}>3 hari pertama</div>
            
            <div style={{height:1,background:'rgba(255,255,255,0.05)',marginBottom:20}}/>
            
            {[
              '10 perintah per hari',
              'Voice interaction',
              'Memory dasar',
              'Web search',
              'Gmail integration',
            ].map((f,i) => (
              <div key={i} style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
                <div style={{width:4,height:4,borderRadius:'50%',background:'rgba(255,255,255,0.3)',flexShrink:0}}/>
                <span style={{fontSize:10,color:'rgba(255,255,255,0.4)',letterSpacing:'0.05em'}}>{f}</span>
              </div>
            ))}

            <button onClick={() => router.push('/')} style={{width:'100%',marginTop:24,padding:'11px 0',background:'transparent',border:'1px solid rgba(255,255,255,0.08)',borderRadius:8,color:'rgba(255,255,255,0.4)',fontFamily:'JetBrains Mono,monospace',fontSize:9,letterSpacing:'0.15em',cursor:'pointer'}}>
              MULAI TRIAL
            </button>
          </div>

          {/* Premium Card */}
          <div style={{width:280,background:'rgba(77,123,255,0.04)',border:'1px solid rgba(77,123,255,0.2)',borderRadius:16,padding:28,position:'relative',animation:'glow 3s ease-in-out infinite'}}>
            
            {/* Badge */}
            <div style={{position:'absolute',top:-10,right:20,background:'linear-gradient(135deg,#4c7bff,#8b5cf6)',borderRadius:20,padding:'4px 12px',fontSize:8,color:'#fff',letterSpacing:'0.1em'}}>RECOMMENDED</div>
            
            <div style={{fontSize:8,color:'rgba(77,123,255,0.6)',letterSpacing:'0.2em',marginBottom:16}}>PREMIUM</div>
            <div style={{display:'flex',alignItems:'baseline',gap:6,marginBottom:4}}>
              <span style={{fontSize:28,fontWeight:600,color:'#fff'}}>Rp 130rb</span>
            </div>
            <div style={{fontSize:9,color:'rgba(255,255,255,0.25)',letterSpacing:'0.1em',marginBottom:24}}>per bulan</div>
            
            <div style={{height:1,background:'rgba(77,123,255,0.1)',marginBottom:20}}/>
            
            {[
              '20 perintah per hari',
              'Voice interaction premium',
              'Memory penuh + konteks panjang',
              'Web search realtime',
              'Gmail — baca & balas email',
              'Priority support',
            ].map((f,i) => (
              <div key={i} style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
                <div style={{width:4,height:4,borderRadius:'50%',background:'#4c7bff',flexShrink:0,boxShadow:'0 0 6px rgba(77,123,255,0.5)'}}/>
                <span style={{fontSize:10,color:'rgba(255,255,255,0.65)',letterSpacing:'0.05em'}}>{f}</span>
              </div>
            ))}

            <button onClick={handleUpgrade} disabled={loading} style={{width:'100%',marginTop:24,padding:'12px 0',background:loading?'rgba(77,123,255,0.1)':'linear-gradient(135deg,rgba(77,123,255,0.2),rgba(139,92,246,0.2))',border:'1px solid rgba(77,123,255,0.3)',borderRadius:8,color:loading?'rgba(77,123,255,0.4)':'#4c7bff',fontFamily:'JetBrains Mono,monospace',fontSize:9,letterSpacing:'0.15em',cursor:loading?'not-allowed':'pointer',transition:'all 0.2s'}}>
              {loading?'MEMPROSES...':'UPGRADE SEKARANG'}
            </button>
          </div>
        </div>

        <button onClick={() => router.push('/')} style={{marginTop:32,background:'none',border:'none',color:'rgba(255,255,255,0.2)',fontFamily:'JetBrains Mono,monospace',fontSize:9,letterSpacing:'0.1em',cursor:'pointer'}}>
          ← KEMBALI KE ZANITH
        </button>
      </div>
    </>
  )
}
