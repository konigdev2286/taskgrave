"use client"

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Bell, Info, CheckCircle2, AlertCircle, X } from 'lucide-react'

type Notification = {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
}

export function RealTimeManager() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = (notif: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9)
    setNotifications(prev => [...prev, { ...notif, id }])
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 5000)
  }

  useEffect(() => {
    let missionSub: any = null
    let profileSub: any = null

    async function setupSubscriptions() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // 1. Get user role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!profile) return

      // 2. Watch missions
      missionSub = supabase
        .channel('global-mission-watch')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'missions' }, (payload) => {
          const newMission = payload.new as any
          const oldMission = payload.old as any

          // Logic for Client
          if (profile.role === 'client' && newMission.client_id === user.id) {
            if (payload.eventType === 'UPDATE') {
              if (oldMission.status !== 'accepted' && newMission.status === 'accepted') {
                addNotification({
                  title: 'Mission Acceptée !',
                  message: 'Un livreur a accepté votre colis.',
                  type: 'success'
                })
              }
              if (oldMission.status !== 'delivered' && newMission.status === 'delivered') {
                addNotification({
                  title: 'Colis Livré !',
                  message: 'Votre colis a été remis en main propre.',
                  type: 'success'
                })
              }
            }
          }

          // Logic for Driver
          if (profile.role === 'driver') {
             if (payload.eventType === 'INSERT' && newMission.status === 'pending') {
                addNotification({
                  title: 'Nouvelle Mission !',
                  message: `Une mission de type ${newMission.type} est disponible.`,
                  type: 'info'
                })
             }
             if (payload.eventType === 'UPDATE' && newMission.driver_id === user.id) {
                if (newMission.status === 'cancelled') {
                   addNotification({
                      title: 'Mission Annulée',
                      message: 'Le client a annulé la mission.',
                      type: 'error'
                   })
                }
             }
          }

          // Logic for Admin
          if (profile.role === 'admin') {
             if (payload.eventType === 'INSERT') {
                addNotification({
                   title: 'Nouvelle Commande',
                   message: `Commande #${newMission.id.slice(0,8)} enregistrée.`,
                   type: 'info'
                })
             }
          }
        })
        .subscribe()

      // 3. Watch profile changes (certification, etc.)
      profileSub = supabase
        .channel('global-profile-watch')
        .on('postgres_changes', { 
           event: 'UPDATE', 
           schema: 'public', 
           table: 'profiles', 
           filter: `id=eq.${user.id}` 
        }, (payload) => {
           const newProf = payload.new as any
           const oldProf = payload.old as any
           
           if (!oldProf.is_verified && newProf.is_verified) {
              addNotification({
                title: 'Compte Vérifié !',
                message: 'Votre compte a été validé par l\'administration.',
                type: 'success'
              })
           }
        })
        .subscribe()
    }

    setupSubscriptions()

    return () => {
      if (missionSub) supabase.removeChannel(missionSub)
      if (profileSub) supabase.removeChannel(profileSub)
    }
  }, [])

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-4 w-full max-w-sm">
      <AnimatePresence>
        {notifications.map((n) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`p-4 rounded-2xl shadow-2xl border flex gap-4 items-start backdrop-blur-md ${
              n.type === 'success' ? 'bg-green-50/90 border-green-200 text-green-900' :
              n.type === 'error' ? 'bg-red-50/90 border-red-200 text-red-900' :
              n.type === 'warning' ? 'bg-orange-50/90 border-orange-200 text-orange-900' :
              'bg-blue-50/90 border-blue-200 text-blue-900'
            }`}
          >
            <div className={`p-2 rounded-xl ${
              n.type === 'success' ? 'bg-green-100 text-green-600' :
              n.type === 'error' ? 'bg-red-100 text-red-600' :
              n.type === 'warning' ? 'bg-orange-100 text-orange-600' :
              'bg-blue-100 text-brand-blue'
            }`}>
              {n.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
              {n.type === 'error' && <AlertCircle className="w-5 h-5" />}
              {n.type === 'warning' && <AlertCircle className="w-5 h-5" />}
              {n.type === 'info' && <Bell className="w-5 h-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-black leading-tight mb-1">{n.title}</h4>
              <p className="text-xs font-medium opacity-80 leading-relaxed">{n.message}</p>
            </div>
            <button 
              onClick={() => setNotifications(prev => prev.filter(item => item.id !== n.id))}
              className="p-1 hover:bg-black/5 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 opacity-40" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
