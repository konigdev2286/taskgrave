"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wallet, ArrowDownRight, ArrowUpRight, Clock, Plus, Smartphone, History, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"

export default function PortefeuillePage() {
  const transactions = [
    { id: "T-9201", type: "Revenu", item: "Mission #M-1024", amount: "+2,500 FCFA", date: "Aujourd'hui, 14:15", status: "Validé" },
    { id: "T-9188", type: "Retrait", item: "Retrait Vers MoMo", amount: "-15,000 FCFA", date: "Hier, 10:30", status: "En cours" },
    { id: "T-9150", type: "Revenu", item: "Mission #M-0995", amount: "+1,800 FCFA", date: "Hier, 09:12", status: "Validé" },
    { id: "T-9142", type: "Commission", item: "Bonus Fidelité Hebdo", amount: "+5,000 FCFA", date: "Lundi, 18:00", status: "Validé" },
  ]

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Mon Portefeuille</h1>
          <p className="text-gray-500">Gérez vos revenus et vos retraits MoMo</p>
        </div>
        <Button className="bg-brand-blue h-12 px-8 font-bold shadow-lg shadow-brand-blue/20 flex gap-2">
           <Plus className="w-5 h-5" /> Ajouter un compte MoMo
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <Card className="lg:col-span-1 border-none bg-slate-900 p-8 rounded-[40px] text-white overflow-hidden relative shadow-2xl">
           <div className="relative z-10">
              <div className="flex justify-between items-center mb-10">
                 <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md">
                    <Wallet className="w-6 h-6 text-brand-orange" />
                 </div>
                 <span className="text-[10px] font-black bg-brand-orange/20 text-brand-orange px-3 py-1 rounded-full uppercase tracking-widest">Compte Actif</span>
              </div>
              
              <p className="text-xs font-bold opacity-60 uppercase tracking-widest mb-1">Solde Total</p>
              <h2 className="text-5xl font-black mb-8">45,800 <span className="text-sm font-bold opacity-40">FCFA</span></h2>
              
              <div className="pt-6 border-t border-white/10 space-y-4">
                 <div className="flex justify-between text-sm">
                    <span className="opacity-60">En attente</span>
                    <span className="font-bold">4,200 FCFA</span>
                 </div>
                 <div className="flex justify-between text-sm">
                    <span className="opacity-60">Retrait min.</span>
                    <span className="font-bold">1,000 FCFA</span>
                 </div>
              </div>

              <div className="mt-8">
                 <Button className="w-full bg-brand-orange hover:bg-brand-orange-dark h-14 font-black shadow-xl shadow-brand-orange/20 border-none transition-transform active:scale-95">Retirer maintenant</Button>
              </div>
           </div>
           <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-brand-blue opacity-20 rounded-full blur-3xl" />
        </Card>

        <div className="lg:col-span-2 space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border border-gray-100 shadow-sm bg-white p-6">
                 <div className="flex gap-4 items-center">
                    <div className="bg-green-50 p-3 rounded-2xl text-green-600">
                       <ArrowUpRight className="w-6 h-6" />
                    </div>
                    <div>
                       <p className="text-xs text-gray-400 font-bold uppercase">Revenus (7j)</p>
                       <p className="text-xl font-black text-slate-900">+72,500 FCFA</p>
                    </div>
                 </div>
              </Card>
              <Card className="border border-gray-100 shadow-sm bg-white p-6">
                 <div className="flex gap-4 items-center">
                    <div className="bg-blue-50 p-3 rounded-2xl text-blue-600">
                       <Smartphone className="w-6 h-6" />
                    </div>
                    <div>
                       <p className="text-xs text-gray-400 font-bold uppercase">Compte lié</p>
                       <p className="text-xl font-black text-slate-900">06 445 ....</p>
                    </div>
                 </div>
              </Card>
           </div>

           <Card className="border border-gray-100 shadow-sm bg-white overflow-hidden">
              <CardHeader className="bg-gray-50/20 border-b border-gray-50 flex flex-row items-center justify-between">
                 <div>
                    <CardTitle className="text-lg">Dernières Transactions</CardTitle>
                    <CardDescription>Suivi de vos entrées et sorties</CardDescription>
                 </div>
                 <Button variant="ghost" size="sm" className="text-brand-blue font-bold">Voir tout</Button>
              </CardHeader>
              <CardContent className="p-0">
                 <div className="divide-y divide-gray-50">
                    {transactions.map((t, i) => (
                      <div key={i} className="p-5 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                         <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-xl ${t.type === 'Revenu' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                               {t.type === 'Revenu' ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                            </div>
                            <div>
                               <p className="text-sm font-bold text-slate-900">{t.item}</p>
                               <p className="text-[10px] text-gray-400 font-medium">{t.date}</p>
                            </div>
                         </div>
                         <div className="text-right">
                            <p className={`font-black ${t.amount.startsWith('+') ? 'text-green-600' : 'text-slate-900'}`}>{t.amount}</p>
                            <span className={`text-[10px] font-bold ${t.status === 'Validé' ? 'text-green-600' : 'text-orange-500'}`}>{t.status}</span>
                         </div>
                      </div>
                    ))}
                 </div>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  )
}
