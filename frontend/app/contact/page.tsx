export default function ContactPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;600;700&family=JetBrains+Mono:wght@300;400;500&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;}
        html,body{background:#050814;font-family:'JetBrains Mono',monospace;}
        h1{font-family:'Chakra Petch',sans-serif;font-size:28px;font-weight:700;letter-spacing:0.08em;color:#dce8ff;margin-bottom:8px;}
        h2{font-family:'Chakra Petch',sans-serif;font-size:11px;letter-spacing:0.3em;color:rgba(77,123,255,0.6);margin:28px 0 10px;text-transform:uppercase;}
        p{font-size:13px;line-height:1.9;color:rgba(220,232,255,0.65);margin-bottom:6px;}
        a{color:rgba(77,123,255,0.7);text-decoration:none;}
        a:hover{color:#4c7bff;}
        strong{color:#dce8ff;}
      `}</style>
      <div style={{minHeight:'100vh',background:'radial-gradient(circle at 30% 30%,rgba(77,123,255,0.07),transparent 60%)'}}>
        <div style={{maxWidth:720,margin:'0 auto',padding:'80px 24px 60px'}}>
          <a href="/" style={{fontSize:'9px',letterSpacing:'0.2em',color:'rgba(77,123,255,0.4)',display:'block',marginBottom:'40px'}}>← KEMBALI KE ZENITH</a>
          <h1>Kontak</h1>
          <div style={{fontSize:'9px',color:'rgba(77,123,255,0.35)',letterSpacing:'0.2em',marginBottom:'40px'}}>HUBUNGI TIM ZENITH AI</div>
          <div style={{background:'rgba(10,16,36,0.6)',border:'1px solid rgba(77,123,255,0.1)',borderRadius:'16px',padding:'36px',backdropFilter:'blur(10px)'}}>
            <p style={{marginBottom:'28px',color:'rgba(220,232,255,0.5)'}}>Tim ZENITH AI siap membantu Anda. Hubungi kami melalui kanal berikut.</p>
            <h2>Email Utama</h2>
            <p><a href="mailto:halo@getzenith.id">halo@getzenith.id</a></p>
            <p style={{fontSize:'11px',color:'rgba(77,123,255,0.4)',marginTop:'4px'}}>Respons dalam 1-2 hari kerja (Senin–Jumat, 09.00–17.00 WIB)</p>
            <h2>Dukungan Teknis</h2>
            <p><a href="mailto:support@getzenith.id">support@getzenith.id</a></p>
            <p style={{fontSize:'11px',color:'rgba(77,123,255,0.4)',marginTop:'4px'}}>Untuk laporan bug, masalah login, atau pertanyaan teknis.</p>
            <h2>Informasi Bisnis</h2>
            <p><strong>ZENITH AI</strong> adalah produk dari OrionAI.</p>
            <p style={{marginTop:'8px'}}>Website: <a href="https://www.getzenith.id">www.getzenith.id</a></p>
            <p>Email: <a href="mailto:halo@getzenith.id">halo@getzenith.id</a></p>
            <p>Lokasi: Jakarta, Indonesia</p>
            <div style={{marginTop:'32px',padding:'16px 20px',background:'rgba(77,123,255,0.05)',border:'1px solid rgba(77,123,255,0.1)',borderRadius:'10px'}}>
              <p style={{fontSize:'11px',color:'rgba(77,123,255,0.5)'}}>Untuk informasi lebih lanjut, cek halaman <a href="/refund">Refund Policy</a>, <a href="/privacy">Privacy Policy</a>, dan <a href="/terms">Terms of Service</a> kami.</p>
            </div>
          </div>
          <div style={{textAlign:'center',marginTop:'32px',fontSize:'8px',color:'rgba(77,123,255,0.15)',letterSpacing:'0.1em'}}>
            © ZENITH AI 2026 · <a href="/privacy">Privacy</a> · <a href="/terms">Terms</a> · <a href="/refund">Refund</a> · <a href="/contact">Contact</a>
          </div>
        </div>
      </div>
    </>
  )
}
