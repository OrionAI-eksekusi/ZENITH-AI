export default function TermsPage() {
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
          <h1>Terms of Service</h1>
          <div style={{fontSize:'9px',color:'rgba(77,123,255,0.35)',letterSpacing:'0.2em',marginBottom:'40px'}}>SYARAT DAN KETENTUAN</div>
          <div style={{background:'rgba(10,16,36,0.6)',border:'1px solid rgba(77,123,255,0.1)',borderRadius:'16px',padding:'36px',backdropFilter:'blur(10px)'}}>
            <p>Syarat dan Ketentuan ini mengatur penggunaan layanan ZENITH AI. Dengan menggunakan ZENITH AI, Anda menyetujui ketentuan berikut. Terakhir diperbarui: <strong>1 Januari 2026</strong>.</p>
            <h2>Tentang Layanan</h2>
            <p>ZENITH AI adalah asisten kecerdasan buatan berbasis suara yang membantu pengguna mengelola email, membuka aplikasi, mencari informasi, dan meningkatkan produktivitas. Layanan tersedia melalui <a href="https://www.getzenith.id">getzenith.id</a> dan aplikasi desktop Mac &amp; Windows.</p>
            <h2>Akun Pengguna</h2>
            <ul>
              <li>Anda harus berusia minimal 17 tahun untuk menggunakan ZENITH AI.</li>
              <li>Anda bertanggung jawab menjaga kerahasiaan kredensial akun Anda.</li>
              <li>Satu akun per pengguna. Berbagi akun tidak diperbolehkan.</li>
              <li>Kami berhak menangguhkan akun yang melanggar ketentuan ini.</li>
            </ul>
            <h2>Paket Langganan</h2>
            <ul>
              <li><strong>Trial Gratis:</strong> 3 hari, 10 perintah per hari, tanpa informasi pembayaran.</li>
              <li><strong>Premium:</strong> Rp 130.000/bulan, 20 perintah per hari, akses semua fitur.</li>
              <li><strong>Founder:</strong> Akses unlimited, hanya untuk pengguna terpilih.</li>
            </ul>
            <h2>Penggunaan yang Diperbolehkan</h2>
            <ul>
              <li>Menggunakan ZENITH AI untuk keperluan produktivitas pribadi yang sah.</li>
              <li>Mengintegrasikan dengan akun Google Anda sesuai izin yang diberikan.</li>
            </ul>
            <h2>Penggunaan yang Dilarang</h2>
            <ul>
              <li>Menggunakan ZENITH AI untuk aktivitas ilegal atau melanggar hukum Indonesia.</li>
              <li>Melakukan reverse engineering atau mendistribusikan ulang layanan kami.</li>
              <li>Spam, scraping, atau otomatisasi berlebihan yang memberatkan sistem kami.</li>
              <li>Berbagi akun atau menjual kembali akses layanan kepada pihak lain.</li>
            </ul>
            <h2>Batasan Tanggung Jawab</h2>
            <p>ZENITH AI disediakan sebagaimana adanya. Kami tidak bertanggung jawab atas kerugian tidak langsung yang timbul dari penggunaan layanan. Tanggung jawab maksimal kami terbatas pada biaya langganan bulan berjalan.</p>
            <h2>Perubahan Layanan</h2>
            <p>Kami dapat mengubah fitur, harga, atau ketentuan dengan pemberitahuan 14 hari sebelumnya melalui email terdaftar Anda.</p>
            <h2>Hukum yang Berlaku</h2>
            <p>Ketentuan ini tunduk pada hukum Republik Indonesia. Sengketa diselesaikan secara musyawarah atau melalui pengadilan yang berwenang di Jakarta.</p>
            <h2>Kontak</h2>
            <p>Pertanyaan: <a href="mailto:halo@getzenith.id">halo@getzenith.id</a></p>
          </div>
          <div style={{textAlign:'center',marginTop:'32px',fontSize:'8px',color:'rgba(77,123,255,0.15)',letterSpacing:'0.1em'}}>
            © ZENITH AI 2026 · <a href="/privacy">Privacy</a> · <a href="/terms">Terms</a> · <a href="/refund">Refund</a> · <a href="/contact">Contact</a>
          </div>
        </div>
      </div>
    </>
  )
}
