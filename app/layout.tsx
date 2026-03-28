import type { Metadata } from 'next'
import { Instrument_Sans, Instrument_Serif } from 'next/font/google'
import './globals.css'
import { TooltipProvider } from '@/components/ui/tooltip'

const instrumentSans = Instrument_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
})

const instrumentSerif = Instrument_Serif({
  variable: '--font-serif',
  weight: '400',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Reading Queue',
  description: 'Your personal reading queue and library.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${instrumentSans.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-white text-gray-900 flex flex-col">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  )
}
