"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Info, Plus, CreditCard, ArrowUpRight, History, Loader2, Wallet, Smartphone, ShieldCheck } from "lucide-react"
import { useState } from "react"
import { useProfile } from "@/hooks/use-supabase"
import { supabase } from "@/lib/supabase"
import { motion } from "framer-motion"

export default function PortefeuillePage() {
  const { profile, loading, refreshProfile } = useProfile()
  const [recharging, setRecharging] = useState(false)
  const [selectedAmount, setSelectedAmount] = useState(2000)

  const handleRecharge = async () => {
    setRecharging(true)
    // Simulated delay 
    await new Promise(r => setTimeout(r, 2000))

    try {
      const newBalance = (profile?.balance || 0) + selectedAmount
      const { error } = await supabase
        .from('profiles')
        .update({ balance: newBalance })
        .eq('id', profile.id)

      if (error) throw error

      await supabase.from('notifications').insert({
        user_id: profile.id,
        title: "Rechargement Réussi",
        message: `Votre portefeuille a été crédité de ${selectedAmount.toLocaleString()} FCFA.`,
        type: 'success'
      })

      alert(`Succès! ${selectedAmount} FCFA ajoutés (Simulation).`)
      refreshProfile()
    } catch (e: any) {
      alert("Erreur: " + e.message)
    } finally {
      setRecharging(false)
    }
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Loader2 className="w-12 h-12 text-brand-blue animate-spin" />
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
           <h1 className="text-4xl font-black text-slate-900 tracking-tight">Mon Portefeuille</h1>
           <p className="text-gray-500 font-medium">Gérez votre solde et payez vos missions en un clic</p>
        </div>
        <Card className="bg-slate-900 text-white px-8 py-6 rounded-[32px] shadow-2xl flex items-center gap-6">
           <div>
              <p className="text-[10px] font-black opacity-50 uppercase tracking-widest mb-1">Solde Actuel</p>
              <p className="text-3xl font-black text-brand-orange">{profile?.balance?.toLocaleString() || 0} <span className="text-xs">FCFA</span></p>
           </div>
           <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-brand-orange" />
           </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         <div className="lg:col-span-2 space-y-8">
            <Card className="border-none shadow-premium rounded-[40px] overflow-hidden bg-white">
               <CardHeader className="p-8 pb-0">
                  <CardTitle className="text-xl font-black text-slate-900">Recharger mon compte</CardTitle>
               </CardHeader>
               <CardContent className="p-8 space-y-8">
                  <p className="text-sm text-gray-500 font-medium leading-relaxed">
                     Choisissez un montant à créditer sur votre compte J'ARRIVE. 
                     <span className="text-brand-blue font-bold"> (Note: Simulation de recharge activée)</span>
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     {[2000, 5000, 10000, 25000].map((amt) => (
                        <button
                           key={amt}
                           onClick={() => setSelectedAmount(amt)}
                           className={`p-6 rounded-[24px] border-2 font-black transition-all ${
                              selectedAmount === amt 
                              ? 'border-brand-blue bg-blue-50 text-brand-blue shadow-lg scale-105' 
                              : 'border-gray-50 bg-gray-50/50 text-slate-400 hover:border-gray-200'
                           }`}
                        >
                           {amt.toLocaleString()}
                        </button>
                     ))}
                  </div>

                  <div className="space-y-4">
                     <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Méthodes disponibles</p>
                     <div className="flex flex-wrap gap-4">
                        <div className="px-6 py-4 bg-gray-50 rounded-2xl border-2 border-transparent flex items-center gap-3 opacity-50 grayscale">
                           <Smartphone className="w-5 h-5" />
                           <span className="text-xs font-black uppercase">MTN MoMo (Désactivé)</span>
                        </div>
                        <div className="px-6 py-4 bg-brand-blue/5 rounded-2xl border-2 border-brand-blue/20 flex items-center gap-3">
                           <ShieldCheck className="w-5 h-5 text-brand-blue" />
                           <span className="text-xs font-black uppercase text-brand-blue">Dépôt Cash (Agence)</span>
                        </div>
                     </div>
                  </div>

                  <Button 
                    onClick={handleRecharge}
                    disabled={recharging}
                    className="w-full h-16 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-[24px] font-black text-lg shadow-xl shadow-brand-blue/20 border-none transition-all active:scale-95"
                  >
                     {recharging ? <Loader2 className="w-6 h-6 animate-spin" /> : `Créditer ${selectedAmount.toLocaleString()} FCFA`}
                  </Button>
               </CardContent>
            </Card>
         </div>

         <div className="space-y-6">
            <Card className="border-none shadow-premium rounded-[40px] bg-white p-8">
               <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                  <History className="w-5 h-5 text-brand-orange" /> Historique
               </h3>
               <div className="space-y-6">
                  {/* Simulated transactions */}
                  <div className="flex items-center justify-between group">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                           <ArrowUpRight className="w-5 h-5" />
                        </div>
                        <div>
                           <p className="text-sm font-black text-slate-900">Recharge</p>
                           <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">12 Avr 2024</p>
                        </div>
                     </div>
                     <p className="font-black text-green-600">+5 000</p>
                  </div>
                  <div className="flex items-center justify-between group opacity-60">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center">
                           <Plus className="w-5 h-5 rotate-45" />
                        </div>
                        <div>
                           <p className="text-sm font-black text-slate-900">Livraison Express</p>
                           <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">10 Avr 2024</p>
                        </div>
                     </div>
                     <p className="font-black text-slate-600">-2 500</p>
                  </div>
               </div>
            </Card>
            
            <Card className="border-none bg-blue-50/50 p-8 rounded-[40px] border border-blue-100 flex gap-4">
               <Info className="w-6 h-6 text-brand-blue shrink-0" />
               <p className="text-xs text-brand-blue font-medium leading-relaxed">
                  Le paiement par portefeuille est plus rapide et vous donne droit à des réductions exclusives sur certains services.
               </p>
            </Card>
         </div>
      </div>
    </div>
  )
}
