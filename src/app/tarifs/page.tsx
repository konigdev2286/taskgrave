"use client"

import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Check, Truck, Package, Box, Flame, Zap, Shield, HelpCircle } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

export default function TarifsPage() {
  const plans = [
    {
      title: "Pack starter",
      desc: "Idéal pour commencer, inclut 25 livraisons le mois.",
      price: "30 000",
      icon: Package,
      color: "text-blue-600",
      bg: "bg-blue-50",
      features: [
        "25 livraisons le mois",
        "Zone centre et au delà",
        "Suivi en temps réel",
        "Sécurisé"
      ]
    },
    {
      title: "Pack standard",
      desc: "Pour les besoins réguliers, inclut 80 livraisons le mois.",
      price: "80 000",
      icon: Truck,
      color: "text-brand-orange",
      bg: "bg-orange-50",
      popular: true,
      features: [
        "80 livraisons le mois",
        "Zone centre plus proche périphérie",
        "Suivi en temps réel",
        "Livraison express"
      ]
    },
    {
      title: "Pack pro",
      desc: "La solution complète, inclut 250 livraisons le mois.",
      price: "200 000",
      icon: Zap,
      color: "text-slate-900",
      bg: "bg-slate-100",
      features: [
        "250 livraisons le mois",
        "Toute la zone urbaine",
        "Priorité absolue",
        "Support dédié"
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-black text-slate-900 mb-6"
            >
              Tarifs <span className="text-brand-orange">clairs</span>, sans surprise.
            </motion.h1>
            <p className="text-gray-500 max-w-2xl mx-auto font-medium">
              Chez J'ARRIVE, nous croyons en la transparence. Découvrez nos forfaits adaptés à tous vos besoins logistiques à Brazzaville.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {plans.map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-orange text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg z-10">
                    Plus Populaire
                  </div>
                )}
                <Card className={`h-full border-none shadow-premium bg-white p-8 rounded-[40px] flex flex-col ${plan.popular ? 'ring-4 ring-brand-orange/10' : ''}`}>
                  <div className={`${plan.bg} w-16 h-16 rounded-2xl flex items-center justify-center mb-8`}>
                    <plan.icon className={`w-8 h-8 ${plan.color}`} />
                  </div>
                  <CardTitle className="text-2xl font-black mb-2">{plan.title}</CardTitle>
                  <CardDescription className="font-medium mb-8 leading-relaxed">{plan.desc}</CardDescription>
                  
                  <div className="mb-10 flex items-baseline gap-1">
                    <span className="text-4xl font-black text-slate-900">{plan.price}</span>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">FCFA</span>
                  </div>

                  <div className="space-y-4 mb-10 flex-1">
                    {plan.features.map((feature, j) => (
                      <div key={j} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 text-green-600" />
                        </div>
                        <span className="text-sm font-medium text-slate-600">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Link href="/auth/register">
                    <Button className={`w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-brand-blue/10 border-none transition-transform active:scale-95 ${plan.popular ? 'bg-brand-orange hover:bg-brand-orange-dark' : 'bg-brand-blue hover:bg-brand-blue-dark'}`}>
                       Choisir ce forfait
                    </Button>
                  </Link>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Grille Tarifaire Livraison */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4">Livraison à <span className="text-brand-orange">la course</span></h2>
              <p className="text-gray-500 max-w-2xl mx-auto font-medium">Tarifs par zone pour vos courses ponctuelles.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               <Card className="border-none shadow-premium bg-white p-6 rounded-[30px]">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 text-blue-600 font-bold">1k</div>
                  <h3 className="font-black text-lg mb-2">Centre Ville</h3>
                  <p className="text-2xl font-black text-brand-blue mb-4">1 000 FCFA</p>
                  <ul className="text-xs text-slate-500 space-y-1 font-medium">
                     <li>• Marché poto poto</li>
                     <li>• CCF, Hotel de ville</li>
                     <li>• CHU, OCH</li>
                     <li>• Plateau ville</li>
                  </ul>
               </Card>
               <Card className="border-none shadow-premium bg-white p-6 rounded-[30px]">
                  <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mb-4 text-brand-orange font-bold">1.5k</div>
                  <h3 className="font-black text-lg mb-2">Périphérie A</h3>
                  <p className="text-2xl font-black text-brand-orange mb-4">1 500 FCFA</p>
                  <ul className="text-xs text-slate-500 space-y-1 font-medium">
                     <li>• Ouenzé, Moukondo</li>
                     <li>• Talangaï centre</li>
                     <li>• Bacongo, Mpila</li>
                     <li>• Rond point Makélékélé</li>
                  </ul>
               </Card>
               <Card className="border-none shadow-premium bg-white p-6 rounded-[30px]">
                  <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-4 text-green-600 font-bold">2k-2.5k</div>
                  <h3 className="font-black text-lg mb-2">Périphérie B</h3>
                  <p className="text-2xl font-black text-green-600 mb-4">2 000 - 2 500 FCFA</p>
                  <ul className="text-xs text-slate-500 space-y-1 font-medium">
                     <li>• Madibou, Péka</li>
                     <li>• La mairie de Mfilou</li>
                     <li>• Nkombo, Masséngo</li>
                     <li>• Sadelmi, Mayanga</li>
                  </ul>
               </Card>
               <Card className="border-none shadow-premium bg-white p-6 rounded-[30px]">
                  <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-4 text-purple-600 font-bold">3k+</div>
                  <h3 className="font-black text-lg mb-2">Longue Portée</h3>
                  <p className="text-2xl font-black text-purple-600 mb-4">3 000 - 5 000 FCFA</p>
                  <ul className="text-xs text-slate-500 space-y-1 font-medium">
                     <li>• Nganga lingolo (3000F)</li>
                     <li>• Djiri, Kintélé (3500F)</li>
                     <li>• Igné, Samba (5000F)</li>
                  </ul>
               </Card>
            </div>
          </motion.div>

          {/* Section Tarifs Stockage */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4">Tarifs <span className="text-brand-blue">Stockage</span></h2>
              <p className="text-gray-500 max-w-2xl mx-auto font-medium">Des solutions de stockage sécurisées adaptées au volume de vos marchandises.</p>
            </div>
            
            <div className="max-w-4xl mx-auto bg-white rounded-[40px] shadow-premium overflow-hidden border border-gray-100">
               <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white text-xs md:text-sm uppercase tracking-widest font-black">
                      <th className="p-4 md:p-6">Poids Colis</th>
                      <th className="p-4 md:p-6 text-center text-brand-orange">Tarif Jour</th>
                      <th className="p-4 md:p-6 text-center text-brand-blue">Tarif Semaine</th>
                      <th className="p-4 md:p-6 text-center">Tarif Mois</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm font-bold divide-y divide-gray-100">
                    {[
                      { range: "0-5 kg", d: "500", w: "2 500", m: "5 000" },
                      { range: "6-10 kg", d: "1 000", w: "5 000", m: "10 000" },
                      { range: "11-20 kg", d: "1 500", w: "7 500", m: "15 000" },
                      { range: "21-50 kg", d: "2 500", w: "12 500", m: "25 000" },
                      { range: "51-100 kg", d: "5 000", w: "25 000", m: "50 000" },
                    ].map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 md:p-6 text-slate-900">{item.range}</td>
                        <td className="p-4 md:p-6 text-center text-brand-orange bg-brand-orange/5">{item.d} FCFA</td>
                        <td className="p-4 md:p-6 text-center text-brand-blue bg-brand-blue/5">{item.w} FCFA</td>
                        <td className="p-4 md:p-6 text-center text-slate-600 bg-slate-50">{item.m} FCFA</td>
                      </tr>
                    ))}
                    <tr className="hover:bg-gray-50 transition-colors border-b-0">
                      <td className="p-4 md:p-6 text-slate-900 font-bold">101 kg et +</td>
                      <td colSpan={3} className="p-4 md:p-6 text-center text-brand-orange font-black bg-brand-orange/5 italic underline">Sur devis uniquement</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>

          {/* Section FAQ Rapide */}
          <div className="bg-slate-900 rounded-[60px] p-12 text-white relative overflow-hidden">
             <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                   <h2 className="text-3xl font-black mb-6">Des questions sur nos tarifs ?</h2>
                   <div className="space-y-6">
                      <div className="flex gap-4">
                         <HelpCircle className="w-6 h-6 text-brand-orange shrink-0" />
                         <div>
                            <p className="font-bold mb-1">Y a-t-il des frais de dossier ?</p>
                            <p className="text-sm opacity-60">Non, l'inscription est totalement gratuite. Vous ne payez que pour vos livraisons.</p>
                         </div>
                      </div>
                      <div className="flex gap-4">
                         <HelpCircle className="w-6 h-6 text-brand-orange shrink-0" />
                         <div>
                            <p className="font-bold mb-1">Quels sont les modes de paiement ?</p>
                            <p className="text-sm opacity-60">Nous fonctionnons par paiement sur place. Vous payez en espèces à la livraison ou au retrait.</p>
                         </div>
                      </div>
                   </div>
                </div>
                <div className="bg-white/10 p-8 rounded-[40px] border border-white/10 backdrop-blur-sm text-center">
                   <Zap className="w-12 h-12 text-brand-orange mx-auto mb-6" />
                   <h3 className="text-xl font-black mb-2">Grand Volume ?</h3>
                   <p className="text-sm opacity-60 mb-8">Vous êtes un restaurant ou un e-commerçant ? Bénéficiez de tarifs préférentiels négociés.</p>
                   <Link href="/contact">
                     <Button className="bg-white text-slate-900 hover:bg-gray-100 font-bold px-8 h-12 rounded-xl border-none">Contacter le Service Pro</Button>
                   </Link>
                </div>
             </div>
             <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange opacity-20 blur-3xl -translate-y-1/2 translate-x-1/2" />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white py-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-gray-500 text-sm">© 2026 J'ARRIVE Logistique République du Congo. Tarifs sujets à modification.</p>
        </div>
      </footer>
    </div>
  )
}
