import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ZENITH — Autonomous Intelligence OS',
  description: 'AI asisten pribadi yang cerdas, elegan, dan powerful. Seperti JARVIS untuk kehidupan sehari-hari kamu.',
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><rect width='200' height='200' fill='%23050814'/><circle cx='100' cy='100' r='72' fill='none' stroke='%234c7bff' stroke-width='8' opacity='0.9'/><circle cx='100' cy='100' r='58' fill='%23050814'/><circle cx='78' cy='76' r='6' fill='%234c7bff'/></svg>"
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  )
}
