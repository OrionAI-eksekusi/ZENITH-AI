export default function RefundPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;600;700&family=JetBrains+Mono:wght@300;400;500&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;}
        html,body{background:#050814;font-family:'JetBrains Mono',monospace;}
        h1{font-family:'Chakra Petch',sans-serif;font-size:28px;font-weight:700;letter-spacing:0.08em;color:#dce8ff;margin-bottom:8px;}
        h2{font-family:'Chakra Petch',sans-serif;font-size:11px;letter-spacing:0.3em;color:rgba(77,123,255,0.6);margin:28px 0 10px;text-transform:uppercase;}
        p{font-size:13px;line-height:1.9;color:rgba(220,232,255,0.65);margin-bottom:10px;}
        li{font-size:13px;line-height:1.9;color:rgba(220,232,255,0.65);margin-left:20px;margin-bottom:6px;}
        a{color:rgba(77,123,255,0.7);text-decoration:none;}
        a:hover{color:#4c7bff;}
        strong{color:#dce8ff;}
      `}</style>
      <div style={{minHeight:'100vh',background:'radial-gradient(circle at 30% 30%,rgba(77,123,255,0.07),transparent 60%)'}}>
        <div style={{maxWidth:720,margin:'0 auto',padding:'80px 24px 60px'}}>
          <a href="/" style={{fontSize:'9px',letterSpacing:'0.2em',color:'rgba(77,123,255,0.4)',display:'block',marginBottom:'40px'}}>← KEMBALI KE ZENITH</a>
          <h1>Refund Policy</h1>
          <div style={{fontSize:'9px',color:'rgba(77,123,255,0.35)',letterSpacing:'0.2em',marginBottom:'40px'}}>KEBIJAKAN PENGEMBALIAN DANA</div>
          <div style={{background:'rgba(10,16,36,0.6)',border:'1px solid rgba(77,123,255,0.1)',borderRadius:'16px',padding:'36px',backdropFilter:'blur(10px)'}}>
            <p>Kebijakan pengembalian dana berlaku per <strong>1 Januari 2026</strong> untuk semua pengguna ZENITH AI.</p>
            <h2>Masa Percobaan Gratis</h2>
            <p>ZENITH AI menyediakan masa percobaan gratis selama <strong>3 hari</strong> tanpa memerlukan informasi pembayaran apapun. Anda dapat mengeksplorasi fitur penuh selama periode ini tanpa biaya.</p>
            <h2>Langganan Premium</h2>
            <p>Langganan Premium ZENITH AI dikenakan biaya <strong>Rp 130.000 per bulan</strong>. Pembayaran diproses di awal setiap periode langganan.</p>
            <h2>Kebijakan Pengembalian Dana</h2>
            <ul>
              <li>Pengembalian dana penuh tersedia dalam <strong>7 hari pertama</strong> setelah pembayaran jika terdapat masalah teknis yang mencegah penggunaan layanan.</li>
              <li>Permintaan pengembalian dana setelah 7 hari tidak dapat diproses.</li>
              <li>Tidak ada pengembalian dana parsial untuk periode yang tidak digunakan.</li>
              <li>Pengembalian dana tidak tersedia untuk alasan di luar masalah teknis layanan kami.</li>
            </ul>
            <h2>Pembatalan Langganan</h2>
            <p>Anda dapat membatalkan langganan kapan saja. Pembatalan berlaku di akhir periode yang sedang berjalan. Akses Premium tetap aktif hingga akhir periode yang telah dibayar.</p>
            <h2>Cara Mengajukan Refund</h2>
            <p>Kirim email ke <a href="mailto:halo@getzenith.id">halo@getzenith.id</a> dengan subjek <strong>REFUND REQUEST</strong> beserta email akun dan bukti pembayaran. Tim kami akan merespons dalam 1-3 hari kerja.</p>
          </div>
          <div style={{textAlign:'center',marginTop:'32px',fontSize:'8px',color:'rgba(77,123,255,0.15)',letterSpacing:'0.1em'}}>
            © ZENITH AI 2026 · <a href="/privacy">Privacy</a> · <a href="/terms">Terms</a> · <a href="/refund">Refund</a> · <a href="/contact">Contact</a>
          </div>
        </div>
      </div>
    </>
  )
}
