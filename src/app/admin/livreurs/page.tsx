"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShieldCheck, Truck, MoreVertical, Smartphone, Star, MapPin, Search, Filter, Plus } from "lucide-react"

export default function AdminLivreurs() {
  const drivers = [
    { id: "L-401", name: "Mamadou K.", vehicle: "Motos", rating: 4.9, status: "En service", missionsToday: 8, location: "Poto-Poto" },
    { id: "L-402", name: "Christian T.", vehicle: "Motos", rating: 5.0, status: "Hors service", missionsToday: 12, location: "Ouenzé" },
    { id: "L-403", name: "Sylvain M.", vehicle: "Camionnette", rating: 4.7, status: "Vérification", missionsToday: 0, location: "Centre-ville" },
  ]

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Flotte de Livreurs</h1>
          <p className="text-gray-500 font-medium">Gestion des partenaires et du matériel</p>
        </div>
        <div className="flex gap-3">
           <Button className="bg-brand-orange font-bold px-8 shadow-lg shadow-brand-orange/20 flex gap-2">
              <Plus className="w-4 h-4" /> Recruter un livreur
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card className="p-6 bg-white border border-gray-100 shadow-sm">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Motos Actives</p>
            <p className="text-3xl font-black text-brand-orange">62</p>
         </Card>
         <Card className="p-6 bg-white border border-gray-100 shadow-sm">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Cammionnettes</p>
            <p className="text-3xl font-black text-brand-blue">14</p>
         </Card>
         <Card className="p-6 bg-white border border-gray-100 shadow-sm">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Note Moyenne Flotte</p>
            <p className="text-3xl font-black text-yellow-500">4.82</p>
         </Card>
      </div>

      <Card className="border border-white shadow-premium bg-white">
        <CardHeader className="p-6 border-b border-gray-50 flex flex-row items-center justify-between">
           <div className="flex gap-4">
              <div className="relative w-80">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                 <Input className="pl-10 bg-gray-50 border-none rounded-xl" placeholder="Rechercher un livreur..." />
              </div>
           </div>
           <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-gray-400">Total : 84 Livreurs</span>
           </div>
        </CardHeader>
        <CardContent className="p-0">
           <table className="w-full">
              <thead>
                 <tr className="bg-gray-50 text-left border-b border-gray-100">
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest pl-8">Livreur</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Véhicule</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Note</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Missions (J)</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Localisation</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Statut</th>
                    <th className="p-4"></th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                 {drivers.map((driver) => (
                   <tr key={driver.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 pl-8">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
                               {driver.name.split(' ').map(n=>n[0]).join('')}
                            </div>
                            <div>
                               <p className="text-sm font-bold text-slate-900">{driver.name}</p>
                               <p className="text-[10px] font-medium text-gray-400">{driver.id}</p>
                            </div>
                         </div>
                      </td>
                      <td className="p-4">
                         <div className="flex items-center gap-2">
                            <Truck className="w-4 h-4 text-gray-400" />
                            <span className="text-xs font-bold text-slate-600">{driver.vehicle}</span>
                         </div>
                      </td>
                      <td className="p-4">
                         <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                            <span className="text-xs font-bold text-slate-900">{driver.rating}</span>
                         </div>
                      </td>
                      <td className="p-4 text-xs font-bold text-slate-900">
                         {driver.missionsToday}
                      </td>
                      <td className="p-4">
                         <div className="flex items-center gap-1 text-xs font-medium text-gray-500">
                            <MapPin className="w-3 h-3" /> {driver.location}
                         </div>
                      </td>
                      <td className="p-4">
                         <span className={`text-[10px] font-black px-2 py-1 rounded-md ${
                            driver.status === 'En service' ? 'bg-green-50 text-green-600' : 
                            driver.status === 'Vérification' ? 'bg-orange-50 text-brand-orange' : 
                            'bg-gray-50 text-gray-400'
                         }`}>
                            {driver.status}
                         </span>
                      </td>
                      <td className="p-4 text-right">
                         <Button variant="ghost" size="icon" className="text-gray-300">
                            <MoreVertical className="w-5 h-5" />
                         </Button>
                      </td>
                   </tr>
                 ))}
              </tbody>
           </table>
        </CardContent>
      </Card>
    </div>
  )
}
