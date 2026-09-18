"use client"

import { HiggsfieldNavbar } from "@/components/layout/HiggsfieldNavbar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-blue-500/30 selection:text-blue-200">
      <HiggsfieldNavbar />
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  )
}
