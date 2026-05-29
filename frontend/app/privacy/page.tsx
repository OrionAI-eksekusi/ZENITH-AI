export default function PrivacyPage() {
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
          <h1>Privacy Policy</h1>
          <div style={{fontSize:'9px',color:'rgba(77,123,255,0.35)',letterSpacing:'0.2em',marginBottom:'40px'}}>KEBIJAKAN PRIVASI</div>
          <div style={{background:'rgba(10,16,36,0.6)',border:'1px solid rgba(77,123,255,0.1)',borderRadius:'16px',padding:'36px',backdropFilter:'blur(10px)'}}>
            <p>Kebijakan Privasi ini menjelaskan bagaimana ZENITH AI mengumpulkan, menggunakan, dan melindungi informasi Anda. Terakhir diperbarui: <strong>1 Januari 2026</strong>.</p>
            <h2>Data yang Kami Kumpulkan</h2>
            <ul>
              <li><strong>Informasi Akun:</strong> nama, alamat email, dan kata sandi terenkripsi saat mendaftar.</li>
              <li><strong>Data Google OAuth:</strong> profil Google dasar (nama, email, foto) jika login via Google.</li>
              <li><strong>Data Penggunaan:</strong> jumlah perintah yang digunakan, fitur yang diakses, dan waktu sesi.</li>
              <li><strong>Data Email (opsional):</strong> metadata dan isi email hanya jika Anda mengizinkan akses Gmail untuk membalas atau meringkas email melalui perintah suara.</li>
            </ul>
            <h2>Data yang Tidak Kami Simpan</h2>
            <ul>
              <li>Rekaman suara atau audio dari perintah Anda.</li>
              <li>Konten email tanpa izin eksplisit Anda.</li>
              <li>Informasi kartu kredit atau pembayaran (diproses oleh penyedia pembayaran pihak ketiga).</li>
            </ul>
            <h2>Cara Kami Menggunakan Data</h2>
            <ul>
              <li>Menyediakan dan meningkatkan layanan ZENITH AI.</li>
              <li>Memproses perintah suara dan memberikan respons yang relevan.</li>
              <li>Mengirim notifikasi penting terkait akun Anda.</li>
              <li>Menganalisis penggunaan secara agregat untuk pengembangan fitur.</li>
            </ul>
            <h2>Berbagi Data dengan Pihak Ketiga</h2>
            <p>Kami <strong>tidak menjual</strong> data pribadi Anda kepada pihak ketiga. Data dapat dibagikan dengan:</p>
            <ul>
              <li><strong>Google LLC</strong> — untuk autentikasi OAuth dan akses Gmail atas izin Anda.</li>
              <li><strong>Railway &amp; Vercel</strong> — infrastruktur hosting kami.</li>
              <li><strong>Anthropic</strong> — pemrosesan AI dalam konteks sesi, tidak disimpan permanen.</li>
            </ul>
            <h2>Keamanan Data</h2>
            <p>Kami menggunakan enkripsi HTTPS untuk semua komunikasi, menyimpan kata sandi dengan bcrypt hashing, dan membatasi akses data ke tim internal yang membutuhkan.</p>
            <h2>Hak Anda</h2>
            <ul>
              <li>Meminta akses, koreksi, atau penghapusan data pribadi Anda.</li>
              <li>Mencabut izin akses Gmail kapan saja melalui pengaturan akun Google Anda.</li>
              <li>Menghapus akun ZENITH dengan menghubungi kami di bawah.</li>
            </ul>
            <h2>Kontak</h2>
            <p>Pertanyaan tentang privasi: <a href="mailto:halo@getzenith.id">halo@getzenith.id</a></p>
          </div>
          <div style={{textAlign:'center',marginTop:'32px',fontSize:'8px',color:'rgba(77,123,255,0.15)',letterSpacing:'0.1em'}}>
            © ZENITH AI 2026 · <a href="/privacy">Privacy</a> · <a href="/terms">Terms</a> · <a href="/refund">Refund</a> · <a href="/contact">Contact</a>
          </div>
        </div>
      </div>
    </>
  )
}
