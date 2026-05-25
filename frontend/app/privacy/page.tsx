'use client'
import { useRouter } from 'next/navigation'

export default function Privacy() {
  const router = useRouter()
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;}
        body{background:#050814;color:#dce8ff;font-family:JetBrains Mono,monospace;}
        h1,h2{color:#fff;}
        a{color:#4c7bff;}
      `}</style>
      <div style={{maxWidth:800,margin:'0 auto',padding:'60px 24px'}}>
        <button onClick={()=>router.push('/')} style={{background:'none',border:'none',color:'rgba(77,123,255,0.6)',cursor:'pointer',fontSize:11,letterSpacing:'0.1em',marginBottom:32}}>← KEMBALI</button>
        <h1 style={{fontSize:24,marginBottom:8,letterSpacing:'0.1em'}}>PRIVACY POLICY</h1>
        <p style={{fontSize:10,color:'rgba(255,255,255,0.3)',marginBottom:40}}>Last updated: May 2026</p>

        <h2 style={{fontSize:14,marginBottom:12,letterSpacing:'0.1em'}}>1. INFORMASI YANG KAMI KUMPULKAN</h2>
        <p style={{fontSize:11,lineHeight:1.8,color:'rgba(255,255,255,0.6)',marginBottom:24}}>ZENITH AI mengumpulkan informasi yang Anda berikan secara langsung, termasuk nama, alamat email, dan data percakapan. Kami juga mengumpulkan data dari Google API (Gmail dan Calendar) hanya dengan izin eksplisit Anda.</p>

        <h2 style={{fontSize:14,marginBottom:12,letterSpacing:'0.1em'}}>2. CARA KAMI MENGGUNAKAN INFORMASI</h2>
        <p style={{fontSize:11,lineHeight:1.8,color:'rgba(255,255,255,0.6)',marginBottom:24}}>Informasi Anda digunakan semata-mata untuk menyediakan layanan ZENITH AI, termasuk memproses perintah suara, mengakses Gmail dan Calendar Anda atas permintaan Anda, dan menyimpan preferensi pribadi. Kami tidak menjual, menyewakan, atau membagikan data Anda kepada pihak ketiga.</p>

        <h2 style={{fontSize:14,marginBottom:12,letterSpacing:'0.1em'}}>3. GOOGLE API</h2>
        <p style={{fontSize:11,lineHeight:1.8,color:'rgba(255,255,255,0.6)',marginBottom:24}}>ZENITH AI menggunakan Google API untuk mengakses Gmail (read-only) dan Google Calendar (read-only) atas izin eksplisit pengguna. Data dari Google API tidak disimpan secara permanen dan hanya digunakan untuk memberikan respons AI yang relevan. Penggunaan kami mematuhi Google API Services User Data Policy.</p>

        <h2 style={{fontSize:14,marginBottom:12,letterSpacing:'0.1em'}}>4. KEAMANAN DATA</h2>
        <p style={{fontSize:11,lineHeight:1.8,color:'rgba(255,255,255,0.6)',marginBottom:24}}>Kami menggunakan enkripsi SSL/TLS untuk semua transmisi data. Token Google OAuth disimpan secara terenkripsi di database kami dan tidak dapat diakses oleh pihak lain.</p>

        <h2 style={{fontSize:14,marginBottom:12,letterSpacing:'0.1em'}}>5. HAK PENGGUNA</h2>
        <p style={{fontSize:11,lineHeight:1.8,color:'rgba(255,255,255,0.6)',marginBottom:24}}>Anda berhak untuk mengakses, memperbarui, atau menghapus data pribadi Anda kapan saja. Untuk permintaan penghapusan data, hubungi kami di zenithai808@gmail.com.</p>

        <h2 style={{fontSize:14,marginBottom:12,letterSpacing:'0.1em'}}>6. KONTAK</h2>
        <p style={{fontSize:11,lineHeight:1.8,color:'rgba(255,255,255,0.6)',marginBottom:24}}>Jika Anda memiliki pertanyaan tentang kebijakan privasi ini, hubungi kami di: zenithai808@gmail.com</p>

        <div style={{marginTop:40,padding:'16px',background:'rgba(77,123,255,0.04)',border:'1px solid rgba(77,123,255,0.1)',borderRadius:8,fontSize:10,color:'rgba(255,255,255,0.3)',textAlign:'center'}}>©️ ZENITH AI 2026 · AUTONOMOUS INTELLIGENCE OS</div>
      </div>
    </>
  )
}
