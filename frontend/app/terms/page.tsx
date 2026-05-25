'use client'
import { useRouter } from 'next/navigation'

export default function Terms() {
  const router = useRouter()
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;}
        body{background:#050814;color:#dce8ff;font-family:JetBrains Mono,monospace;}
        h1,h2{color:#fff;}
      `}</style>
      <div style={{maxWidth:800,margin:'0 auto',padding:'60px 24px'}}>
        <button onClick={()=>router.push('/')} style={{background:'none',border:'none',color:'rgba(77,123,255,0.6)',cursor:'pointer',fontSize:11,letterSpacing:'0.1em',marginBottom:32}}>← KEMBALI</button>
        <h1 style={{fontSize:24,marginBottom:8,letterSpacing:'0.1em'}}>TERMS OF SERVICE</h1>
        <p style={{fontSize:10,color:'rgba(255,255,255,0.3)',marginBottom:40}}>Last updated: May 2026</p>

        <h2 style={{fontSize:14,marginBottom:12,letterSpacing:'0.1em'}}>1. PENERIMAAN SYARAT</h2>
        <p style={{fontSize:11,lineHeight:1.8,color:'rgba(255,255,255,0.6)',marginBottom:24}}>Dengan menggunakan ZENITH AI, Anda menyetujui syarat dan ketentuan ini. Jika Anda tidak setuju, harap hentikan penggunaan layanan kami.</p>

        <h2 style={{fontSize:14,marginBottom:12,letterSpacing:'0.1em'}}>2. LAYANAN</h2>
        <p style={{fontSize:11,lineHeight:1.8,color:'rgba(255,255,255,0.6)',marginBottom:24}}>ZENITH AI menyediakan asisten AI berbasis suara yang dapat membantu produktivitas sehari-hari, termasuk manajemen email, kalender, catatan, dan pencarian web. Layanan tersedia dalam paket Trial (gratis 3 hari) dan Premium (Rp 130.000/bulan).</p>

        <h2 style={{fontSize:14,marginBottom:12,letterSpacing:'0.1em'}}>3. PENGGUNAAN YANG DIPERBOLEHKAN</h2>
        <p style={{fontSize:11,lineHeight:1.8,color:'rgba(255,255,255,0.6)',marginBottom:24}}>Anda setuju untuk menggunakan ZENITH AI hanya untuk tujuan yang sah dan tidak melanggar hukum. Dilarang menggunakan layanan ini untuk aktivitas penipuan, spam, atau aktivitas berbahaya lainnya.</p>

        <h2 style={{fontSize:14,marginBottom:12,letterSpacing:'0.1em'}}>4. PEMBAYARAN</h2>
        <p style={{fontSize:11,lineHeight:1.8,color:'rgba(255,255,255,0.6)',marginBottom:24}}>Paket Premium dikenakan biaya Rp 130.000 per bulan. Pembayaran dilakukan di muka. Tidak ada pengembalian dana untuk pembayaran yang sudah dilakukan.</p>

        <h2 style={{fontSize:14,marginBottom:12,letterSpacing:'0.1em'}}>5. BATASAN TANGGUNG JAWAB</h2>
        <p style={{fontSize:11,lineHeight:1.8,color:'rgba(255,255,255,0.6)',marginBottom:24}}>ZENITH AI disediakan "sebagaimana adanya". Kami tidak bertanggung jawab atas kerugian yang timbul dari penggunaan atau ketidakmampuan menggunakan layanan kami.</p>

        <h2 style={{fontSize:14,marginBottom:12,letterSpacing:'0.1em'}}>6. PENGHENTIAN LAYANAN</h2>
        <p style={{fontSize:11,lineHeight:1.8,color:'rgba(255,255,255,0.6)',marginBottom:24}}>Kami berhak menghentikan akses Anda jika melanggar syarat ini. Anda dapat menghentikan langganan kapan saja dengan menghubungi zenithai808@gmail.com.</p>

        <h2 style={{fontSize:14,marginBottom:12,letterSpacing:'0.1em'}}>7. KONTAK</h2>
        <p style={{fontSize:11,lineHeight:1.8,color:'rgba(255,255,255,0.6)',marginBottom:24}}>Pertanyaan tentang syarat ini dapat dikirim ke: zenithai808@gmail.com</p>

        <div style={{marginTop:40,padding:'16px',background:'rgba(77,123,255,0.04)',border:'1px solid rgba(77,123,255,0.1)',borderRadius:8,fontSize:10,color:'rgba(255,255,255,0.3)',textAlign:'center'}}>©️ ZENITH AI 2026 · AUTONOMOUS INTELLIGENCE OS</div>
      </div>
    </>
  )
}
