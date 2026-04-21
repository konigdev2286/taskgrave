"use client"

import DriverSidebar from "@/components/driver-sidebar"
import { Bell, MapPin, Truck } from "lucide-react"
import Link from "next/link"
import { MobileNav } from "@/components/mobile-nav"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useDriverNotificationCount, useProfile } from "@/hooks/use-supabase"

export default function DriverLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [authChecked, setAuthChecked] = useState(false)
  const { count: notifCount } = useDriverNotificationCount()
  const [isOnline, setIsOnline] = useState(false)
  const { profile } = useProfile()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth/login')
      } else {
        setAuthChecked(true)
      }
    }
    checkAuth()
  }, [router])

  useEffect(() => {
    if (profile) setIsOnline(profile.is_online)
  }, [profile])

  const toggleOnline = async () => {
    const nextStatus = !isOnline
    setIsOnline(nextStatus)
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from('profiles')
      .update({ is_online: nextStatus })
      .eq('id', user.id)
  }

  // Live Location Tracking
  useEffect(() => {
    if (!isOnline) return

    const interval = setInterval(() => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) return
          
          await supabase.from('profiles').update({
            last_location_lat: pos.coords.latitude,
            last_location_lng: pos.coords.longitude
          }).eq('id', user.id)
        })
      }
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [isOnline])

  if (!authChecked) {
    return (
       <div className="h-screen flex items-center justify-center bg-white">
          <div className="w-12 h-12 border-4 border-brand-orange border-t-transparent rounded-full animate-spin" />
       </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-white">
      <DriverSidebar />
      <main className="flex-1 flex flex-col relative w-full overflow-x-hidden">
        {/* Driver Header */}
        <header className="h-16 md:h-20 bg-white/50 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40 px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3 lg:hidden">
             <div className="bg-brand-orange p-1.5 rounded-lg">
                <Truck className="w-4 h-4 text-white" />
             </div>
             <span className="text-lg font-black text-brand-blue italic tracking-tighter">J'ARRIVE</span>
          </div>

          <div className="flex items-center gap-4">
             <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full border border-gray-100">
                <MapPin className="text-brand-orange w-4 h-4" />
                <span className="text-xs font-bold text-slate-600">Brazzaville, Congo</span>
             </div>

             <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                <button 
                  onClick={toggleOnline}
                  className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isOnline ? 'bg-green-500 text-white shadow-lg shadow-green-200' : 'bg-white text-gray-400'}`}
                >
                  {isOnline ? 'En Ligne' : 'Hors Ligne'}
                </button>
             </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
             <button 
                onClick={() => router.push('/driver/missions')}
                className="relative p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
             >
                <Bell className="w-5 h-5" />
                {notifCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[9px] font-black rounded-full border-2 border-white flex items-center justify-center px-0.5 animate-pulse">
                    {notifCount}
                  </span>
                )}
             </button>
             <Link href="/driver/profil" className="flex items-center gap-2 md:gap-3 pl-2 md:pl-4 border-l border-gray-100 hover:opacity-80 transition-opacity">
                <div className="hidden sm:block text-right">
                   <p className="text-xs md:text-sm font-bold text-slate-900 truncate max-w-[100px]">{profile?.full_name || 'Livreur'}</p>
                   <p className={`text-[10px] font-black uppercase ${profile?.is_verified ? 'text-green-600' : 'text-gray-400'}`}>
                    {profile?.is_verified ? 'Certifié' : 'Non Vérifié'}
                   </p>
                </div>
                <div className="w-9 h-9 md:w-11 md:h-11 rounded-2xl bg-brand-orange flex items-center justify-center text-white font-black shadow-lg shadow-brand-orange/20 text-xs md:text-base">
                   {profile?.full_name?.[0] || 'L'}
                </div>
             </Link>
          </div>
        </header>

        {/* Driver Content */}
        <div className="p-4 md:p-8 pb-32 lg:pb-8">
          {children}
        </div>

        <MobileNav role="driver" />
      </main>
    </div>
  )
}
