import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import localFont from 'next/font/local'
import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

const blanka = localFont({
  src: '../../public/font/Blanka-Regular.otf',
  variable: '--font-blanka',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Rcomienda — Descubre y recomienda comercios locales',
  description:
    'Explora, descubre y recomienda los mejores comercios locales de tu ciudad. Restaurantes, tiendas, servicios y más con reseñas, incentivos y publicidad local.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="dark">
      <head />
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${blanka.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
