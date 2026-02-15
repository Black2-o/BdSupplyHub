import PwaInstallPrompt from '@/components/pwa-install-prompt'
import React from 'react'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'

import './globals.css'

const _geist = Geist({ subsets: ['latin'] })
const _geistMono = Geist_Mono({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'BDSUPPLYHUB',
  description:
    'Wholesale ecommerce platform. B2B wholesale marketplace for bulk orders in Bangladesh From Dhaka To Others Area Of Bangladesh',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
        <PwaInstallPrompt />
      </body>
    </html>
  )
}
