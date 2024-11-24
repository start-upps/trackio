// src/app/layout.tsx
import "./globals.css"
import { auth } from "@/lib/auth"

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  return (
    <html lang="en">
      <body>
        <main>
          {children}
        </main>
      </body>
    </html>
  )
}