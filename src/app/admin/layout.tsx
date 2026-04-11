"use client"

import AdminSidebar from "@/components/admin-sidebar"
import { Bell, Search, Truck } from "lucide-react"
import { Input } from "@/components/ui/input"
import { MobileNav } from "@/components/mobile-nav"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth/login')
      } else {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()
        
        if (profile?.role !== 'admin') {
           router.push('/auth/login')
        } else {
          setAuthChecked(true)
        }
      }
    }
    checkAuth()
  }, [router])

  if (!authChecked) {
    return (
       <div className="h-screen flex items-center justify-center bg-white">
          <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
       </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-white">
      <AdminSidebar />
      <main className="flex-1 flex flex-col relative w-full overflow-x-hidden">
        {/* Admin Header */}
        <header className="h-16 md:h-20 bg-white/50 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40 px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3 lg:hidden">
             <div className="bg-brand-orange p-1.5 rounded-lg">
                <Truck className="w-4 h-4 text-white" />
             </div>
             <span className="text-lg font-black text-brand-blue italic tracking-tighter">J'ARRIVE</span>
          </div>

          <div className="hidden md:block relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input className="pl-10 h-10 bg-gray-50 border-none rounded-full" placeholder="Rechercher..." />
          </div>

          <div className="flex items-center gap-2 md:gap-4">
             <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-brand-orange rounded-full border-2 border-white" />
             </button>
             <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
                <div className="hidden sm:block text-right">
                   <p className="text-sm font-bold text-slate-900">Admin</p>
                   <p className="text-[10px] text-brand-blue font-black uppercase tracking-widest leading-none">Super User</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-900 font-bold border border-gray-100">
                   A
                </div>
             </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-4 md:p-8 pb-32 lg:pb-8">
           {children}
        </div>

        <MobileNav role="admin" />
      </main>
    </div>
  )
}
