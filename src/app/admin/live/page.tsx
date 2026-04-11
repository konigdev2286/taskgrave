"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Truck, Navigation, Search, Layers, Maximize, Play, Pause, Bell } from "lucide-react"
import { motion } from "framer-motion"

export default function AdminLiveMap() {
  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
         <div className="flex items-center gap-6">
            <h1 className="text-xl font-black text-slate-900 border-r border-gray-100 pr-6">Supervision Live</h1>
            <div className="flex items-center gap-6">
               <div className="flex flex-col">
                  <span className="text-[10px] font-black text-gray-400 uppercase">Livreurs Actifs</span>
                  <span className="text-sm font-bold text-green-600">62 en ligne</span>
               </div>
               <div className="flex flex-col">
                  <span className="text-[10px] font-black text-gray-400 uppercase">Missions</span>
                  <span className="text-sm font-bold text-brand-blue">32 en cours</span>
               </div>
            </div>
         </div>
         <div className="flex gap-2">
            <Button variant="outline" className="rounded-xl border-gray-100 h-10 px-4 font-bold text-xs"><Layers className="w-4 h-4 mr-2" /> Couches</Button>
            <Button variant="outline" className="rounded-xl border-gray-100 h-10 px-4 font-bold text-xs"><Search className="w-4 h-4 mr-2" /> Filtrer Fleet</Button>
            <Button className="bg-slate-900 text-white rounded-xl h-10 px-6 font-bold text-xs shadow-lg shadow-slate-200">Centre Map</Button>
         </div>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
         <div className="flex-1 bg-white rounded-3xl relative overflow-hidden shadow-premium border border-gray-100 border-white">
            <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=Brazzaville,Congo&zoom=14&size=1200x800&scale=2')] bg-cover opacity-50 grayscale-[0.2]" />
            
            {/* Simulation markers */}
            {[
              { top: '30%', left: '40%', status: 'active', id: 'MK' },
              { top: '50%', left: '60%', status: 'busy', id: 'CT' },
              { top: '45%', left: '35%', status: 'active', id: 'SM' },
              { top: '70%', left: '20%', status: 'warning', id: 'CMD' },
            ].map((m, i) => (
              <motion.div 
               key={i}
               className="absolute"
               style={{ top: m.top, left: m.left }}
               initial={{ scale: 0 }}
               animate={{ scale: 1 }}
               transition={{ delay: i * 0.2 }}
              >
                 <div className="relative group cursor-pointer">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black text-white shadow-xl border-2 border-white transition-transform group-hover:scale-125 ${
                      m.status === 'active' ? 'bg-green-500' : m.status === 'busy' ? 'bg-brand-blue' : 'bg-red-500 animate-pulse'
                    }`}>
                       {m.id}
                    </div>
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white p-3 rounded-2xl hidden group-hover:block w-40 z-50">
                       <p className="text-xs font-bold">{m.id === 'CMD' ? 'Alerte Mission' : 'Livreur: '+m.id}</p>
                       <p className="text-[10px] opacity-70">En direction de Centre-ville</p>
                    </div>
                 </div>
              </motion.div>
            ))}

            {/* Live Feed Controls Overlay */}
            <div className="absolute bottom-8 left-8 flex items-center gap-3 bg-white/80 backdrop-blur-md p-2 rounded-2xl border border-white/20 shadow-2xl">
               <Button size="icon" className="w-10 h-10 rounded-xl bg-slate-900 text-white"><Pause className="w-4 h-4" /></Button>
               <div className="h-6 w-px bg-gray-200" />
               <p className="text-[10px] font-black text-slate-900 px-4 uppercase tracking-widest whitespace-nowrap">Mise à jour : 2s</p>
            </div>
         </div>

         <aside className="w-96 flex flex-col gap-6">
            <Card className="border border-white shadow-premium bg-white p-6 overflow-hidden">
               <h3 className="font-black text-slate-900 mb-6 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-brand-orange" /> Incidents Critiques
               </h3>
               <div className="space-y-4">
                  <div className="p-5 rounded-3xl bg-red-50 border border-red-100 relative group overflow-hidden">
                     <p className="text-xs font-black text-red-600 mb-1 uppercase tracking-widest">Retard Critique</p>
                     <p className="text-sm font-bold text-slate-900">CMD-8260 • Anicet B.</p>
                     <p className="text-[10px] text-red-500 mt-2 font-medium">L'adresse de destination est invalide ou inaccessible.</p>
                     <div className="mt-4 flex gap-2">
                        <Button className="h-8 bg-red-600 text-[10px] font-black flex-1">RÉASSIGNER</Button>
                        <Button variant="outline" className="h-8 border-red-200 text-red-600 text-[10px] font-black flex-1">APPELER</Button>
                     </div>
                  </div>
               </div>
            </Card>

            <Card className="border border-white shadow-premium bg-white p-6 flex-1 overflow-hidden flex flex-col">
               <h3 className="font-black text-slate-900 mb-6">File d'attente (Dispatch)</h3>
               <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                  {[1,2,3,4,5].map((item) => (
                    <div key={item} className="p-4 rounded-2xl border border-gray-50 bg-gray-50/30 flex items-center justify-between">
                       <div>
                          <p className="text-xs font-bold text-slate-900">CMD-4521</p>
                          <p className="text-[10px] text-gray-400 font-medium">Brazzaville ➔ Ouenzé</p>
                       </div>
                       <Button size="sm" variant="ghost" className="text-brand-blue font-black text-[10px]">AUTO-DISPATCH</Button>
                    </div>
                  ))}
               </div>
            </Card>
         </aside>
      </div>
    </div>
  )
}
