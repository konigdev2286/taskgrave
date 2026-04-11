"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, MessageSquare, Package, ChevronRight, User } from "lucide-react"
import { useState } from "react"
import { motion } from "framer-motion"

export default function AvisPage() {
  const [rating, setRating] = useState(0)

  const pendingAvis = [
    { id: "CMD-8291", date: "Il y a 2 heures", item: "Gaz Bouteille 12kg", driver: "Mamadou K." },
    { id: "CMD-8285", date: "Hier", item: "Repas - Restaurant Le Phénix", driver: "Christian T." },
  ]

  const myReviews = [
    { rating: 5, comment: "Excellent service, Mamadou est très ponctuel.", date: "02 Avril 2026", driver: "Mamadou K." },
    { rating: 4, comment: "Paiement MoMo un peu lent à valider mais livraison parfaite.", date: "28 Mars 2026", driver: "Christian T." },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Avis et Notations</h1>
        <p className="text-gray-500">Partagez votre expérience pour nous aider à nous améliorer</p>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
           <div className="w-2 h-8 bg-brand-orange rounded-full" />
           Avis en attente
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {pendingAvis.map((avis) => (
             <Card key={avis.id} className="border border-gray-100 shadow-sm bg-white overflow-hidden hover:border-brand-blue transition-all group">
                <CardContent className="p-6">
                   <div className="flex justify-between items-start mb-4">
                      <div className="bg-orange-50 p-2 rounded-xl border border-orange-100">
                         <Package className="w-5 h-5 text-brand-orange" />
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-full uppercase tracking-tighter">{avis.id}</span>
                   </div>
                   <p className="font-bold text-slate-900 mb-1">{avis.item}</p>
                   <p className="text-xs text-gray-500 mb-4">Livreur : <span className="font-bold text-brand-blue">{avis.driver}</span></p>
                   
                   <div className="flex gap-1 mb-6">
                      {[1,2,3,4,5].map((star) => (
                        <button 
                          key={star} 
                          onMouseEnter={() => setRating(star)}
                          className={`hover:scale-110 transition-transform ${star <= rating ? 'text-brand-orange' : 'text-gray-200'}`}
                        >
                          <Star className={`w-6 h-6 ${star <= rating ? 'fill-current' : ''}`} />
                        </button>
                      ))}
                   </div>
                   
                   <Button className="w-full bg-brand-blue group-hover:bg-brand-blue-dark transition-all font-bold">Laisser un avis</Button>
                </CardContent>
             </Card>
           ))}
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
           <div className="w-2 h-8 bg-brand-blue rounded-full" />
           Mes avis récents
        </h3>
        <div className="space-y-4">
           {myReviews.map((rev, i) => (
             <Card key={i} className="border border-gray-100 shadow-sm bg-gray-50/30">
                <CardContent className="p-6">
                   <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-brand-blue shadow-sm">
                            <User className="w-5 h-5" />
                         </div>
                         <div>
                            <p className="text-sm font-bold text-slate-950">Livreur : {rev.driver}</p>
                            <p className="text-xs text-gray-400">{rev.date}</p>
                         </div>
                      </div>
                      <div className="flex gap-0.5">
                         {[1,2,3,4,5].map((s) => (
                           <Star key={s} className={`w-3.5 h-3.5 ${s <= rev.rating ? 'text-brand-orange fill-current' : 'text-gray-200'}`} />
                         ))}
                      </div>
                   </div>
                   <p className="text-sm text-gray-600 italic leading-relaxed pl-4 border-l-2 border-brand-orange">
                      "{rev.comment}"
                   </p>
                </CardContent>
             </Card>
           ))}
        </div>
      </div>
    </div>
  )
}
