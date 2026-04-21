"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Truck, MapPin, Clock, CheckCircle2, AlertCircle, Search, Filter, Mail, Phone, ExternalLink, UserPlus, Zap } from "lucide-react"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { motion, AnimatePresence } from "framer-motion"

import { TrackingMap } from "@/components/tracking-map"

export default function AdminLive() {
  const [missions, setMissions] = useState<any[]>([])
  const [drivers, setDrivers] = useState<any[]>([])
  const [assigningId, setAssigningId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const [dataSaver, setDataSaver] = useState(false)

  useEffect(() => {
    // Detect mobile data / data saver mode
    if (typeof navigator !== 'undefined' && (navigator as any).connection) {
      const conn = (navigator as any).connection;
      if (conn.saveData || conn.effectiveType === '2g' || conn.effectiveType === '3g') {
        setDataSaver(true);
        setViewMode('list');
      }
    }
  }, [])

  useEffect(() => {
    fetchMissions()
    fetchVerifiedDrivers()
    
    // If data saver is active, we might want to poll less frequently instead of pure realtime
    // but for now, we'll keep realtime and just warn the user.
    const channel = supabase
      .channel('admin-live-feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'missions' }, (payload) => {
        fetchMissions()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [dataSaver])

  const fetchVerifiedDrivers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'driver')
      .eq('is_verified', true)
    setDrivers(data || [])
  }

  const handleAssign = async (missionId: string, driverId: string) => {
    try {
      setAssigningId(missionId)
      const { error } = await supabase
        .from('missions')
        .update({
          driver_id: driverId,
          status: 'accepted' // 'accepted' signifies the mission is taken
        })
        .eq('id', missionId)
      
      if (error) throw error
    } catch (e: any) {
      alert("Erreur lors de l'assignation: " + e.message)
    } finally {
      setAssigningId(null)
    }
  }

  const fetchMissions = async () => {
    const { data } = await supabase
      .from('missions')
      .select(`
        *,
        client:client_id (full_name, phone),
        driver:driver_id (full_name, phone)
      `)
      .order('created_at', { ascending: false })
      .limit(dataSaver ? 10 : 20) // Limit items on low data
    
    setMissions(data || [])
    setLoading(false)
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Live Monitor</span>
              </div>
              {dataSaver && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 text-brand-blue rounded-lg border border-blue-100">
                  <Zap className="w-3 h-3 fill-current" />
                  <span className="text-[9px] font-black uppercase tracking-wider">Mode Éco Actif</span>
                </div>
              )}
           </div>
           <h1 className="text-3xl font-black text-slate-900 tracking-tight">Activités en Temps Réel</h1>
           <p className="text-gray-500 font-medium text-sm">Surveillance globale de la flotte et des commandes</p>
        </div>
        <div className="flex flex-wrap gap-4 items-center">
           <div className="flex bg-gray-100 p-1 rounded-2xl overflow-hidden">
              <Button 
                variant={(viewMode === 'list' ? 'default' : 'ghost') as any} 
                className={`rounded-xl h-10 px-6 font-black text-xs uppercase tracking-widest transition-all ${viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm hover:bg-white' : 'text-gray-400 hover:text-slate-600'}`}
                onClick={() => setViewMode('list')}
              >Liste</Button>
              <Button 
                variant={(viewMode === 'map' ? 'default' : 'ghost') as any} 
                className={`rounded-xl h-10 px-6 font-black text-xs uppercase tracking-widest transition-all ${viewMode === 'map' ? 'bg-white text-slate-900 shadow-sm hover:bg-white' : 'text-gray-400 hover:text-slate-600'}`}
                onClick={() => setViewMode('map')}
              >Carte Live</Button>
           </div>

           <button 
             onClick={() => setDataSaver(!dataSaver)}
             className={`p-2.5 rounded-2xl border-2 transition-all ${dataSaver ? 'bg-blue-50 border-brand-blue text-brand-blue' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'}`}
             title={dataSaver ? "Désactiver l'économie de données" : "Activer l'économie de données"}
           >
              <Zap className={`w-5 h-5 ${dataSaver ? 'fill-current' : ''}`} />
           </button>

           <div className="hidden sm:flex px-6 py-2.5 bg-white border border-gray-100 shadow-premium rounded-2xl items-center gap-4">
              <div className="text-right">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Actives</p>
                 <p className="text-xl font-black text-brand-blue">{missions.filter(m => m.status !== 'delivered').length}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center">
                 <Truck className="w-5 h-5" />
              </div>
           </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'map' ? (
          <motion.div 
            key="map-view"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="h-[600px] rounded-[40px] overflow-hidden shadow-premium border-4 border-white"
          >
             {/* Note: This simplified map shows the most recent active mission, 
                 In a full impl, we would loop over all active missions inside TrackingMap or similar */}
             <TrackingMap 
                originAddress={missions[0]?.origin_address}
                destAddress={missions[0]?.dest_address}
                status={missions[0]?.status}
             />
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
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
                                {mission.proof_image_url && (
                                   <a href={mission.proof_image_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-lg text-[10px] font-black">
                                      PREUVE ✓
                                   </a>
                                )}
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
                                {mission.status === 'pending' && !mission.driver_id ? (
                                   <Dialog>
                                     <DialogTrigger asChild>
                                       <button className="text-[10px] px-3 py-1.5 bg-slate-900 text-white rounded-lg font-bold shadow-md hover:scale-105 active:scale-95 transition-all outline-none flex items-center gap-1">
                                         <UserPlus className="w-3 h-3" /> Assigner
                                       </button>
                                     </DialogTrigger>
                                     <DialogContent className="sm:max-w-md border-none shadow-premium rounded-[32px] p-6 bg-white overflow-hidden">
                                       <DialogHeader>
                                         <DialogTitle className="text-xl font-black text-slate-900">Assigner un Livreur</DialogTitle>
                                         <p className="text-sm text-gray-500 font-medium">Sélectionnez un partenaire disponible pour la commande #{mission.id.slice(0, 8)}</p>
                                       </DialogHeader>
                                       <div className="space-y-4 mt-6 max-h-72 overflow-y-auto pr-2">
                                         {drivers.length === 0 ? (
                                           <p className="text-sm text-gray-400 font-bold text-center py-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">Aucun livreur vérifié disponible.</p>
                                         ) : (
                                           drivers.map(driver => (
                                             <div key={driver.id} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100 hover:bg-white hover:shadow-lg hover:border-brand-orange/20 transition-all group">
                                               <div className="flex items-center gap-3">
                                                 <div className="w-10 h-10 bg-brand-orange/10 text-brand-orange rounded-xl flex items-center justify-center font-black">
                                                   {driver.full_name?.charAt(0) || '?'}
                                                 </div>
                                                 <div>
                                                   <p className="text-sm font-black text-slate-900">{driver.full_name}</p>
                                                   <p className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                                                     <Phone className="w-3 h-3" /> {driver.phone || 'Non renseigné'}
                                                   </p>
                                                 </div>
                                               </div>
                                               <button 
                                                 disabled={assigningId === mission.id}
                                                 onClick={() => handleAssign(mission.id, driver.id)}
                                                 className="opacity-0 group-hover:opacity-100 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black shadow-lg transition-all hover:bg-brand-orange disabled:opacity-50"
                                               >
                                                 Choisir
                                               </button>
                                             </div>
                                           ))
                                         )}
                                       </div>
                                     </DialogContent>
                                   </Dialog>
                                ) : (
                                   <ExternalLink className="w-4 h-4 text-gray-300" />
                                )}
                             </div>
                          </div>
                       </div>
                    </CardContent>
                 </Card>
               </motion.div>
             ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
