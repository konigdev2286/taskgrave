"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Truck, Package, MapPin, CreditCard, ChevronRight, Flame, Box, CheckCircle2, Loader2, Bike, Car, User, Phone, Map as MapIcon, ArrowLeft, Info } from "lucide-react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useProfile } from "@/hooks/use-supabase"
import { toast } from "sonner"

export default function CommanderPage() {
  const router = useRouter()
  const { profile, loading: loadingProfile } = useProfile()
  const [step, setStep] = useState(1)
  const [service, setService] = useState("")
  const [vehicleType, setVehicleType] = useState("moto")
  const [paymentMethod, setPaymentMethod] = useState("cash") // 'cash' or 'wallet'
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    origin: "",
    destination: "",
    receiverName: "",
    receiverPhone: "",
  })

  const services = [
    { id: "colis", title: "Livraison à domicile", desc: "Vos colis, repas, documents...", icon: Package, price: 1500, color: "blue" },
    { id: "gaz", title: "Livraison de Gaz", desc: "Échange de bouteille vide/pleine", icon: Flame, price: 2500, color: "orange" },
    { id: "moving", title: "Déménagement", desc: "Transport de meubles & utilitaire", icon: Truck, price: 25000, color: "blue" },
    { id: "storage", title: "Stockage & Garde", desc: "Espace sécurisé temporaire", icon: Box, price: 5000, color: "blue" },
  ]

  const vehicles = [
    { id: "moto", title: "Moto", icon: Bike, multiplier: 1, desc: "Rapide, idéal petits objets" },
    { id: "van", title: "Voiture/Van", icon: Car, multiplier: 2.5, desc: "Espace & protection pluie" },
    { id: "bicycle", title: "Vélo", icon: Bike, multiplier: 0.8, desc: "Courtes distances, éco" },
  ]

  const baseService = services.find(s => s.id === service)
  const selectedVehicle = vehicles.find(v => v.id === vehicleType)
  const totalPrice = baseService ? Math.floor(baseService.price * (selectedVehicle?.multiplier || 1)) : 0

  const handleNextStep = () => {
    if (step === 2) {
      if (!formData.origin || !formData.destination || !formData.receiverName || !formData.receiverPhone) {
        toast.error("Veuillez remplir toutes les informations d'itinéraire.")
        return
      }
    }
    setStep(prev => prev + 1)
  }

  const handleOrder = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error("Veuillez vous connecter pour commander.")
        router.push("/auth/login")
        return
      }

      if (paymentMethod === 'wallet' && (profile?.balance || 0) < totalPrice) {
        toast.error("Solde insuffisant dans votre portefeuille.")
        setLoading(false)
        return
      }


      console.log("[Order] Creating mission with data:", {
        client_id: user.id,
        service,
        vehicleType,
        formData,
        totalPrice,
        paymentMethod
      })

      const { data: mission, error } = await supabase
        .from('missions')
        .insert({
          client_id: user.id,
          type: service,
          vehicle_type_requested: vehicleType,
          origin_address: formData.origin,
          dest_address: formData.destination,
          receiver_name: formData.receiverName,
          receiver_phone: formData.receiverPhone,
          price_fcfa: totalPrice,
          status: 'pending',
          payment_status: paymentMethod === 'wallet' ? 'paid' : 'unpaid',
          payment_method: paymentMethod
        })
        .select()
        .single()

      if (error) {
        console.error("[Order] Supabase mission insertion error:", error)
        throw error
      }

      console.log("[Order] Mission created successfully:", mission)

      if (paymentMethod === 'wallet') {
        const { error: balanceError } = await supabase
          .from('profiles')
          .update({ balance: (profile?.balance || 0) - totalPrice })
          .eq('id', user.id)
        if (balanceError) {
          console.error("[Order] Balance update error:", balanceError)
          throw balanceError
        }
      }

      // Track admin notification - Fetch an admin first
      const { data: adminUser } = await supabase.from('profiles').select('id').eq('role', 'admin').limit(1).maybeSingle()
      
      await supabase.from('notifications').insert({
        user_id: adminUser?.id, 
        title: "Nouvelle Mission",
        message: `Mission ${service} créée par ${profile?.full_name || 'un client'}.`,
        type: 'info',
        link: `/admin/live`
      })

      setSuccess(true)
      toast.success("Commande envoyée avec succès !")
      
      setTimeout(() => {
        router.push("/client/suivi")
      }, 3000)

    } catch (error: any) {
      console.error("Error creating mission:", error)
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-6">
        <motion.div 
          initial={{ scale: 0, rotate: -180 }} 
          animate={{ scale: 1, rotate: 0 }} 
          className="w-32 h-32 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-8 border border-green-100 shadow-xl shadow-green-50"
        >
          <CheckCircle2 className="w-16 h-16" />
        </motion.div>
        <div className="space-y-3 mb-10">
          <h2 className="text-4xl font-black text-slate-900">Mission Lancée !</h2>
          <p className="text-gray-500 text-lg max-w-md mx-auto font-medium">
            Votre commande est en cours de traitement. Un livreur sera bientôt assigné à votre mission.
          </p>
        </div>
        <div className="flex items-center gap-3 px-6 py-3 bg-brand-blue/5 rounded-2xl border border-brand-blue/10">
          <Loader2 className="w-5 h-5 animate-spin text-brand-blue" />
          <p className="text-sm text-brand-blue font-black tracking-tight uppercase">Redirection vers le suivi en cours...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20">
      {/* Stepper Header */}
      <div className="flex justify-between items-center bg-gray-50/50 p-6 rounded-[32px] border border-gray-100">
        <div className="flex items-center gap-10">
           {[1, 2, 3].map((s) => (
             <div key={s} className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg transition-all duration-500 ${
                  step >= s ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20 rotate-[360deg]' : 'bg-white text-gray-300 border border-gray-100'
                }`}>
                   {s}
                </div>
                <div className="hidden md:block">
                   <p className={`text-[10px] font-black uppercase tracking-widest ${step >= s ? 'text-brand-blue' : 'text-gray-300'}`}>
                     Étape {s}
                   </p>
                   <p className={`text-xs font-bold leading-none ${step >= s ? 'text-slate-900' : 'text-gray-300'}`}>
                     {s === 1 ? 'Service' : s === 2 ? 'Itinéraire' : 'Paiement'}
                   </p>
                </div>
                {s < 3 && <div className={`h-1 w-12 rounded-full hidden md:block ml-4 ${step > s ? 'bg-brand-blue' : 'bg-gray-200'}`} />}
             </div>
           ))}
        </div>
        <div className="hidden lg:block text-right">
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Estimé</p>
           <p className="text-2xl font-black text-brand-orange">{totalPrice.toLocaleString()} <span className="text-xs font-bold opacity-40">FCFA</span></p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div 
            key="step1" 
            initial={{ opacity: 0, x: 50 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -50 }} 
            className="space-y-10"
          >
             <div className="flex flex-col md:flex-row items-end justify-between gap-6">
                <div>
                   <h2 className="text-4xl font-black text-slate-900 tracking-tight">Bonjour {profile?.full_name?.split(' ')[0]},</h2>
                   <p className="text-gray-500 text-lg font-medium">De quoi avez-vous besoin aujourd'hui ?</p>
                </div>
                <div className="flex gap-2">
                   {["Tous", "Colis", "Services"].map(f => (
                     <Button key={f} variant="outline" className="rounded-full h-8 px-4 text-[10px] font-black uppercase tracking-widest border-gray-100">{f}</Button>
                   ))}
                </div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {services.map((s) => (
                  <Card 
                    key={s.id} 
                    className={`group cursor-pointer transition-all border-none shadow-premium rounded-[40px] overflow-hidden relative ${
                      service === s.id ? 'ring-4 ring-brand-blue/10 bg-blue-50/20' : 'bg-white hover:bg-gray-50/50'
                    }`}
                    onClick={() => setService(s.id)}
                  >
                    <CardContent className="p-8 flex items-center gap-8">
                       <div className={`w-20 h-20 rounded-[28px] flex items-center justify-center transition-transform group-hover:scale-110 duration-500 ${
                         service === s.id ? 'bg-brand-blue text-white shadow-xl shadow-brand-blue/20' : 'bg-gray-50 text-gray-400'
                       }`}>
                          <s.icon className="w-10 h-10" />
                       </div>
                       <div className="flex-1">
                          <h3 className="text-xl font-black text-slate-900 mb-1">{s.title}</h3>
                          <p className="text-sm text-gray-400 font-medium leading-tight">{s.desc}</p>
                       </div>
                       <div className="text-right">
                          <p className="text-[10px] font-black text-gray-300 uppercase mb-1">Dès</p>
                          <p className={`text-xl font-black ${service === s.id ? 'text-brand-blue' : 'text-slate-900'}`}>{s.price.toLocaleString()} <span className="text-[10px]">F</span></p>
                       </div>
                       {service === s.id && (
                         <div className="absolute top-4 right-4">
                            <CheckCircle2 className="w-6 h-6 text-brand-blue" />
                         </div>
                       )}
                    </CardContent>
                  </Card>
                ))}
             </div>

             <AnimatePresence>
               {service && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="space-y-6 pt-6"
                  >
                     <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-brand-orange rounded-full" />
                        <h3 className="text-2xl font-black text-slate-900">Type de Véhicule</h3>
                     </div>
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {vehicles.map((v) => (
                          <Card 
                            key={v.id}
                            className={`cursor-pointer transition-all border-none shadow-sm rounded-3xl group ${
                              vehicleType === v.id ? 'bg-slate-900 text-white shadow-2xl' : 'bg-white hover:bg-gray-50'
                            }`}
                            onClick={() => setVehicleType(v.id)}
                          >
                            <CardContent className="p-6 flex flex-col items-center gap-4 text-center">
                               <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                                 vehicleType === v.id ? 'bg-brand-orange text-white' : 'bg-gray-50 text-gray-400'
                               }`}>
                                  <v.icon className="w-8 h-8" />
                               </div>
                               <div>
                                  <p className="text-lg font-black">{v.title}</p>
                                  <p className={`text-[10px] font-black uppercase tracking-widest opacity-40`}>{v.desc}</p>
                               </div>
                               {v.multiplier > 1 && (
                                 <span className="text-[8px] font-black bg-brand-orange/20 text-brand-orange px-2 py-0.5 rounded-full uppercase tracking-tighter">Premium Service</span>
                               )}
                            </CardContent>
                          </Card>
                        ))}
                     </div>
                  </motion.div>
               )}
             </AnimatePresence>
             
             <div className="flex justify-end pt-8">
                <Button 
                  size="lg" 
                  disabled={!service} 
                  onClick={handleNextStep}
                  className="bg-brand-blue hover:bg-brand-blue-dark px-12 h-16 rounded-[24px] font-black text-xl shadow-2xl shadow-brand-blue/30 flex gap-3 group transition-all"
                >
                   Continuer <ChevronRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </Button>
             </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            key="step2" 
            initial={{ opacity: 0, x: 50 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -50 }} 
            className="space-y-8"
          >
             <button 
               className="flex items-center gap-2 text-brand-blue font-black text-xs hover:gap-4 transition-all uppercase tracking-widest"
               onClick={() => setStep(1)}
             >
                <ArrowLeft className="w-4 h-4" /> Retour
             </button>

             <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Où devons-nous aller ?</h2>
                  <p className="text-gray-500 font-medium">Définissez l'itinéraire et les contacts.</p>
                </div>
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                   <MapIcon className="w-8 h-8" />
                </div>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <Card className="border-none shadow-premium rounded-[40px] bg-white lg:col-span-1">
                   <CardContent className="p-10 space-y-12">
                      <div className="flex gap-8">
                         <div className="flex flex-col items-center">
                            <div className="w-6 h-6 rounded-full border-4 border-brand-blue bg-white shadow-xl shadow-brand-blue/20" />
                            <div className="w-0.5 h-24 border-l-2 border-dashed border-gray-200 my-2" />
                            <div className="w-6 h-6 rounded-full bg-brand-orange shadow-xl shadow-brand-orange/20 flex items-center justify-center">
                               <div className="w-2 h-2 bg-white rounded-full" />
                            </div>
                         </div>
                         <div className="flex-1 space-y-16">
                            <div className="space-y-4">
                               <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1 flex items-center gap-2">
                                  <MapPin className="w-3 h-3 text-brand-blue" /> Lieu d'enlèvement
                               </label>
                               <Input 
                                 className="h-16 bg-gray-50 border-none font-bold text-lg placeholder:text-gray-300 rounded-3xl shadow-inner px-6 focus:ring-4 ring-brand-blue/10"
                                 placeholder="Ex: Marché Total, Bacongo" 
                                 value={formData.origin}
                                 onChange={(e) => setFormData({...formData, origin: e.target.value})}
                               />
                            </div>
                            <div className="space-y-4">
                               <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1 flex items-center gap-2">
                                  <MapPin className="w-3 h-3 text-brand-orange" /> Lieu de livraison
                               </label>
                               <Input 
                                 className="h-16 bg-gray-50 border-none font-bold text-lg placeholder:text-gray-300 rounded-3xl shadow-inner px-6 focus:ring-4 ring-brand-orange/10"
                                 placeholder="Ex: Rue Itoua, Ouenzé" 
                                 value={formData.destination}
                                 onChange={(e) => setFormData({...formData, destination: e.target.value})}
                               />
                            </div>
                         </div>
                      </div>
                   </CardContent>
                </Card>

                <Card className="border-none shadow-premium rounded-[40px] bg-slate-900 text-white lg:col-span-1">
                   <CardContent className="p-10 space-y-10">
                      <h3 className="text-xl font-black flex items-center gap-3">
                         <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-brand-orange">
                            <User className="w-5 h-5" />
                         </div>
                         Contact Destinataire
                      </h3>
                      
                      <div className="space-y-8">
                         <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">Nom du destinataire</label>
                            <Input 
                              className="h-14 bg-white/5 border-white/10 text-white font-bold rounded-2xl focus:ring-2 ring-brand-orange/20"
                              placeholder="Ex: John Doe" 
                              value={formData.receiverName}
                              onChange={(e) => setFormData({...formData, receiverName: e.target.value})}
                            />
                         </div>
                         <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">Téléphone mobile</label>
                            <div className="relative">
                               <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                               <Input 
                                 className="h-14 bg-white/5 border-white/10 text-white pl-12 font-bold rounded-2xl focus:ring-2 ring-brand-orange/20"
                                 placeholder="06 123 4567" 
                                 value={formData.receiverPhone}
                                 onChange={(e) => setFormData({...formData, receiverPhone: e.target.value})}
                               />
                            </div>
                         </div>
                      </div>
                      
                      <div className="bg-white/5 p-6 rounded-3xl border border-white/5 flex gap-4 items-start">
                         <div className="bg-brand-blue/20 p-2 rounded-xl text-brand-blue">
                            <Info className="w-5 h-5" />
                         </div>
                         <p className="text-[10px] text-white/60 font-medium leading-relaxed">
                            Ce contact recevra un code de confirmation par SMS lors de l'arrivée du livreur.
                         </p>
                      </div>
                   </CardContent>
                </Card>
             </div>

             <div className="flex justify-end pt-8">
                <Button 
                   size="lg" 
                   onClick={handleNextStep}
                   className="bg-brand-blue hover:bg-brand-blue-dark px-12 h-16 rounded-[24px] font-black text-xl shadow-2xl shadow-brand-blue/30 flex gap-3 group transition-all"
                >
                   Vérifier le tarif <ChevronRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </Button>
             </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div 
            key="step3" 
            initial={{ opacity: 0, x: 50 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -50 }} 
            className="space-y-10"
          >
             <button 
               className="flex items-center gap-2 text-brand-blue font-black text-xs hover:gap-4 transition-all uppercase tracking-widest"
               onClick={() => setStep(2)}
             >
                <ArrowLeft className="w-4 h-4" /> Réajuster l'itinéraire
             </button>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-8">
                   <div>
                      <h2 className="text-3xl font-black text-slate-900 tracking-tight">Règlement</h2>
                      <p className="text-gray-500 font-medium">Sélectionnez votre mode de paiement sécurisé.</p>
                   </div>
                   
                   <div className="space-y-6">
                      <Card 
                        className={`group p-8 rounded-[40px] border-none shadow-premium cursor-pointer transition-all ${
                          paymentMethod === 'cash' ? 'bg-slate-900 text-white ring-4 ring-brand-blue/20 scale-[1.02]' : 'bg-white hover:bg-gray-50'
                        }`}
                        onClick={() => setPaymentMethod('cash')}
                       >
                         <div className="flex items-center gap-8">
                            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-transform group-hover:rotate-[15deg] ${
                              paymentMethod === 'cash' ? 'bg-brand-blue text-white' : 'bg-gray-100 text-gray-400'
                            }`}>
                               <CreditCard className="w-10 h-10" />
                            </div>
                            <div className="flex-1">
                               <p className="text-2xl font-black tracking-tight uppercase">Espèces / MoMo</p>
                               <p className={`text-sm font-medium ${paymentMethod === 'cash' ? 'text-white/60' : 'text-gray-400'}`}>
                                  Payez directement au livreur cash ou via transfert MoMo lors de la remise.
                               </p>
                            </div>
                            {paymentMethod === 'cash' && <CheckCircle2 className="text-brand-blue w-8 h-8" />}
                         </div>
                      </Card>

                      <Card 
                        className={`group p-8 rounded-[40px] border-none shadow-premium cursor-pointer transition-all relative ${
                          paymentMethod === 'wallet' ? 'bg-slate-900 text-white ring-4 ring-brand-orange/20 scale-[1.02]' : 'bg-white hover:bg-gray-50'
                        }`}
                        onClick={() => setPaymentMethod('wallet')}
                       >
                         <div className="flex items-center gap-8">
                            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-transform group-hover:rotate-[15deg] ${
                              paymentMethod === 'wallet' ? 'bg-brand-orange text-white text-brand-orange shadow-xl shadow-brand-orange/20' : 'bg-gray-100 text-gray-400'
                            }`}>
                               <Box className="w-10 h-10" />
                            </div>
                            <div className="flex-1">
                               <div className="flex items-center gap-3">
                                  <p className="text-2xl font-black tracking-tight uppercase">Mon Portefeuille</p>
                                  <span className="text-[10px] font-black bg-brand-orange/10 text-brand-orange px-3 py-1 rounded-full border border-brand-orange/10">Solde: {profile?.balance?.toLocaleString()} F</span>
                               </div>
                               <p className={`text-sm font-medium ${paymentMethod === 'wallet' ? 'text-white/60' : 'text-gray-400'}`}>
                                  Paiement instantané débité de votre compte J'ARRIVE. Aucune manipulation de cash.
                               </p>
                            </div>
                            {paymentMethod === 'wallet' && <CheckCircle2 className="text-brand-orange w-8 h-8" />}
                         </div>
                         {profile?.balance < totalPrice && (
                            <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] rounded-[40px] flex items-center justify-center cursor-not-allowed">
                               <p className="text-xs font-black text-red-500 uppercase tracking-widest bg-white px-6 py-2 rounded-full border border-red-100 shadow-xl">Solde Insuffisant</p>
                            </div>
                         )}
                      </Card>
                   </div>
                </div>

                <div className="space-y-8">
                   <div className="sticky top-28">
                      <Card className="border-none shadow-2xl bg-brand-blue text-white rounded-[40px] overflow-hidden relative">
                         <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-40 h-40 bg-white opacity-5 rounded-full blur-3xl" />
                         
                         <div className="p-8 space-y-8 relative z-10">
                            <h3 className="text-lg font-black uppercase tracking-widest opacity-40">Détails Mission</h3>
                            
                            <div className="space-y-5">
                               <div className="flex justify-between items-center text-sm">
                                  <span className="font-medium opacity-60">Service</span>
                                  <span className="font-black bg-white/10 px-3 py-1 rounded-lg">{baseService?.title}</span>
                               </div>
                               <div className="flex justify-between items-center text-sm">
                                  <span className="font-medium opacity-60">Véhicule</span>
                                  <span className="font-black uppercase bg-white/10 px-3 py-1 rounded-lg">{vehicleType}</span>
                               </div>
                               <div className="flex justify-between items-center text-sm">
                                  <span className="font-medium opacity-60">Multiplicateur</span>
                                  <span className="font-black text-brand-orange">x{selectedVehicle?.multiplier}</span>
                               </div>
                               <div className="pt-2">
                                  <p className="text-[10px] font-black uppercase opacity-40 mb-2">Trajet</p>
                                  <div className="flex items-center gap-2 text-xs font-bold truncate">
                                     <MapPin className="w-3 h-3 text-brand-orange flex-shrink-0" />
                                     <span className="truncate">{formData.origin.split(',')[0]} → {formData.destination.split(',')[0]}</span>
                                  </div>
                               </div>
                            </div>

                            <hr className="border-white/10" />

                            <div className="flex justify-between items-end">
                               <div className="space-y-1">
                                  <p className="text-[10px] font-black uppercase opacity-60 tracking-wider text-brand-orange">Montant Total</p>
                                  <div className="flex items-baseline gap-2">
                                     <p className="text-5xl font-black leading-none">{totalPrice.toLocaleString()}</p>
                                     <p className="text-sm font-bold opacity-40">FCFA</p>
                                  </div>
                               </div>
                            </div>

                            <Button 
                              onClick={handleOrder}
                              disabled={loading || (paymentMethod === 'wallet' && profile?.balance < totalPrice)}
                              className="w-full bg-brand-orange hover:bg-orange-600 h-20 rounded-3xl font-black text-xl shadow-2xl shadow-brand-orange/40 border-none transition-all active:scale-95 group"
                            >
                               {loading ? <Loader2 className="w-8 h-8 animate-spin" /> : (
                                 <span className="flex items-center gap-3">
                                    Confirmer Command <Package className="w-6 h-6 group-hover:animate-bounce" />
                                 </span>
                               )}
                            </Button>
                            <p className="text-[9px] text-center text-white/40 font-bold uppercase tracking-widest">
                               Sécurisé via SSL · J'ARRIVE Logistique
                            </p>
                         </div>
                      </Card>
                   </div>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
