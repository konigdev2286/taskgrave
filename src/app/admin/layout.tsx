"use client"

import AdminSidebar from "@/components/admin-sidebar"
import { Bell, Search, Globe, Truck } from "lucide-react"
import { Input } from "@/components/ui/input"
import { MobileNav } from "@/components/mobile-nav"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-white">
      <AdminSidebar />
      <main className="flex-1 flex flex-col relative text-slate-900 w-full overflow-x-hidden">
        {/* Admin Header */}
        <header className="h-16 md:h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40 px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3 lg:hidden">
             <div className="bg-brand-blue p-1.5 rounded-lg">
                <Truck className="w-4 h-4 text-white" />
             </div>
             <span className="text-lg font-black text-brand-blue italic tracking-tighter uppercase">ADMIN</span>
          </div>

          <div className="hidden md:flex items-center gap-6">
             <div className="relative w-64 lg:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input className="pl-10 h-10 bg-gray-50 border-none rounded-full" placeholder="Rechercher..." />
             </div>
             <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full border border-green-100">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">OK</span>
             </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
             <div className="hidden sm:flex items-center gap-1 mr-2 md:mr-4">
                <Globe className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-bold text-gray-500">BZV</span>
             </div>
             <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-brand-orange rounded-full border-2 border-white" />
             </button>
             <div className="flex items-center gap-2 md:gap-3 pl-2 md:pl-4 border-l border-gray-100">
                <div className="hidden sm:block text-right">
                   <p className="text-xs md:text-sm font-bold truncate max-w-[100px]">Admin</p>
                   <p className="text-[10px] text-brand-blue font-black uppercase tracking-tighter">Super</p>
                </div>
                <div className="w-9 h-9 md:w-11 md:h-11 rounded-full bg-slate-900 flex items-center justify-center text-white font-black shadow-lg text-xs md:text-base">
                   A
                </div>
             </div>
          </div>
        </header>

        {/* Admin Content */}
        <div className="p-4 md:p-8 bg-gray-50/30 flex-1 pb-32 lg:pb-8">
          {children}
        </div>

        <MobileNav role="admin" />
      </main>
    </div>
  )
}
