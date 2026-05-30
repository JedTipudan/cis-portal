import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CIS Portal - School Report Dashboard',
  description: 'Comprehensive Information System for School Reporting',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
