"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DollarSign, ArrowUpRight, ArrowDownLeft, PieChart, Download, Calendar, ArrowRight, CreditCard, Wallet } from "lucide-react"
import { motion } from "framer-motion"

export default function AdminFinances() {
  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Gestion Financière</h1>
          <p className="text-gray-500 font-medium">Suivi des revenus, commissions et paiements livreurs</p>
        </div>
        <div className="flex gap-3">
           <Button variant="outline" className="border-gray-200 font-bold flex gap-2">
              <Calendar className="w-4 h-4" /> Ce mois-ci
           </Button>
           <Button className="bg-brand-blue font-bold px-8 shadow-lg shadow-brand-blue/20">Exporter rapport financier</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
         {[
           { label: "Volume d'affaires", value: "14,250,000", sub: "+18%", icon: DollarSign, color: "text-blue-600", bg: "bg-blue-50" },
           { label: "Marge J'ARRIVE", value: "2,137,500", sub: "+15%", icon: PieChart, color: "text-brand-orange", bg: "bg-orange-50" },
           { label: "Paies Livreurs", value: "12,112,500", sub: "À verser", icon: Wallet, color: "text-green-600", bg: "bg-green-50" },
           { label: "Frais Systèmes", value: "450,000", sub: "Fixe", icon: CreditCard, color: "text-slate-600", bg: "bg-slate-100" },
         ].map((stat, i) => (
           <Card key={i} className="border-none shadow-sm bg-white p-6">
              <div className={`${stat.bg} w-10 h-10 rounded-xl flex items-center justify-center mb-4`}>
                 <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
              <div className="flex items-baseline gap-2 mt-1">
                 <p className="text-xl font-black text-slate-900">{stat.value}</p>
                 <span className="text-[8px] font-bold text-gray-400">FCFA</span>
              </div>
              <p className={`text-[10px] font-bold mt-2 ${stat.sub.startsWith('+') ? 'text-green-600' : 'text-gray-400'}`}>{stat.sub}</p>
           </Card>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <Card className="lg:col-span-2 border border-white shadow-premium bg-white p-0 overflow-hidden">
            <CardHeader className="p-8 border-b border-gray-50 flex flex-row items-center justify-between">
               <div>
                  <CardTitle className="text-xl">Flux de Trésorerie</CardTitle>
                  <CardDescription>Paiements clients vs Versements livreurs</CardDescription>
               </div>
               <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-brand-blue" />
                     <span className="text-[10px] font-bold text-gray-400">Paiements</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-brand-orange" />
                     <span className="text-[10px] font-bold text-gray-400">Sorties</span>
                  </div>
               </div>
            </CardHeader>
            <CardContent className="p-8">
               <div className="h-64 flex items-end gap-2">
                  {[40, 60, 45, 90, 65, 80, 50, 70, 85, 40, 55, 75].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                       <div className="w-full bg-blue-50/50 rounded-t-lg relative group">
                          <motion.div initial={{ height: 0 }} animate={{ height: `${h}%` }} className="bg-brand-blue/30 w-full rounded-t-lg transition-all group-hover:bg-brand-blue" />
                       </div>
                       <span className="text-[8px] font-bold text-gray-300">{['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'][i]}</span>
                    </div>
                  ))}
               </div>
            </CardContent>
         </Card>

         <Card className="border border-white shadow-premium bg-white p-8 overflow-hidden flex flex-col">
            <h3 className="text-lg font-black text-slate-900 mb-6">Paiements en attente</h3>
            <div className="flex-1 space-y-4">
               {[
                 { user: "Mamadou K.", amt: "45,800", date: "Lun 12" },
                 { user: "Christian T.", amt: "72,500", date: "Lun 12" },
                 { user: "Sylvain M.", amt: "12,400", date: "Lun 12" },
                 { user: "Paul M.", amt: "34,900", date: "Lun 12" },
               ].map((p, i) => (
                 <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div>
                       <p className="text-sm font-bold text-slate-900">{p.user}</p>
                       <p className="text-[10px] text-gray-400 font-medium">Versement prévu {p.date}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-sm font-black text-slate-900">{p.amt} <span className="text-[8px]">FCFA</span></p>
                       <Button size="sm" variant="ghost" className="text-brand-orange h-auto p-0 text-[10px] font-black uppercase">Payer maintenant</Button>
                    </div>
                 </div>
               ))}
            </div>
            <Button className="w-full mt-6 bg-brand-orange h-14 rounded-2xl font-black shadow-lg shadow-brand-orange/20 border-none">Verser toutes les paies</Button>
         </Card>
      </div>

      <Card className="border border-white shadow-premium bg-white overflow-hidden">
         <div className="p-8 border-b border-gray-50">
            <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Historique des Transactions Globales</h3>
         </div>
         <table className="w-full">
            <thead>
               <tr className="bg-gray-50 text-left">
                  <th className="p-6 text-[10px] font-black text-gray-400 uppercase pl-10">Référence</th>
                  <th className="p-6 text-[10px] font-black text-gray-400 uppercase">Utilisateur</th>
                  <th className="p-6 text-[10px] font-black text-gray-400 uppercase">Type</th>
                  <th className="p-6 text-[10px] font-black text-gray-400 uppercase">Montant</th>
                  <th className="p-6 text-[10px] font-black text-gray-400 uppercase">Méthode</th>
                  <th className="p-6 text-[10px] font-black text-gray-400 uppercase">Statut</th>
               </tr>
            </thead>
            <tbody>
               {[
                 { ref: "TR-8291", user: "Jean B.", type: "Encaissement", amt: "2,500", meth: "Espèces", status: "Succès" },
                 { ref: "TR-8290", user: "Mamadou K.", type: "Décaissement", amt: "15,000", meth: "Espèces", status: "En cours" },
                 { ref: "TR-8289", user: "Alice M.", type: "Encaissement", amt: "1,800", meth: "Airtel Money", status: "Succès" },
               ].map((t, i) => (
                 <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                    <td className="p-6 pl-10 text-xs font-bold text-slate-400">{t.ref}</td>
                    <td className="p-6 text-sm font-black text-slate-900">{t.user}</td>
                    <td className="p-6">
                       <span className={`text-[10px] font-black px-2 py-1 rounded-md ${t.type === 'Encaissement' ? 'bg-blue-50 text-brand-blue' : 'bg-orange-50 text-brand-orange'}`}>
                          {t.type}
                       </span>
                    </td>
                    <td className="p-6 font-black text-slate-900">{t.amt} FCFA</td>
                    <td className="p-6 text-xs text-slate-500 font-bold">{t.meth}</td>
                    <td className="p-6">
                       <span className={`text-[10px] font-black ${t.status === 'Succès' ? 'text-green-600' : 'text-orange-500'}`}>{t.status}</span>
                    </td>
                 </tr>
               ))}
            </tbody>
         </table>
      </Card>
    </div>
  )
}
