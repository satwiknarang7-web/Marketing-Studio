"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Type,
  Image as ImageIcon,
  Camera,
  Video,
  Palette,
  Clock,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react"

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Text Studio", href: "/text-studio", icon: Type },
  { name: "Image Studio", href: "/image-studio", icon: ImageIcon },
  { name: "Product Photoshoot", href: "/product-photoshoot", icon: Camera },
  { name: "Video Studio", href: "/video-studio", icon: Video },
  { name: "Brand Kit", href: "/brand-kit", icon: Palette },
  { name: "History", href: "/history", icon: Clock },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = React.useState(false)

  return (
    <div
      className={cn(
        "flex h-screen flex-col bg-[#080b11] text-white transition-all duration-300 border-r border-[#1a2233]",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex h-16 items-center justify-between px-4 border-b border-[#1a2233]">
        {!collapsed && (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 font-bold text-white shadow-lg shadow-blue-500/25">
              S
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
                Segue IT
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
              </span>
              <span className="text-[10px] text-slate-400 font-medium -mt-0.5">Marketing Studio</span>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 font-bold text-white shadow-lg shadow-blue-500/25">
            S
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1.5 px-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 border border-blue-400/20 font-semibold"
                    : "text-slate-400 hover:bg-[#121826] hover:text-white"
                )}
              >
                <item.icon className={cn("h-4 w-4 flex-shrink-0", isActive ? "text-white" : "text-slate-400")} />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="p-3 border-t border-[#1a2233] space-y-2">
        {!collapsed && (
          <div className="p-3 rounded-xl bg-[#0e1422] border border-[#1e283d] flex items-center gap-2 text-xs text-slate-300">
            <Sparkles className="h-4 w-4 text-blue-400 flex-shrink-0" />
            <div className="flex-1 truncate">
              <p className="font-semibold text-white">Higgsfield Engine</p>
              <p className="text-[10px] text-slate-400">Dual model pipeline active</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center rounded-xl p-2 text-slate-400 hover:bg-[#121826] hover:text-white transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}
