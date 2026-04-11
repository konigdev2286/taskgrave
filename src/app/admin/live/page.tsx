"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Truck, MapPin, Clock, CheckCircle2, AlertCircle, Search, Filter, Mail, Phone, ExternalLink } from "lucide-react"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { motion, AnimatePresence } from "framer-motion"

export default function AdminLive() {
  const [missions, setMissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMissions()
    
    const channel = supabase
      .channel('admin-live-feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'missions' }, (payload) => {
        fetchMissions()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchMissions = async () => {
    const { data } = await supabase
      .from('missions')
      .select(`
        *,
        client:client_id (full_name, phone),
        driver:driver_id (full_name, phone)
      `)
      .order('created_at', { ascending: false })
      .limit(20)
    
    setMissions(data || [])
    setLoading(false)
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-end">
        <div>
           <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
              <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Live Monitor</span>
           </div>
           <h1 className="text-3xl font-black text-slate-900 tracking-tight">Activités en Temps Réel</h1>
           <p className="text-gray-500 font-medium">Surveillance globale de la flotte et des commandes</p>
        </div>
        <div className="flex gap-4">
           <div className="px-6 py-3 bg-white border border-gray-100 shadow-sm rounded-2xl flex items-center gap-4">
              <div className="text-right">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Missions Actives</p>
                 <p className="text-xl font-black text-brand-blue">{missions.filter(m => m.status !== 'delivered').length}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center">
                 <Truck className="w-5 h-5" />
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
         <AnimatePresence mode="popLayout">
            {missions.map((mission, i) => (
              <motion.div
                key={mission.id}
                layout
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className={`border-none shadow-premium transition-all ${
                  mission.status === 'pending' ? 'bg-orange-50/30 ring-1 ring-orange-100' : 'bg-white'
                }`}>
                   <CardContent className="p-0">
                      <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-gray-100/50">
                         {/* Status & ID */}
                         <div className="p-6 lg:w-48 flex flex-col justify-between items-start gap-4">
                            <Badge className={`uppercase text-[10px] font-black tracking-widest ${
                              mission.status === 'delivered' ? 'bg-green-100 text-green-700' :
                              mission.status === 'pending' ? 'bg-brand-orange text-white' : 'bg-brand-blue text-white'
                            }`}>
                               {mission.status === 'pending' ? 'En attente' :
                                mission.status === 'accepted' ? 'Assigné' :
                                mission.status === 'picked_up' ? 'Transit' : 'Livré'}
                            </Badge>
                            <div>
                               <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">ID Commande</p>
                               <p className="text-sm font-black text-slate-900">#{mission.id.slice(0, 8).toUpperCase()}</p>
                            </div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">{new Date(mission.created_at).toLocaleTimeString()}</p>
                         </div>

                         {/* Itinerary */}
                         <div className="p-6 flex-1 space-y-4">
                            <div className="flex items-center gap-6">
                               <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-lg">
                                  <span className="text-[10px] font-black text-slate-400">TYPE:</span>
                                  <span className="text-[10px] font-black text-slate-900 uppercase">{mission.type}</span>
                               </div>
                               <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-lg">
                                  <span className="text-[10px] font-black text-slate-400">PRIX:</span>
                                  <span className="text-[10px] font-black text-slate-900">{mission.price_fcfa.toLocaleString()} FCFA</span>
                               </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                               <div className="flex gap-4">
                                  <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                                     <MapPin className="w-4 h-4 text-brand-blue" />
                                  </div>
                                  <div className="min-w-0">
                                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Point de Départ</p>
                                     <p className="text-sm font-bold text-slate-900 truncate">{mission.origin_address}</p>
                                  </div>
                               </div>
                               <div className="flex gap-4">
                                  <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                                     <MapPin className="w-4 h-4 text-brand-orange" />
                                  </div>
                                  <div className="min-w-0">
                                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Destination</p>
                                     <p className="text-sm font-bold text-slate-900 truncate">{mission.dest_address}</p>
                                  </div>
                               </div>
                            </div>
                         </div>

                         {/* Parties */}
                         <div className="p-6 lg:w-80 space-y-4">
                            <div className="flex items-center justify-between">
                               <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black border border-gray-100">C</div>
                                  <div>
                                     <p className="text-xs font-black text-slate-900">{mission.client?.full_name || 'Client'}</p>
                                     <p className="text-[10px] text-gray-400 font-bold">{mission.client?.phone || 'Pas de numéro'}</p>
                                  </div>
                               </div>
                               <ExternalLink className="w-4 h-4 text-gray-300" />
                            </div>
                            <div className="flex items-center justify-between">
                               <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black border border-gray-100 ${
                                    mission.driver_id ? 'bg-orange-100 text-brand-orange' : 'bg-gray-50 text-gray-300 border-dashed'
                                  }`}>
                                     {mission.driver_id ? 'L' : '?'}
                                  </div>
                                  <div>
                                     <p className="text-xs font-black text-slate-900">{mission.driver?.full_name || 'Non assigné'}</p>
                                     <p className="text-[10px] text-gray-400 font-bold">{mission.driver_id ? mission.driver?.phone : 'Recherche...'}</p>
                                  </div>
                               </div>
                               <ExternalLink className="w-4 h-4 text-gray-300" />
                            </div>
                         </div>
                      </div>
                   </CardContent>
                </Card>
              </motion.div>
            ))}
         </AnimatePresence>
      </div>
    </div>
  )
}
