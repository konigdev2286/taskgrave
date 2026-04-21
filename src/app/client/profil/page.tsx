"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { User, Mail, Phone, Briefcase, Camera, ShieldCheck, Star, Loader2, CheckCircle2 } from "lucide-react"
import { useState, useEffect } from "react"
import { useProfile } from "@/hooks/use-supabase"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

export default function ProfilPage() {
  const { profile, loading, refreshProfile } = useProfile()
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    company_name: '',
    company_rccm: '',
    company_sector: ''
  })
  const [isPro, setIsPro] = useState(false)
  const [saving, setSaving] = useState(false)

  // Sync form data with profile once loaded
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        company_name: profile.company_name || '',
        company_rccm: profile.company_rccm || '',
        company_sector: profile.company_sector || ''
      })
      setIsPro(profile.role === 'pro' || !!profile.company_name)
    }
  }, [profile])

  const handleSave = async () => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Non authentifié")

      const updates = {
        full_name: formData.full_name,
        phone: formData.phone,
        company_name: isPro ? formData.company_name : null,
        company_rccm: isPro ? formData.company_rccm : null,
        company_sector: isPro ? formData.company_sector : null,
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)

      if (error) throw error
      
      toast.success("Profil mis à jour avec succès !")
      refreshProfile()
    } catch (err: any) {
      toast.error("Erreur : " + err.message)
    } finally {
      setSaving(false)
    }
  }

  const getInitials = (name: string) => {
    if (!name) return "U"
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2 className="w-10 h-10 text-brand-blue animate-spin" />
        <p className="mt-4 text-gray-500 font-bold">Chargement de votre profil...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Mon Profil</h1>
        <div className="flex gap-2">
           <Button 
            variant={!isPro ? "default" : "outline"} 
            onClick={() => setIsPro(false)}
            className={!isPro ? "bg-brand-blue text-white font-bold" : "border-gray-200 text-slate-600 font-bold"}
           >
             Particulier
           </Button>
           <Button 
            variant={isPro ? "default" : "outline"} 
            onClick={() => setIsPro(true)}
            className={isPro ? "bg-brand-orange text-white font-bold" : "border-gray-200 text-slate-600 font-bold"}
           >
             Professionnel
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <Card className="border-none shadow-premium overflow-hidden bg-white rounded-[32px]">
            <CardContent className="p-8 flex flex-col items-center">
              <div className="relative group cursor-pointer">
                <div className="w-32 h-32 rounded-[40px] bg-brand-blue/5 flex items-center justify-center text-4xl font-black text-brand-blue border-4 border-white shadow-xl">
                  {getInitials(formData.full_name)}
                </div>
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 rounded-[40px] transition-opacity flex items-center justify-center">
                  <Camera className="text-white w-8 h-8" />
                </div>
              </div>
              <h3 className="mt-6 text-xl font-black text-slate-900 text-center">{formData.full_name || "Utilisateur"}</h3>
              <p className="text-sm text-gray-500 font-bold mt-1">Membre depuis {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : 'récemment'}</p>
              
              <div className="mt-8 w-full space-y-3">
                 <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <span className="text-[10px] font-black text-gray-400 upper tracking-widest">Note Client</span>
                    <div className="flex items-center gap-1 text-brand-orange">
                       <Star className="w-4 h-4 fill-current" />
                       <span className="text-sm font-black text-slate-900">{profile?.rating || "4.9"}</span>
                    </div>
                 </div>
                 <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</span>
                    <div className="flex items-center gap-1 text-green-600">
                       <CheckCircle2 className="w-4 h-4" />
                       <span className="text-sm font-black">Vérifié</span>
                    </div>
                 </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card className="border-none shadow-premium bg-white rounded-[32px] overflow-hidden">
            <CardHeader className="border-b border-gray-50 bg-gray-50/20 p-6">
              <CardTitle className="text-lg font-black flex items-center gap-2">
                 <User className="w-5 h-5 text-brand-blue" /> Informations Personnelles
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nom Complet</label>
                 <Input 
                   value={formData.full_name}
                   onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                   className="h-14 bg-gray-50/50 border-none font-bold text-slate-900 rounded-2xl px-6 focus:ring-brand-blue/20" 
                 />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email (Lecture seule)</label>
                  <div className="relative">
                     <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                     <Input 
                        value={profile?.email || ''} 
                        disabled 
                        className="pl-12 h-14 bg-gray-100/50 border-none font-bold text-gray-400 rounded-2xl" 
                     />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Téléphone</label>
                  <div className="relative">
                     <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                     <Input 
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder="+242..." 
                        className="pl-12 h-14 bg-gray-50/50 border-none font-bold text-slate-900 rounded-2xl focus:ring-brand-blue/20" 
                     />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {isPro && (
            <Card className="border-none shadow-premium bg-white rounded-[32px] overflow-hidden">
              <CardHeader className="border-b border-orange-50 bg-orange-50/30 p-6">
                <CardTitle className="text-lg font-black text-brand-orange flex items-center gap-2">
                   <Briefcase className="w-5 h-5" /> Profil Professionnel
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nom de l'entreprise</label>
                  <Input 
                    value={formData.company_name}
                    onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                    placeholder="Ex: Bakoula Bakery" 
                    className="h-14 bg-gray-50/50 border-none font-bold text-slate-900 rounded-2xl px-6 focus:ring-brand-orange/20" 
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Numéro RCCM</label>
                    <Input 
                      value={formData.company_rccm}
                      onChange={(e) => setFormData({...formData, company_rccm: e.target.value})}
                      placeholder="CG-BZV-..." 
                      className="h-14 bg-gray-50/50 border-none font-bold text-slate-900 rounded-2xl px-6 focus:ring-brand-orange/20" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Secteur d'activité</label>
                    <Input 
                      value={formData.company_sector}
                      onChange={(e) => setFormData({...formData, company_sector: e.target.value})}
                      placeholder="Restauration, Commerce..." 
                      className="h-14 bg-gray-50/50 border-none font-bold text-slate-900 rounded-2xl px-6 focus:ring-brand-orange/20" 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-3 pt-4">
             <Button 
               variant="outline" 
               className="border-gray-200 h-14 px-8 rounded-2xl font-bold"
               onClick={() => refreshProfile()}
             >
                Réinitialiser
             </Button>
             <Button 
               onClick={handleSave}
               disabled={saving}
               className="bg-brand-blue text-white shadow-xl shadow-brand-blue/20 px-10 h-14 rounded-2xl font-black text-sm uppercase tracking-widest"
             >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Enregistrer les modifications"}
             </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
