"use client"

import { useNotifications } from "@/hooks/use-supabase"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, Package, Info, MapPin, CheckCircle2, ChevronRight, MessageSquare, Trash2, Loader2, Sparkles, Truck } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const NOTIF_ICONS = {
  info: Info,
  success: CheckCircle2,
  warning: Bell,
  error: Bell,
}

const NOTIF_COLORS = {
  info: "text-blue-500 bg-blue-50",
  success: "text-green-500 bg-green-50",
  warning: "text-orange-500 bg-orange-50",
  error: "text-red-500 bg-red-50",
}

export default function ClientNotifications() {
  const { notifications, loading, markAsRead } = useNotifications()

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-brand-blue animate-spin" />
        <p className="mt-4 text-gray-500 font-bold uppercase tracking-widest text-xs">Chargement de vos alertes...</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Notifications</h1>
          <p className="text-gray-500 font-medium tracking-tight">Suivez l'état de vos commandes en temps réel</p>
        </div>
        <div className="relative">
           <div className="absolute -inset-1 bg-gradient-to-r from-brand-blue to-brand-orange rounded-full blur opacity-25" />
           <div className="relative bg-white p-4 rounded-full shadow-xl">
              <Bell className="w-6 h-6 text-brand-blue" />
              {notifications.some(n => !n.is_read) && (
                <span className="absolute top-3 right-3 w-3 h-3 bg-red-500 border-2 border-white rounded-full" />
              )}
           </div>
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {notifications.length === 0 ? (
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="text-center py-20 bg-gray-50/50 rounded-[40px] border-2 border-dashed border-gray-100"
            >
               <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" />
               <h3 className="text-xl font-black text-slate-400">Tout est calme ici</h3>
               <p className="text-gray-400 text-sm font-medium">Vos futures notifications d'expédition apparaîtront ici.</p>
            </motion.div>
          ) : (
            notifications.map((notif, i) => {
              const Icon = NOTIF_ICONS[notif.type as keyof typeof NOTIF_ICONS] || Info
              return (
                <motion.div
                  key={notif.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => !notif.is_read && markAsRead(notif.id)}
                >
                  <Card className={`group relative transition-all cursor-pointer rounded-[32px] overflow-hidden border-2 ${
                    notif.is_read ? 'bg-white border-transparent' : 'bg-blue-50/20 border-blue-100 shadow-lg shadow-blue-500/5'
                  }`}>
                    <CardContent className="p-6 flex gap-6 items-start">
                      <div className={`p-4 rounded-2xl shrink-0 ${NOTIF_COLORS[notif.type as keyof typeof NOTIF_COLORS] || NOTIF_COLORS.info}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      
                      <div className="flex-1 space-y-2">
                         <div className="flex justify-between items-start">
                            <h3 className={`font-black tracking-tight ${notif.is_read ? 'text-slate-600' : 'text-slate-900 text-lg'}`}>
                               {notif.title}
                            </h3>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full">
                               {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                         </div>
                         <p className={`text-sm font-medium leading-relaxed ${notif.is_read ? 'text-gray-400' : 'text-slate-600'}`}>
                            {notif.message}
                         </p>

                         {/* Quick Actions contextuelle */}
                         <div className="pt-2 flex gap-3">
                            {notif.link && (
                                <Link href={notif.link}>
                                    <Button size="sm" className="h-9 px-4 rounded-xl font-bold bg-slate-900 hover:bg-slate-800 text-white text-xs shadow-md">
                                       Détails <ChevronRight className="ml-1 w-3 h-3" />
                                    </Button>
                                </Link>
                            )}
                            {!notif.is_read && (
                                <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="h-9 px-4 rounded-xl font-bold text-xs text-brand-blue"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        markAsRead(notif.id);
                                    }}
                                >
                                    Marquer comme lu
                                </Button>
                            )}
                         </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-200 self-center group-hover:text-brand-blue transition-colors" />
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })
          )}
        </AnimatePresence>
      </div>

      <Card className="mt-12 border-none bg-slate-900 p-8 rounded-[40px] text-white overflow-hidden relative group">
          <div className="relative z-10 flex gap-6 items-center">
              <div className="hidden md:flex w-16 h-16 bg-white/10 rounded-2xl items-center justify-center shrink-0">
                  <MessageSquare className="w-8 h-8 text-brand-orange" />
              </div>
              <div>
                  <h4 className="text-xl font-black mb-1">Centre de Support</h4>
                  <p className="text-white/60 text-sm font-medium">Une question sur une notification ? Discutez en direct avec nos agents.</p>
              </div>
              <Link href="/client/chat" className="ml-auto">
                <Button className="bg-brand-orange hover:bg-orange-600 text-white font-black px-8 h-12 rounded-2xl shadow-lg shadow-brand-orange/20 border-none transition-transform active:scale-95">Chat En Direct</Button>
              </Link>
          </div>
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-brand-orange/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
      </Card>
    </div>
  )
}
