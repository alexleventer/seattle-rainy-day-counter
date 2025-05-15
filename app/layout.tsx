import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Seattle Rain Tracker',
  description: 'Track the rain in Seattle',
}
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    return ();
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
