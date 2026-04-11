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
      title: "Petit Colis",
      desc: "Moins de 5kg. Idéal pour documents et petits objets.",
      price: "1 500",
      icon: Package,
      color: "text-blue-600",
      bg: "bg-blue-50",
      features: [
        "Livraison sous 2h",
        "Suivi en temps réel",
        "Assurance incluse",
        "Signature numérique"
      ]
    },
    {
      title: "Gaz & Énergie",
      desc: "Livraison/Échange de bouteille de gaz (12kg/20kg).",
      price: "2 500",
      icon: Flame,
      color: "text-orange-600",
      bg: "bg-orange-50",
      popular: true,
      features: [
        "Priorité absolue",
        "Installation gratuite",
        "Réglementation sécurisée",
        "Disponible 7j/7"
      ]
    },
    {
      title: "Déménagement",
      desc: "Transport urbain par utilitaire avec aide au chargement.",
      price: "25 000",
      icon: Truck,
      color: "text-brand-blue",
      bg: "bg-brand-blue/5",
      features: [
        "Camionnette dédiée",
        "2 manutentionnaires",
        "Emballage de protection",
        "Distance illimitée (BZV)"
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
                            <p className="text-sm opacity-60">Nous acceptons MTN Mobile Money, Airtel Money et les paiements par J'ARRIVE Cash.</p>
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
