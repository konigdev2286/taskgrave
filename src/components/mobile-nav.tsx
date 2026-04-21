"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  Package, 
  MapPin, 
  History, 
  Settings,
  PlusCircle,
  Menu,
  MessageCircle,
  ShieldCheck,
  BarChart3,
  Bot
} from "lucide-react"
import { Button } from "@/components/ui/button"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export function MobileNav({ role }: { role: 'client' | 'driver' | 'admin' }) {
  const pathname = usePathname()
  const router = useRouter()
  const [showMenu, setShowMenu] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  const clientLinks = [
    { name: "Accueil", href: "/client", icon: LayoutDashboard },
    { name: "Chat", href: "/client/chat", icon: MessageCircle },
    { name: "Commander", href: "/client/commander", icon: PlusCircle, primary: true },
    { name: "Suivi", href: "/client/suivi", icon: MapPin },
    { name: "Menu", href: "#", icon: Menu, isMenu: true },
  ]

  const driverLinks = [
    { name: "Dashboard", href: "/driver", icon: LayoutDashboard },
    { name: "Chat", href: "/driver/chat", icon: MessageCircle },
    { name: "Active", href: "/driver/mission-active", icon: MapPin, primary: true },
    { name: "Argent", href: "/driver/portefeuille", icon: History },
    { name: "Menu", href: "#", icon: Menu, isMenu: true },
  ]

  const adminLinks = [
    { name: "Admin", href: "/admin", icon: LayoutDashboard },
    { name: "Bot", href: "/admin/bot", icon: Bot },
    { name: "Vérifier", href: "/admin/verifications", icon: ShieldCheck, primary: true },
    { name: "Live", href: "/admin/live", icon: MapPin },
    { name: "Menu", href: "#", icon: Menu, isMenu: true },
  ]

  const links = role === 'admin' ? adminLinks : role === 'driver' ? driverLinks : clientLinks

  return (
    <>
      {/* Menu Popup Overlay */}
      {showMenu && (
        <div className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm flex items-end justify-center p-6 pb-32">
           <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl p-8 space-y-4 animate-in slide-in-from-bottom-10 fade-in duration-300">
              <h3 className="text-xl font-black text-slate-900 mb-6">Mon Compte</h3>
              
              <Link 
                href={`/${role}/profil`} 
                onClick={() => setShowMenu(false)}
                className="flex items-center gap-4 p-5 hover:bg-gray-50 rounded-2xl transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center">
                   <LayoutDashboard className="w-6 h-6" />
                </div>
                <div className="flex-1">
                   <p className="font-bold text-slate-900">Mon Profil</p>
                   <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Voir mes informations</p>
                </div>
              </Link>

              <Link 
                href={`/${role}/parametres`} 
                onClick={() => setShowMenu(false)}
                className="flex items-center gap-4 p-5 hover:bg-gray-50 rounded-2xl transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center">
                   <Settings className="w-6 h-6" />
                </div>
                <div className="flex-1">
                   <p className="font-bold text-slate-900">Paramètres</p>
                   <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Configuration de l'app</p>
                </div>
              </Link>

              <div className="h-px bg-gray-100 my-2" />

              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-4 p-5 hover:bg-red-50 rounded-2xl transition-colors text-red-500"
              >
                <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
                   <History className="w-6 h-6 rotate-180" />
                </div>
                <div className="flex-1 text-left">
                   <p className="font-bold">Déconnexion</p>
                   <p className="text-[10px] opacity-60 font-bold uppercase tracking-widest">Quitter ma session</p>
                </div>
              </button>

              <Button 
                variant="ghost" 
                className="w-full h-14 rounded-2xl font-black text-slate-400 uppercase tracking-widest"
                onClick={() => setShowMenu(false)}
              >
                Fermer
              </Button>
           </div>
        </div>
      )}

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 lg:hidden w-[90%] max-w-md">
         <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 p-2 rounded-3xl shadow-2xl flex items-center justify-around">
            {links.map((link) => {
              const isActive = pathname === link.href || (link.isMenu && showMenu)
              
              if (link.primary) {
                return (
                  <Link key={link.name} href={link.href} className="relative -top-4">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl transition-all active:scale-90",
                      role === 'driver' ? "bg-brand-orange" : "bg-brand-blue"
                    )}>
                      <link.icon className="w-7 h-7 text-white" />
                    </div>
                  </Link>
                )
              }

              return (
                <button 
                  key={link.name} 
                  onClick={() => link.isMenu ? setShowMenu(!showMenu) : router.push(link.href)}
                  className="flex flex-col items-center gap-1 px-3 py-1 bg-transparent border-none"
                >
                  <link.icon className={cn(
                    "w-5 h-5 transition-colors",
                    isActive ? "text-brand-orange" : "text-gray-400"
                  )} />
                  <span className={cn(
                    "text-[9px] font-black uppercase tracking-widest transition-colors",
                    isActive ? "text-white" : "text-gray-500"
                  )}>{link.name}</span>
                </button>
              )
            })}
         </div>
      </div>
    </>
  )
}
