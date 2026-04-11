"use client"

import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Search, MapPin, Truck, Package, Loader2, Info, Clock, CheckCircle } from "lucide-react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { supabase } from "@/lib/supabase"

export default function SuiviPage() {
  const [trackingId, setTrackingId] = useState("")
  const [loading, setLoading] = useState(false)
  const [mission, setMission] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!trackingId) return

    setLoading(true)
    setError(null)
    setMission(null)

    try {
      const { data, error: supabaseError } = await supabase
        .from('missions')
        .select(`
          *,
          driver:driver_id (full_name)
        `)
        .or(`id.eq.${trackingId},id.ilike.${trackingId}%`)
        .maybeSingle()

      if (supabaseError) throw supabaseError
      if (!data) {
        setError("Aucun colis trouvé avec cet identifiant.")
      } else {
        setMission(data)
      }
    } catch (err) {
      setError("Une erreur est survenue lors de la recherche.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
             <motion.div 
               initial={{ opacity: 0, scale: 0.9 }} 
               animate={{ opacity: 1, scale: 1 }}
               className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-blue/10 text-brand-blue rounded-full text-[10px] font-black uppercase tracking-widest mb-6"
             >
                <Search className="w-3 h-3" /> Tracking en Direct
             </motion.div>
             <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6">Suivez votre <span className="text-brand-orange">colis</span></h1>
             <p className="text-gray-500 font-medium">Entrez l'identifiant de votre mission pour voir où elle se trouve en temps réel.</p>
          </div>

          <form onSubmit={handleTrack} className="mb-16">
             <div className="relative group max-w-2xl mx-auto">
                <Input 
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  placeholder="ID de la mission (Ex: 8a2f...)" 
                  className="h-16 md:h-20 pl-8 pr-48 rounded-[30px] border-2 border-gray-100 bg-white shadow-xl shadow-brand-blue/5 text-lg font-bold transition-all focus:border-brand-blue focus:ring-0"
                />
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="absolute right-2 top-2 bottom-2 bg-brand-blue hover:bg-brand-blue-dark text-white px-8 rounded-[24px] font-black text-lg transition-transform active:scale-95"
                >
                   {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Localiser"}
                </Button>
             </div>
          </form>

          <AnimatePresence mode="wait">
             {error && (
               <motion.div 
                 initial={{ opacity: 0, y: 10 }} 
                 animate={{ opacity: 1, y: 0 }} 
                 exit={{ opacity: 0 }}
                 className="p-6 bg-red-50 border border-red-100 rounded-3xl text-red-600 font-bold text-center flex items-center justify-center gap-3"
               >
                  <Info className="w-5 h-5" /> {error}
               </motion.div>
             )}

             {mission && (
               <motion.div 
                 initial={{ opacity: 0, y: 20 }} 
                 animate={{ opacity: 1, y: 0 }} 
                 className="space-y-8"
               >
                  <Card className="border-none shadow-premium bg-white p-8 rounded-[40px]">
                     <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 pb-8 border-b border-gray-50">
                        <div>
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">ID Colis</p>
                           <h2 className="text-xl font-black text-slate-900">#{mission.id.slice(0, 8).toUpperCase()}</h2>
                        </div>
                        <div className="text-right">
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Statut Actuel</p>
                           <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                             mission.status === 'delivered' ? 'bg-green-50 text-green-600' : 'bg-brand-blue text-white animate-pulse'
                           }`}>
                              {mission.status === 'pending' ? 'En attente' :
                               mission.status === 'accepted' ? 'Assigné' :
                               mission.status === 'picked_up' ? 'En transit' : 'Livré'}
                           </span>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-8">
                           <div className="flex gap-4">
                              <div className="flex flex-col items-center">
                                 <div className="w-5 h-5 rounded-full border-4 border-brand-blue bg-white" />
                                 <div className="w-0.5 h-16 bg-dashed border-l-2 border-dashed border-gray-200 my-1" />
                                 <MapPin className="text-brand-orange w-5 h-5" />
                              </div>
                              <div className="flex-1 space-y-10">
                                 <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Origine</p>
                                    <p className="font-bold text-slate-900">{mission.origin_address}</p>
                                 </div>
                                 <div className="pt-2">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Destination</p>
                                    <p className="font-bold text-slate-900">{mission.dest_address}</p>
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div className="bg-gray-50 rounded-[32px] p-8 space-y-6">
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                                 <Truck className="w-6 h-6 text-brand-blue" />
                              </div>
                              <div>
                                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Livreur</p>
                                 <p className="font-black text-slate-900">{mission.driver?.full_name || "Assignation en cours..."}</p>
                              </div>
                           </div>
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                                 <Package className="w-6 h-6 text-brand-orange" />
                              </div>
                              <div>
                                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Type de service</p>
                                 <p className="font-black text-slate-900 capitalize">{mission.type}</p>
                              </div>
                           </div>
                        </div>
                     </div>
                  </Card>

                  {/* Visual Tracker */}
                  <div className="bg-slate-900 rounded-[50px] p-12 text-white relative overflow-hidden">
                     <h3 className="text-xl font-black mb-10 text-center">Progression de la livraison</h3>
                     <div className="relative flex justify-between items-center max-w-2xl mx-auto">
                        <div className="absolute h-1 bg-white/10 left-0 right-0 top-1/2 -translate-y-1/2 -z-0" />
                        
                        {[
                          { status: 'pending', label: 'Dépôt', icon: Clock },
                          { status: 'accepted', label: 'Assigné', icon: CheckCircle },
                          { status: 'picked_up', label: 'Transit', icon: Package },
                          { status: 'delivered', label: 'Arrivé', icon: MapPin }
                        ].map((s, i) => {
                          const statusOrder = ['pending', 'accepted', 'picked_up', 'delivered']
                          const isDone = statusOrder.indexOf(mission.status) >= statusOrder.indexOf(s.status)
                          const isCurrent = mission.status === s.status

                          return (
                            <div key={s.status} className="flex flex-col items-center gap-4 relative z-10">
                               <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                                 isDone ? 'bg-brand-orange text-white scale-110' : 'bg-slate-800 text-slate-500'
                               } ${isCurrent ? 'ring-4 ring-brand-orange/20 animate-pulse' : ''}`}>
                                  <s.icon className="w-5 h-5" />
                               </div>
                               <span className={`text-[10px] font-black uppercase tracking-widest ${isDone ? 'text-white' : 'text-slate-500'}`}>{s.label}</span>
                            </div>
                          )
                        })}
                     </div>
                  </div>
               </motion.div>
             )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
