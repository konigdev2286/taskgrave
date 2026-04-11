"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { User, Truck, ShieldCheck, FileText, Camera, CreditCard, Star, MapPin, CheckCircle2, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

export default function ProfilLivreur() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error("Error fetching profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (name: string) => {
    if (!name) return "MK"
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
         <Loader2 className="w-10 h-10 text-brand-orange animate-spin" />
         <p className="mt-4 text-gray-400 font-bold tracking-tight">Chargement du profil...</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Mon Profil Livreur</h1>
          <p className="text-gray-500 font-medium">Gérez vos informations et vos documents de bord</p>
        </div>
        <div className="flex gap-3">
           <span className="bg-green-100 text-green-700 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-green-200 shadow-sm">Compte Certifié</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <Card className="border-none shadow-premium bg-white overflow-hidden rounded-[40px]">
            <CardContent className="p-10 flex flex-col items-center">
              <div className="relative group">
                <div className="w-36 h-36 rounded-[48px] bg-brand-orange/10 flex items-center justify-center text-4xl font-black text-brand-orange border-8 border-white shadow-2xl">
                  {getInitials(profile?.full_name)}
                </div>
                <button className="absolute bottom-0 right-0 bg-slate-900 text-white p-3 rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all">
                  <Camera className="w-5 h-5" />
                </button>
              </div>
              <h3 className="mt-8 text-2xl font-black text-slate-900 leading-tight">{profile?.full_name}</h3>
              <p className="text-sm text-gray-400 font-bold mt-1">
                Livreur depuis le {new Date(profile?.created_at).toLocaleDateString()}
              </p>
              
              <div className="mt-10 w-full grid grid-cols-2 gap-4">
                 <div className="p-5 rounded-[24px] bg-gray-50/50 flex flex-col items-center border border-gray-100/50 group hover:bg-white hover:shadow-xl transition-all">
                    <Star className="w-6 h-6 text-yellow-500 fill-current mb-2" />
                    <p className="text-xl font-black text-slate-900">4.9</p>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Note</p>
                 </div>
                 <div className="p-5 rounded-[24px] bg-gray-50/50 flex flex-col items-center border border-gray-100/50 group hover:bg-white hover:shadow-xl transition-all">
                    <CheckCircle2 className="w-6 h-6 text-green-500 mb-2" />
                    <p className="text-xl font-black text-slate-900">98%</p>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Fiabilité</p>
                 </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-premium bg-white p-8 rounded-[40px]">
             <h4 className="font-black text-slate-900 mb-6 flex items-center gap-3">
                <FileText className="w-5 h-5 text-brand-blue" /> Documents
             </h4>
             <div className="space-y-4">
                {[
                  { name: "Permis de conduire", status: "Validé", date: "Expire en 2027" },
                  { name: "Assurance Véhicule", status: "Validé", date: "Expire le 12/10" },
                  { name: "Casier Judiciaire", status: "Validé", date: "À jour" },
                ].map((doc, i) => (
                  <div key={i} className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0 last:pb-0">
                     <div className="min-w-0 flex-1">
                        <p className="text-sm font-black text-slate-900 truncate leading-none mb-1">{doc.name}</p>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{doc.date}</p>
                     </div>
                     <span className="text-[10px] font-black text-green-600 bg-green-50 px-3 py-1.5 rounded-xl border border-green-100">VALIDE</span>
                  </div>
                ))}
             </div>
             <Button variant="outline" className="w-full mt-8 border-gray-100 text-brand-blue font-black text-[10px] h-12 rounded-2xl uppercase tracking-widest hover:bg-brand-blue/5">Mettre à jour</Button>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-premium bg-white overflow-hidden rounded-[40px]">
             <CardHeader className="bg-gray-50/20 border-b border-gray-50 p-8">
                <CardTitle className="text-xl font-black flex items-center gap-3">
                   <Truck className="w-6 h-6 text-brand-orange" /> Informations Véhicule
                </CardTitle>
             </CardHeader>
             <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</label>
                      <select className="flex h-14 w-full rounded-2xl border-none bg-gray-50 px-5 py-2 text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-orange/20 shadow-inner">
                         <option>Moto (Sanya / Haojue)</option>
                         <option>Camionnette</option>
                         <option>Vélo / Trottinette</option>
                      </select>
                   </div>
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Immatriculation</label>
                      <Input defaultValue="ABC-123-CG" className="h-14 bg-gray-50 border-none font-black text-sm px-5 rounded-2xl shadow-inner" />
                   </div>
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Marque / Modèle</label>
                      <Input defaultValue="Haojue Express 150" className="h-14 bg-gray-50 border-none font-black text-sm px-5 rounded-2xl shadow-inner" />
                   </div>
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Couleur</label>
                      <Input defaultValue="Bleu J'ARRIVE" className="h-14 bg-gray-50 border-none font-black text-sm px-5 rounded-2xl shadow-inner" />
                   </div>
                </div>
             </CardContent>
          </Card>

          <Card className="border-none shadow-premium bg-white overflow-hidden rounded-[40px]">
             <CardHeader className="bg-gray-50/20 border-b border-gray-50 p-8">
                <CardTitle className="text-xl font-black flex items-center gap-3">
                   <CreditCard className="w-6 h-6 text-brand-blue" /> Paiement & Gains
                </CardTitle>
             </CardHeader>
             <CardContent className="p-8 space-y-8">
                <div className="flex items-center justify-between p-8 bg-brand-blue/5 rounded-[32px] border border-brand-blue/10">
                   <div className="flex items-center gap-5">
                      <div className="bg-white p-4 rounded-2xl shadow-premium">
                         <MapPin className="text-brand-blue w-7 h-7" />
                      </div>
                      <div>
                         <p className="text-sm font-black text-slate-900 mb-1">MTN Mobile Money</p>
                         <p className="text-sm text-brand-blue font-black tracking-widest">{profile?.phone || '+242 06 000 00 00'}</p>
                      </div>
                   </div>
                   <Button variant="ghost" className="text-brand-blue font-black text-[10px] uppercase tracking-widest hover:bg-brand-blue/10 rounded-xl px-6">Modifier</Button>
                </div>
                <div className="flex items-center justify-between gap-8 pt-4">
                   <div className="p-3 bg-slate-50 rounded-2xl">
                    <p className="text-[10px] text-gray-400 font-bold leading-relaxed">
                      Votre compte MoMo sera débité hebdomadairement du montant de vos gains accumulés sur la plateforme J'ARRIVE.
                    </p>
                   </div>
                   <Button className="bg-brand-blue hover:bg-brand-blue-dark px-10 h-14 font-black rounded-2xl shadow-xl shadow-brand-blue/20 text-sm">Enregistrer</Button>
                </div>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
