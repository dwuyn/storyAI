import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Story AI - Sáng tác thông minh, giữ hồn câu chuyện',
  description: 'Nền tảng AI hỗ trợ sáng tác truyện, tiểu thuyết, truyện tranh, kịch bản - với hệ thống giữ ngữ cảnh thông minh.',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className="dark">
      <body className={`${inter.className} bg-sf-bg text-sf-text antialiased`}>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#3B4252',
                color: '#ECEFF4',
                border: '1px solid #4C566A',
                borderRadius: '10px',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
