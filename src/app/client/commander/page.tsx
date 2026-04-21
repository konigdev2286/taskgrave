"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Truck, Package, MapPin, CreditCard, ChevronRight, Info, Flame, Home, Box, CheckCircle2, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function CommanderPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [service, setService] = useState("")
  const [vehicleType, setVehicleType] = useState("moto")
  const [paymentMethod, setPaymentMethod] = useState("cash") // 'cash' or 'wallet'
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [userBalance, setUserBalance] = useState(0)
  
  // Form state
  const [formData, setFormData] = useState({
    origin: "",
    destination: "",
    receiverName: "",
    receiverPhone: "",
    momoNumber: "06 123 4567" // Default for demo
  })

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase.from('profiles').select('balance').eq('id', user.id).single()
      if (data) setUserBalance(data.balance || 0)
    }
  }

  const services = [
    { id: "colis", title: "Livraison à domicile", desc: "Vos colis, repas, etc.", icon: Package, price: 1500, priceDisplay: "1 500 FCFA" },
    { id: "gaz", title: "Achat & livraison de gaz", desc: "Bouteille 12kg/20kg", icon: Flame, price: 2500, priceDisplay: "2 500 FCFA" },
    { id: "moving", title: "Déménagement", desc: "Forfait utilitaire", icon: Truck, price: 25000, priceDisplay: "25 000 FCFA" },
    { id: "storage", title: "Stockage de marchandises", desc: "Par m³ / mois", icon: Box, price: 5000, priceDisplay: "5 000 FCFA" },
  ]

  const vehicles = [
    { id: "moto", title: "Moto", icon: Truck, multiplier: 1, desc: "Rapide, idéal petits colis" },
    { id: "van", title: "Voiture/Van", icon: Truck, multiplier: 2.5, desc: "Plus d'espace, sécurisé" },
    { id: "bicycle", title: "Vélo", icon: Truck, multiplier: 0.8, desc: "Écologique & Économique" },
  ]

  const baseService = services.find(s => s.id === service)
  const selectedVehicle = vehicles.find(v => v.id === vehicleType)
  const totalPrice = baseService ? Math.floor(baseService.price * (selectedVehicle?.multiplier || 1)) : 0

  const handlePayment = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        alert("Veuillez vous connecter pour passer commande.")
        router.push("/auth/login")
        return
      }

      if (paymentMethod === 'wallet' && userBalance < totalPrice) {
        alert("Solde insuffisant dans votre portefeuille.")
        setLoading(false)
        return
      }

      const { data: mission, error } = await supabase
        .from('missions')
        .insert({
          client_id: user.id,
          type: service,
          vehicle_type_requested: vehicleType,
          origin_address: formData.origin,
          dest_address: formData.destination,
          price_fcfa: totalPrice,
          status: 'pending',
          payment_status: paymentMethod === 'wallet' ? 'paid' : 'unpaid',
          payment_method: paymentMethod
        })
        .select()
        .single()

      if (error) throw error

      if (paymentMethod === 'wallet') {
        // Deduct from balance
        await supabase
          .from('profiles')
          .update({ balance: userBalance - totalPrice })
          .eq('id', user.id)
      }

      // Add notification for admin
      await supabase.from('notifications').insert({
        user_id: (await supabase.from('profiles').select('id').eq('role', 'admin').limit(1).single()).data?.id,
        title: "Nouvelle Mission",
        message: `Une nouvelle mission (${service}) a été créée par un client.`,
        type: 'info',
        link: `/admin/live`
      })

      setSuccess(true)
      setTimeout(() => {
        router.push("/client/suivi")
      }, 3000)

    } catch (error: any) {
      console.error("Error creating mission:", error)
      alert("Erreur lors de la commande: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-12 h-12" />
        </motion.div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-slate-900">Commande Confirmée !</h2>
          <p className="text-gray-500">
            {paymentMethod === 'wallet' 
              ? "Votre commande a été payée via votre portefeuille." 
              : "Votre commande a été validée. Le paiement se fera à la livraison."}
          </p>
        </div>
        <p className="text-xs text-brand-blue font-bold animate-pulse">Redirection vers le suivi dans 3 secondes...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4 mb-8">
         {[1, 2, 3].map((s) => (
           <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= s ? 'bg-brand-blue text-white' : 'bg-gray-200 text-gray-500'}`}>
                 {s}
              </div>
              {s < 3 && <div className={`h-1 w-12 rounded-full ${step > s ? 'bg-brand-blue' : 'bg-gray-200'}`} />}
           </div>
         ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
             <div>
                <h2 className="text-2xl font-black">Quel service désirez-vous ?</h2>
                <p className="text-gray-500 font-medium">Sélectionnez le type de livraison adapté à vos besoins</p>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((s) => (
                  <Card 
                    key={s.id} 
                    className={`cursor-pointer transition-all border-2 rounded-[32px] overflow-hidden ${service === s.id ? 'border-brand-blue bg-blue-50/30' : 'border-gray-50 hover:border-brand-blue/30'}`}
                    onClick={() => setService(s.id)}
                  >
                    <CardContent className="p-6 flex items-center gap-6">
                       <div className={`p-4 rounded-2xl ${service === s.id ? 'bg-brand-blue text-white shadow-lg' : 'bg-gray-100 text-gray-500'}`}>
                          <s.icon className="w-8 h-8" />
                       </div>
                       <div className="flex-1">
                          <h3 className="font-extrabold text-slate-900">{s.title}</h3>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{s.desc}</p>
                       </div>
                       <div className="text-right">
                          <p className="font-black text-brand-blue">{s.priceDisplay}</p>
                       </div>
                    </CardContent>
                  </Card>
                ))}
             </div>

             {service && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                   <h3 className="font-black text-slate-800">Choisissez votre véhicule :</h3>
                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {vehicles.map((v) => (
                        <Card 
                          key={v.id}
                          className={`cursor-pointer transition-all border-2 rounded-2xl ${vehicleType === v.id ? 'border-brand-orange bg-orange-50/20' : 'border-gray-100'}`}
                          onClick={() => setVehicleType(v.id)}
                        >
                          <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
                             <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${vehicleType === v.id ? 'bg-brand-orange text-white' : 'bg-gray-100 text-gray-400'}`}>
                                <v.icon className="w-6 h-6" />
                             </div>
                             <p className="text-xs font-black text-slate-900">{v.title}</p>
                             <p className="text-[8px] text-gray-400 font-bold uppercase">{v.desc}</p>
                          </CardContent>
                        </Card>
                      ))}
                   </div>
                </motion.div>
             )}
             
             <div className="flex justify-end pt-4">
                <Button size="lg" className="bg-brand-blue hover:bg-brand-blue-dark px-10 h-14 rounded-2xl font-black shadow-xl shadow-brand-blue/20" disabled={!service} onClick={() => setStep(2)}>
                   Suivant <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
             </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
             <Button variant="ghost" className="mb-4 text-brand-blue font-black px-0 hover:bg-transparent" onClick={() => setStep(1)}>← Retour à la sélection</Button>
             <div>
                <h2 className="text-2xl font-black text-slate-900">Itinéraire & Destinataire</h2>
                <p className="text-gray-500 font-medium tracking-tight">Où devons-nous intervenir ?</p>
             </div>

             <Card className="border-none shadow-premium rounded-[40px] bg-white">
                <CardContent className="p-10 space-y-10">
                   <div className="space-y-4">
                      <div className="flex gap-6">
                         <div className="flex flex-col items-center">
                            <div className="w-5 h-5 rounded-full border-4 border-brand-blue bg-white shadow-md shadow-brand-blue/20" />
                            <div className="w-0.5 h-20 border-l-2 border-dashed border-gray-200 my-2" />
                            <MapPin className="text-brand-orange w-5 h-5 filter drop-shadow-sm" />
                         </div>
                         <div className="flex-1 space-y-12">
                            <div className="space-y-3">
                               <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Lieu d'enlèvement</label>
                               <Input 
                                 className="h-14 bg-gray-50 border-none font-bold placeholder:text-gray-300 rounded-2xl shadow-inner"
                                 placeholder="Ex: Marché Total, Bacongo" 
                                 value={formData.origin}
                                 onChange={(e) => setFormData({...formData, origin: e.target.value})}
                               />
                            </div>
                            <div className="space-y-3">
                               <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Lieu de livraison</label>
                               <Input 
                                 className="h-14 bg-gray-50 border-none font-bold placeholder:text-gray-300 rounded-2xl shadow-inner"
                                 placeholder="Ex: Rue Itoua, Ouenzé" 
                                 value={formData.destination}
                                 onChange={(e) => setFormData({...formData, destination: e.target.value})}
                               />
                            </div>
                         </div>
                      </div>
                   </div>

                   <hr className="border-gray-50" />

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                      <div className="space-y-3">
                         <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Nom complet du destinataire</label>
                         <Input 
                           className="h-14 bg-gray-50 border-none font-bold rounded-2xl shadow-inner"
                           placeholder="Ex: John Doe" 
                           value={formData.receiverName}
                           onChange={(e) => setFormData({...formData, receiverName: e.target.value})}
                         />
                      </div>
                      <div className="space-y-3">
                         <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Numéro de téléphone</label>
                         <Input 
                           className="h-14 bg-gray-50 border-none font-bold rounded-2xl shadow-inner"
                           placeholder="Ex: +242 06 630..." 
                           value={formData.receiverPhone}
                           onChange={(e) => setFormData({...formData, receiverPhone: e.target.value})}
                         />
                      </div>
                   </div>
                </CardContent>
             </Card>

             <div className="flex justify-end pt-4">
                <Button size="lg" className="bg-brand-blue hover:bg-brand-blue-dark px-10 h-14 rounded-2xl font-black shadow-xl shadow-brand-blue/20" disabled={!formData.origin || !formData.destination} onClick={() => setStep(3)}>
                   Confirmer l'itinéraire <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
             </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
             <Button variant="ghost" className="mb-4 text-brand-blue font-black px-0 hover:bg-transparent" onClick={() => setStep(2)}>← Revoir l'itinéraire</Button>
             <div>
                <h2 className="text-2xl font-black text-slate-900">Méthode de règlement</h2>
                <p className="text-gray-500 font-medium">Choisissez comment vous souhaitez payer</p>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-6">
                   <div 
                     className={`p-6 rounded-[32px] border-2 cursor-pointer transition-all ${paymentMethod === 'cash' ? 'border-brand-blue bg-blue-50/20 shadow-lg' : 'border-gray-100 bg-white'}`}
                     onClick={() => setPaymentMethod('cash')}
                    >
                      <div className="flex items-center gap-6">
                         <div className={`p-4 rounded-2xl ${paymentMethod === 'cash' ? 'bg-brand-blue text-white' : 'bg-gray-100 text-gray-400'}`}>
                            <CreditCard className="w-6 h-6" />
                         </div>
                         <div className="flex-1">
                            <p className="font-extrabold text-slate-900 uppercase tracking-tighter">Paiement en Espèces</p>
                            <p className="text-xs text-gray-500 font-medium">Payez directement au livreur lors de la remise du colis.</p>
                         </div>
                         {paymentMethod === 'cash' && <CheckCircle2 className="text-brand-blue w-6 h-6" />}
                      </div>
                   </div>

                   <div 
                     className={`p-6 rounded-[32px] border-2 cursor-pointer transition-all ${paymentMethod === 'wallet' ? 'border-brand-orange bg-orange-50/20 shadow-lg' : 'border-gray-100 bg-white'}`}
                     onClick={() => setPaymentMethod('wallet')}
                    >
                      <div className="flex items-center gap-6">
                         <div className={`p-4 rounded-2xl ${paymentMethod === 'wallet' ? 'bg-brand-orange text-white' : 'bg-gray-100 text-gray-400'}`}>
                            <Box className="w-6 h-6" />
                         </div>
                         <div className="flex-1">
                            <div className="flex items-center gap-2">
                               <p className="font-extrabold text-slate-900 uppercase tracking-tighter">Mon Portefeuille</p>
                               <span className="text-[10px] font-black bg-brand-orange/10 text-brand-orange px-2 py-0.5 rounded-lg border border-brand-orange/10">Solde: {userBalance.toLocaleString()} FCFA</span>
                            </div>
                            <p className="text-xs text-gray-500 font-medium">Prélèvement automatique sur votre solde J'ARRIVE.</p>
                         </div>
                         {paymentMethod === 'wallet' && <CheckCircle2 className="text-brand-orange w-6 h-6" />}
                      </div>
                   </div>
                </div>

                <div className="space-y-6">
                   <Card className="border-none shadow-premium bg-slate-900 text-white rounded-[40px] overflow-hidden">
                      <div className="p-8 space-y-6">
                         <h3 className="text-lg font-black uppercase tracking-widest opacity-40">Récapitulatif</h3>
                         
                         <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                               <span className="font-medium opacity-60">Service</span>
                               <span className="font-black">{baseService?.title}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                               <span className="font-medium opacity-60">Véhicule</span>
                               <span className="font-black uppercase">{vehicleType}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                               <span className="font-medium opacity-60">Frais de base</span>
                               <span className="font-black">{baseService?.priceDisplay}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                               <span className="font-medium opacity-60">Multiplicateur véhicule</span>
                               <span className="font-black text-brand-orange">x{selectedVehicle?.multiplier}</span>
                            </div>
                         </div>

                         <hr className="border-white/10" />

                         <div className="flex justify-between items-end">
                            <p className="text-[10px] font-black uppercase opacity-60">Total à payer</p>
                            <div className="text-right">
                               <p className="text-3xl font-black text-brand-orange leading-none">{totalPrice.toLocaleString()}</p>
                               <p className="text-xs font-bold opacity-40 uppercase">FCFA</p>
                            </div>
                         </div>

                         <Button 
                           onClick={handlePayment}
                           disabled={loading}
                           className="w-full bg-brand-orange hover:bg-orange-600 h-16 rounded-2xl font-black text-lg shadow-xl shadow-brand-orange/30 border-none transition-transform active:scale-95"
                         >
                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Lancer la mission"}
                         </Button>
                      </div>
                   </Card>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
