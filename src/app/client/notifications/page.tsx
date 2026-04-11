"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell, Package, CheckCircle2, AlertCircle, Clock, Trash2 } from "lucide-react"

export default function NotificationsPage() {
  const notifications = [
    { 
      id: 1, 
      title: "Commande livrée !", 
      desc: "Votre colis #CMD-8285 a été livré avec succès par Mamadou K. à 19:15.", 
      time: "Il y a 2 heures", 
      type: "success",
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-50"
    },
    { 
      id: 2, 
      title: "Livreur en route", 
      desc: "Le livreur Christian T. a récupéré votre commande au Restaurant Le Phénix.", 
      time: "Il y a 4 heures", 
      type: "info",
      icon: Clock,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    { 
      id: 3, 
      title: "Offre Spéciale !", 
      desc: "Bénéficiez de -15% sur votre prochaine livraison de gaz avec le code GAZ242.", 
      time: "Hier", 
      type: "promo",
      icon: Package,
      color: "text-orange-600",
      bg: "bg-orange-50"
    },
    { 
      id: 4, 
      title: "Paiement échoué", 
      desc: "Le paiement MoMo pour la commande #CMD-8255 a été rejeté par l'opérateur.", 
      time: "Il y a 2 jours", 
      type: "error",
      icon: AlertCircle,
      color: "text-red-600",
      bg: "bg-red-50"
    },
  ]

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Notifications</h1>
          <p className="text-gray-500">Restez informé de vos activités</p>
        </div>
        <Button variant="ghost" className="text-red-500 hover:bg-red-50 font-bold flex gap-2">
           <Trash2 className="w-4 h-4" /> Tout effacer
        </Button>
      </div>

      <div className="space-y-4">
        {notifications.map((notif) => (
          <Card key={notif.id} className="border border-gray-100 shadow-sm bg-white hover:border-brand-blue/20 transition-all cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className={`${notif.bg} ${notif.color} p-3 rounded-2xl shrink-0 h-fit`}>
                  <notif.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-slate-900">{notif.title}</h3>
                    <span className="text-xs text-gray-400 font-medium">{notif.time}</span>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed mb-4">{notif.desc}</p>
                  <div className="flex gap-2">
                     <Button size="sm" variant="ghost" className="text-brand-blue text-xs font-bold px-0 hover:bg-transparent hover:underline">Voir les détails</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center py-10">
         <p className="text-gray-400 text-sm italic font-medium">Vous n'avez plus de notifications récentes.</p>
      </div>
    </div>
  )
}
