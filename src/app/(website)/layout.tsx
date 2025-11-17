import "../globals.css"
import { Inter, Source_Serif_4, JetBrains_Mono } from "next/font/google"

import { SiteHeader } from "@/components/layout/site-header"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })
const sourceSerif = Source_Serif_4({ subsets: ["latin"], variable: "--font-serif" })
const jetBrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head />
      <body className={`${inter.variable} ${sourceSerif.variable} ${jetBrainsMono.variable} bg-background text-foreground antialiased`}>
        <SiteHeader />
        {children}
      </body>
    </html>
  )
}
