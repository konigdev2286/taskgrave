"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Bot, Plus, Trash2, Save, Loader2, Info, Search } from "lucide-react"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

export default function AdminBotPage() {
  const [rules, setRules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  // Form state
  const [newKeywords, setNewKeywords] = useState("")
  const [newResponse, setNewResponse] = useState("")

  useEffect(() => {
    fetchRules()
  }, [])

  async function fetchRules() {
    try {
      const { data, error } = await supabase
        .from('bot_knowledge')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        if (error.code === 'PGRST116' || error.message.includes('relation "bot_knowledge" does not exist')) {
           toast.error("La table 'bot_knowledge' n'existe pas encore dans votre base de données.")
        } else {
           throw error
        }
      }
      setRules(data || [])
    } catch (err: any) {
      console.error(err)
      toast.error("Erreur de chargement")
    } finally {
      setLoading(false)
    }
  }

  async function handleAddRule() {
    if (!newKeywords.trim() || !newResponse.trim()) {
      toast.error("Veuillez remplir tous les champs.")
      return
    }

    setSaving(true)
    try {
      const keywordArray = newKeywords.split(',').map(k => k.trim()).filter(k => k !== "")
      
      const { data, error } = await supabase
        .from('bot_knowledge')
        .insert({
          keywords: keywordArray,
          response: newResponse.trim()
        })
        .select()

      if (error) throw error

      toast.success("Règle ajoutée avec succès")
      setNewKeywords("")
      setNewResponse("")
      fetchRules()
    } catch (err: any) {
      toast.error("Erreur: " + err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteRule(id: string) {
    try {
      const { error } = await supabase
        .from('bot_knowledge')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success("Règle supprimée")
      setRules(rules.filter(r => r.id !== id))
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const filteredRules = rules.filter(r => 
    r.keywords.join(',').toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.response.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-brand-blue animate-spin" />
        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Chargement du cerveau du bot...</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
             <div className="p-3 bg-brand-blue rounded-2xl text-white shadow-xl shadow-brand-blue/20">
                <Bot className="w-8 h-8" />
             </div>
             Cerveau du Bot <span className="text-brand-orange text-lg">Beta</span>
          </h1>
          <p className="text-gray-500 font-medium mt-2">Définit les réponses manuelles pour les questions fréquentes.</p>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 max-w-sm flex gap-3">
           <Info className="w-5 h-5 text-brand-blue shrink-0 mt-1" />
           <p className="text-[10px] text-blue-700 font-bold leading-relaxed">
              Les règles définies ici sont prioritaires sur l'IA Gemini. Utilisez des mots-clés simples séparés par des virgules.
           </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Formulaire d'ajout */}
        <Card className="border-none shadow-premium bg-white h-fit rounded-[40px] sticky top-28">
           <CardHeader className="p-8 pb-4">
              <CardTitle className="text-xl font-black">Ajouter une Règle</CardTitle>
           </CardHeader>
           <CardContent className="p-8 space-y-6">
              <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Mots-clés (séparés par virgule)</label>
                 <Input 
                   value={newKeywords}
                   onChange={(e) => setNewKeywords(e.target.value)}
                   placeholder="ex: recrutement, job, livreur" 
                   className="h-14 bg-gray-50 border-none rounded-2xl font-bold px-6 focus:ring-4 ring-brand-blue/10"
                 />
              </div>
              <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Réponse du Bot</label>
                 <Textarea 
                   value={newResponse}
                   onChange={(e) => setNewResponse(e.target.value)}
                   placeholder="Votre réponse personnalisée ici..."
                   className="min-h-[150px] bg-gray-50 border-none rounded-2xl p-6 font-medium focus:ring-4 ring-brand-blue/10"
                 />
              </div>
              <Button 
                onClick={handleAddRule}
                disabled={saving}
                className="w-full h-14 bg-brand-blue hover:bg-brand-blue-dark rounded-2xl font-black text-lg shadow-xl shadow-brand-blue/20 transition-all active:scale-95 flex gap-2"
              >
                 {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Plus className="w-5 h-5" /> Enregistrer la règle</>}
              </Button>
           </CardContent>
        </Card>

        {/* Liste des règles */}
        <div className="lg:col-span-2 space-y-6">
           <div className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
              <Input 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher une règle ou un mot-clé..." 
                className="h-16 pl-14 bg-white border-none shadow-premium rounded-3xl font-bold px-8 focus:ring-4 ring-brand-blue/10"
              />
           </div>

           <div className="space-y-4">
              {filteredRules.length === 0 ? (
                <div className="p-20 text-center bg-gray-50/50 rounded-[40px] border-2 border-dashed border-gray-100">
                   <p className="text-gray-400 font-bold">Aucune règle trouvée.</p>
                </div>
              ) : filteredRules.map((rule) => (
                <Card key={rule.id} className="border-none shadow-sm bg-white hover:shadow-md transition-shadow rounded-[32px] overflow-hidden group">
                   <CardContent className="p-6">
                      <div className="flex justify-between items-start gap-4">
                         <div className="flex-1 space-y-4">
                            <div className="flex flex-wrap gap-2">
                               {rule.keywords.map((kw: string, i: number) => (
                                 <span key={i} className="text-[9px] font-black uppercase tracking-widest bg-brand-orange/10 text-brand-orange px-3 py-1 rounded-full border border-brand-orange/5">
                                   {kw}
                                 </span>
                               ))}
                            </div>
                            <p className="text-slate-700 font-medium leading-relaxed">{rule.response}</p>
                            <p className="text-[9px] text-gray-300 font-bold uppercase tracking-tighter">Créé le {new Date(rule.created_at).toLocaleDateString()}</p>
                         </div>
                         <Button 
                           variant="ghost" 
                           size="icon" 
                           onClick={() => handleDeleteRule(rule.id)}
                           className="text-gray-200 hover:text-red-500 hover:bg-red-50 transition-colors rounded-xl"
                         >
                            <Trash2 className="w-5 h-5" />
                         </Button>
                      </div>
                   </CardContent>
                </Card>
              ))}
           </div>
        </div>
      </div>
    </div>
  )
}
