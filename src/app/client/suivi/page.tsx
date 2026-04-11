"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Truck, Phone, MessageCircle, Clock, CheckCircle2, Loader2, Package } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

export default function SuiviPage() {
  const [mission, setMission] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLatestMission()

    const channel = supabase
      .channel('client:missions')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'missions' }, (payload) => {
        if (mission && payload.new.id === mission.id) {
          setMission((prev: any) => ({ ...prev, ...payload.new }))
        } else {
           fetchLatestMission()
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [mission?.id])

  const fetchLatestMission = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('missions')
        .select(`
          *,
          driver:driver_id (
            full_name,
            phone,
            avatar_url
          )
        `)
        .eq('client_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error) {
        if (error.code !== 'PGRST116') throw error
      } else {
        setMission(data)
      }
    } catch (error) {
      console.error("Error fetching latest mission:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
     return (
       <div className="flex flex-col items-center justify-center h-[60vh]">
          <Loader2 className="w-10 h-10 text-brand-blue animate-spin" />
          <p className="mt-4 text-gray-500 font-bold">Localisation de votre commande...</p>
       </div>
     )
  }

  if (!mission || mission.status === 'delivered' || mission.status === 'cancelled') {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
        <div className="bg-gray-100 p-6 rounded-full">
           <Package className="w-12 h-12 text-gray-400" />
        </div>
        <div>
           <h2 className="text-2xl font-black text-slate-900">Aucune commande en cours</h2>
           <p className="text-gray-500">Passez une commande pour commencer le suivi.</p>
        </div>
        <Link href="/client/commander">
           <Button className="bg-brand-blue font-bold px-8">Commander maintenant</Button>
        </Link>
      </div>
    )
  }

  const steps = [
    { id: 'pending', label: 'En attente', desc: 'Recherche d\'un livreur...', icon: Clock, color: 'bg-yellow-500' },
    { id: 'accepted', label: 'Confirmé', desc: 'Le livreur arrive au point de départ', icon: CheckCircle2, color: 'bg-brand-blue' },
    { id: 'picked_up', label: 'En transit', desc: 'Le colis est en route vers vous', icon: Truck, color: 'bg-brand-orange' },
    { id: 'delivered', label: 'Livré', desc: 'Commande terminée', icon: CheckCircle2, color: 'bg-green-500' }
  ]

  const currentStepIndex = steps.findIndex(s => s.id === mission.status)

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-6 bg-white">
      <div className="flex justify-between items-center px-2">
         <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Suivi en temps réel</h1>
            <p className="text-gray-500 font-medium">Commande #{mission.id.slice(0, 8)} • État : {steps[currentStepIndex]?.label || mission.status}</p>
         </div>
         <Button variant="outline" className="border-brand-blue text-brand-blue font-bold rounded-2xl">Signaler un problème</Button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 min-h-0">
         <div className="flex-1 bg-white rounded-[40px] relative overflow-hidden shadow-premium border border-gray-100">
            <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=Brazzaville,Congo&zoom=14&size=800x800&style=feature:all|element:labels|visibility:off')] bg-cover opacity-30 grayscale-[0.8]" />
            
            <svg className="absolute inset-0 h-full w-full pointer-events-none">
               <motion.path 
                 d="M 200 400 Q 400 350 600 200"
                 stroke="url(#grad)" 
                 strokeWidth="6" 
                 fill="none" 
                 strokeDasharray="10 10"
                 initial={{ strokeDashoffset: 100 }}
                 animate={{ strokeDashoffset: 0 }}
                 transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
               />
               <defs>
                 <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                   <stop offset="0%" stopColor="#007BFF" />
                   <stop offset="100%" stopColor="#FF6600" />
                 </linearGradient>
               </defs>
            </svg>

            <motion.div 
              animate={{ x: [200, 600], y: [400, 200] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute z-10"
            >
               <div className="relative">
                  <div className="absolute -inset-6 bg-brand-orange/20 rounded-full animate-ping" />
                  <div className="bg-brand-orange p-3 rounded-full shadow-2xl relative border-4 border-white">
                     <Truck className="w-6 h-6 text-white" />
                  </div>
               </div>
            </motion.div>

            <div className="absolute bottom-8 left-8 bg-white/95 backdrop-blur-md p-6 rounded-3xl shadow-2xl border border-white/20 max-w-sm">
               <div className="flex gap-4 items-center">
                  <div className="bg-brand-blue/10 p-3 rounded-2xl">
                     <MapPin className="text-brand-blue w-6 h-6" />
                  </div>
                  <div>
                     <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1">Destination</p>
                     <p className="text-sm font-black text-slate-900">{mission.dest_address}</p>
                  </div>
               </div>
            </div>
         </div>

         <aside className="w-full lg:w-[400px] flex flex-col gap-6 overflow-y-auto pr-2">
            <Card className="border border-gray-100 shadow-premium rounded-[32px] overflow-hidden bg-white">
               <CardHeader className="pb-2 border-b border-gray-50 bg-gray-50/20">
                  <CardTitle className="text-lg font-black text-slate-900">Conducteur J'ARRIVE</CardTitle>
               </CardHeader>
               <CardContent className="pt-6">
                  {mission.driver ? (
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                         <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-gray-100 flex items-center justify-center text-2xl font-black text-white">
                            {mission.driver.full_name?.[0]}
                         </div>
                         <div className="flex-1">
                            <h4 className="font-black text-xl text-slate-900">{mission.driver.full_name}</h4>
                            <div className="flex items-center gap-1 text-brand-orange">
                               <CheckCircle2 className="w-3 h-3 fill-current" />
                               <span className="text-[10px] font-black uppercase tracking-widest">Livreur Certifié</span>
                            </div>
                         </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                         <Button variant="outline" className="h-12 flex gap-2 font-black text-brand-blue border-blue-100 bg-blue-50/50 hover:bg-blue-100 rounded-2xl uppercase text-[10px] tracking-widest">
                            <Phone className="w-4 h-4" /> Appeler
                         </Button>
                         <Button variant="outline" className="h-12 flex gap-2 font-black text-brand-orange border-orange-100 bg-orange-50/50 hover:bg-orange-100 rounded-2xl uppercase text-[10px] tracking-widest">
                            <MessageCircle className="w-4 h-4" /> Chat
                         </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="py-4 text-center space-y-3">
                       <Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-blue" />
                       <p className="text-xs font-bold text-gray-400">En attente d'un livreur...</p>
                    </div>
                  )}
               </CardContent>
            </Card>

            <Card className="border border-gray-100 shadow-premium flex-1 rounded-[32px] overflow-hidden bg-white">
               <CardHeader className="border-b border-gray-50 bg-gray-50/20">
                  <CardTitle className="text-lg font-black text-slate-900">État de livraison</CardTitle>
               </CardHeader>
               <CardContent className="relative pt-10 min-h-[300px]">
                  <div className="absolute left-8 top-14 bottom-14 w-0.5 bg-gray-100" />
                  
                  <div className="space-y-12 relative pb-8">
                     {steps.map((step, idx) => {
                       const isPast = idx < currentStepIndex
                       const isCurrent = idx === currentStepIndex
                       const isFuture = idx > currentStepIndex
                       
                       return (
                         <div key={step.id} className={`flex gap-6 items-start transition-opacity duration-500 ${isFuture ? 'opacity-30' : 'opacity-100'}`}>
                            <div className={`z-10 p-2 rounded-full text-white shadow-xl ${isPast ? 'bg-green-500' : isCurrent ? step.color + ' animate-pulse scale-110' : 'bg-gray-200'}`}>
                               <step.icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                               <p className={`font-black text-sm ${isFuture ? 'text-gray-400' : 'text-slate-900'}`}>{step.label}</p>
                               <p className="text-xs text-gray-500 font-medium">{step.desc}</p>
                               {isCurrent && (
                                 <div className={`mt-3 text-[10px] font-black px-3 py-1 rounded-full inline-block uppercase tracking-widest ${step.color} text-white`}>
                                   En cours
                                 </div>
                               )}
                            </div>
                         </div>
                       )
                     })}
                  </div>
               </CardContent>
            </Card>
         </aside>
      </div>
    </div>
  )
}
