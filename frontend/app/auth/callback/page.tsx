'use client'
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function CallbackHandler() {
  const router = useRouter()
  const params = useSearchParams()

  useEffect(() => {
    const token = params.get('token')
    const user_id = params.get('user_id')
    const name = params.get('name')
    const email = params.get('email')

    if (token && user_id) {
      localStorage.setItem('zenith_token', token)
      localStorage.setItem('zenith_user', JSON.stringify({user_id, name, email}))
      router.push('/dashboard')
    } else {
      router.push('/login')
    }
  }, [])

  return (
    <div style={{width:'100vw',height:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#06090f',color:'rgba(77,123,255,0.6)',fontFamily:'JetBrains Mono,monospace',fontSize:12,letterSpacing:'0.2em'}}>
      MENGHUBUNGKAN...
    </div>
  )
}

export default function AuthCallback() {
  return (
    <Suspense fallback={<div style={{width:'100vw',height:'100vh',background:'#06090f'}}/>}>
      <CallbackHandler/>
    </Suspense>
  )
}
