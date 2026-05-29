'use client'
import { useEffect, useState } from 'react'

export default function UpgradePage() {
  const [user, setUser] = useState<any>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const u = localStorage.getItem('zenith_user')
    if (u) setUser(JSON.parse(u))
  }, [])

  const rekening = '1670010749462'
  const bank = 'Bank Mandiri'
  const atasNama = 'PT TEKAPRO INDONESIA'
  const harga = 'Rp 130.000'
  const wa = '6281385496808'

  const copyRekening = () => {
    navigator.clipboard.writeText(rekening)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const waMessage = encodeURIComponent(
    `Halo ZENITH, saya ingin upgrade ke Premium.\n\nEmail akun: ${user?.email || '(email saya)'}\nNominal: ${harga}\n\n*Bukti transfer terlampir*`
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;600;700&family=JetBrains+Mono:wght@300;400;500&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;}
        html,body{background:#050814;font-family:'JetBrains Mono',monospace;}
        @keyframes shimmer{0%{background-position:0%}100%{background-position:200%}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:0.4}50%{opacity:1}}
        .copybtn:hover{background:rgba(77,123,255,0.15)!important;border-color:rgba(77,123,255,0.4)!important;}
        .wabtn:hover{opacity:0.85;transform:translateY(-1px);}
        .backbtn:hover{color:#4c7bff!important;}
      `}</style>

      <div style={{minHeight:'100vh',background:'radial-gradient(circle at 30% 30%,rgba(77,123,255,0.08),transparent 60%)',padding:'60px 24px'}}>
        <div style={{maxWidth:560,margin:'0 auto',animation:'fadeIn 0.5s ease'}}>

          {/* Back */}
          <a href="/dashboard" className="backbtn" style={{fontSize:'9px',letterSpacing:'0.2em',color:'rgba(77,123,255,0.4)',display:'block',marginBottom:'40px',transition:'color 0.2s'}}>← KEMBALI KE DASHBOARD</a>

          {/* Title */}
          <div style={{fontFamily:'Chakra Petch,sans-serif',fontSize:'26px',fontWeight:700,letterSpacing:'0.08em',background:'linear-gradient(90deg,#fff,rgba(77,123,255,0.9),#fff)',backgroundSize:'200%',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',animation:'shimmer 5s linear infinite',marginBottom:'6px'}}>
            Upgrade ke Premium
          </div>
          <div style={{fontSize:'9px',color:'rgba(77,123,255,0.35)',letterSpacing:'0.22em',marginBottom:'36px'}}>ZENITH AI · AUTONOMOUS INTELLIGENCE</div>

          {/* Benefits */}
          <div style={{background:'rgba(10,16,36,0.6)',border:'1px solid rgba(77,123,255,0.12)',borderRadius:'16px',padding:'24px',marginBottom:'20px',backdropFilter:'blur(10px)'}}>
            <div style={{fontSize:'9px',color:'rgba(77,123,255,0.5)',letterSpacing:'0.2em',marginBottom:'16px'}}>FITUR PREMIUM</div>
            {[
              '✦  20 perintah suara per hari',
              '✦  Buka aplikasi lokal via suara',
              '✦  Integrasi Gmail (baca & kirim)',
              '✦  Dashboard Jarvis multi-panel',
              '✦  Akses semua update terbaru',
              '✦  Prioritas support',
            ].map((f, i) => (
              <div key={i} style={{fontSize:'12px',color:'rgba(220,232,255,0.7)',padding:'7px 0',borderBottom:i<5?'1px solid rgba(77,123,255,0.05)':'none'}}>
                {f}
              </div>
            ))}
            <div style={{marginTop:'18px',display:'flex',alignItems:'baseline',gap:'8px'}}>
              <span style={{fontFamily:'Chakra Petch,sans-serif',fontSize:'28px',fontWeight:700,color:'#4c7bff'}}>Rp 130.000</span>
              <span style={{fontSize:'10px',color:'rgba(77,123,255,0.4)'}}>/ bulan</span>
            </div>
          </div>

          {/* Transfer Info */}
          <div style={{background:'rgba(10,16,36,0.6)',border:'1px solid rgba(77,123,255,0.12)',borderRadius:'16px',padding:'24px',marginBottom:'20px',backdropFilter:'blur(10px)'}}>
            <div style={{fontSize:'9px',color:'rgba(77,123,255,0.5)',letterSpacing:'0.2em',marginBottom:'20px'}}>INSTRUKSI PEMBAYARAN</div>

            <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
              {/* Step 1 */}
              <div style={{padding:'14px 16px',background:'rgba(77,123,255,0.04)',border:'1px solid rgba(77,123,255,0.08)',borderRadius:'10px'}}>
                <div style={{fontSize:'8px',color:'rgba(77,123,255,0.4)',letterSpacing:'0.15em',marginBottom:'10px'}}>LANGKAH 1 — TRANSFER</div>
                <div style={{fontSize:'11px',color:'rgba(220,232,255,0.5)',marginBottom:'4px'}}>Bank</div>
                <div style={{fontSize:'14px',color:'#dce8ff',fontWeight:500,marginBottom:'12px'}}>{bank}</div>
                <div style={{fontSize:'11px',color:'rgba(220,232,255,0.5)',marginBottom:'4px'}}>Nomor Rekening</div>
                <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'12px'}}>
                  <div style={{fontSize:'18px',color:'#4c7bff',fontWeight:600,letterSpacing:'0.08em'}}>{rekening}</div>
                  <button className="copybtn" onClick={copyRekening} style={{padding:'4px 10px',background:'rgba(77,123,255,0.08)',border:'1px solid rgba(77,123,255,0.2)',borderRadius:'6px',color:copied?'#4ade80':'rgba(77,123,255,0.7)',fontFamily:'JetBrains Mono',fontSize:'8px',cursor:'pointer',letterSpacing:'0.1em',transition:'all 0.2s'}}>
                    {copied ? 'COPIED ✓' : 'COPY'}
                  </button>
                </div>
                <div style={{fontSize:'11px',color:'rgba(220,232,255,0.5)',marginBottom:'4px'}}>Atas Nama</div>
                <div style={{fontSize:'13px',color:'#dce8ff'}}>{atasNama}</div>
                <div style={{marginTop:'12px',padding:'8px 12px',background:'rgba(77,123,255,0.06)',borderRadius:'7px'}}>
                  <div style={{fontSize:'9px',color:'rgba(77,123,255,0.4)',letterSpacing:'0.12em',marginBottom:'3px'}}>NOMINAL TRANSFER</div>
                  <div style={{fontFamily:'Chakra Petch,sans-serif',fontSize:'20px',fontWeight:700,color:'#4c7bff'}}>{harga}</div>
                </div>
              </div>

              {/* Step 2 */}
              <div style={{padding:'14px 16px',background:'rgba(77,123,255,0.04)',border:'1px solid rgba(77,123,255,0.08)',borderRadius:'10px'}}>
                <div style={{fontSize:'8px',color:'rgba(77,123,255,0.4)',letterSpacing:'0.15em',marginBottom:'10px'}}>LANGKAH 2 — KONFIRMASI</div>
                <div style={{fontSize:'12px',color:'rgba(220,232,255,0.6)',lineHeight:1.7,marginBottom:'14px'}}>
                  Setelah transfer, kirim bukti pembayaran via WhatsApp. Akun Anda akan diupgrade dalam <strong style={{color:'#dce8ff'}}>1 × 24 jam</strong>.
                </div>
                {user?.email && (
                  <div style={{padding:'8px 12px',background:'rgba(77,123,255,0.06)',borderRadius:'7px',marginBottom:'14px'}}>
                    <div style={{fontSize:'8px',color:'rgba(77,123,255,0.4)',letterSpacing:'0.12em',marginBottom:'2px'}}>EMAIL AKUN ANDA</div>
                    <div style={{fontSize:'12px',color:'#4c7bff'}}>{user.email}</div>
                  </div>
                )}
                <a href={`https://wa.me/${wa}?text=${waMessage}`} target="_blank" rel="noreferrer" className="wabtn" style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'10px',width:'100%',padding:'12px 0',background:'linear-gradient(135deg,rgba(37,211,102,0.15),rgba(37,211,102,0.08))',border:'1px solid rgba(37,211,102,0.3)',borderRadius:'10px',color:'#25d366',fontFamily:'JetBrains Mono',fontSize:'10px',letterSpacing:'0.15em',textDecoration:'none',transition:'all 0.2s',boxShadow:'0 4px 16px rgba(37,211,102,0.1)'}}>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="#25d366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  KIRIM BUKTI TRANSFER
                </a>
              </div>
            </div>
          </div>

          <div style={{textAlign:'center',fontSize:'9px',color:'rgba(77,123,255,0.2)',letterSpacing:'0.1em'}}>
            Ada pertanyaan? <a href="/contact" style={{color:'rgba(77,123,255,0.4)',textDecoration:'none'}}>Hubungi kami</a> · <a href="/refund" style={{color:'rgba(77,123,255,0.4)',textDecoration:'none'}}>Refund Policy</a>
          </div>
        </div>
      </div>
    </>
  )
}
