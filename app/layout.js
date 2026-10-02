import './globals.css'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import { Providers } from './providers'
import AppShell from '@/components/cerca/app-shell'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' })
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-display', display: 'swap', weight: ['500', '600', '700', '800'] })

export const metadata = {
  title: 'Cerca — Your neighbourhood pet network',
  description: 'Lost & found pets, community, learning and pet services for your city.',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2F5D50',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{__html:'window.addEventListener("error",function(e){if(e.error instanceof DOMException&&e.error.name==="DataCloneError"&&e.message&&e.message.includes("PerformanceServerTiming")){e.stopImmediatePropagation();e.preventDefault()}},true);'}} />
      </head>
      <body className="font-sans">
        <Providers>
          <AppShell>{children}</AppShell>
          <Toaster position="top-center" />
        </Providers>
      </body>
    </html>
  )
}
