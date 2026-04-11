"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Truck, Mail, Lock, Eye, EyeOff, Building, User, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function LoginPage() {
  const router = useRouter()
  const [role, setRole] = useState<'client' | 'driver' | 'admin'>('client')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) throw authError

      // Fetch user role from profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .single()

      if (profileError) {
        console.error("Error fetching profile:", profileError)
        // Fallback or error
        setError("Impossible de récupérer votre profil. Contactez le support.")
        return
      }

      // Secure redirection based on database role
      const userRole = profile.role

      if (userRole === 'admin') {
        router.push('/admin')
      } else if (userRole === 'driver') {
        router.push('/driver')
      } else {
        // 'particular' or 'pro' are clients
        router.push('/client')
      }

    } catch (err: any) {
      setError(err.message || "Erreur de connexion")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
           <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <div className="bg-brand-orange p-1.5 rounded-lg shadow-lg shadow-brand-orange/20">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black text-brand-blue italic tracking-tighter">J'ARRIVE</span>
           </Link>
           <h1 className="text-3xl font-black text-slate-900">Content de vous revoir</h1>
           <p className="text-gray-500 font-medium">Connectez-vous pour gérer vos livraisons</p>
        </div>

        <div className="flex p-1 bg-gray-100 rounded-2xl gap-1">
           {(['client', 'driver', 'admin'] as const).map((r) => (
             <button
              key={r}
              onClick={() => setRole(r)}
              className={`flex-1 py-3 px-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                role === r 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
             >
               {r === 'client' ? 'Client' : r === 'driver' ? 'Livreur' : 'Admin'}
             </button>
           ))}
        </div>

        <Card className="border border-gray-100 shadow-premium bg-white">
           <CardContent className="p-8 space-y-6">
              <form onSubmit={handleLogin} className="space-y-6">
                 {error && (
                   <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold">
                      {error}
                   </div>
                 )}

                 <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Email professionnel</label>
                    <div className="relative">
                       <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                       <Input 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nom@exemple.com" 
                        className="pl-12 h-14 bg-gray-50/50 border-none rounded-2xl font-bold" 
                        required 
                       />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <div className="flex justify-between items-center ml-1">
                       <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Mot de passe</label>
                       <Link href="/auth/forgot-password" title="Réinitialiser" className="text-[10px] font-black text-brand-blue uppercase hover:underline">Oublié ?</Link>
                    </div>
                    <div className="relative">
                       <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                       <Input 
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••" 
                        className="pl-12 h-14 bg-gray-50/50 border-none rounded-2xl font-bold" 
                        required 
                       />
                       <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-blue"
                       >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                       </button>
                    </div>
                 </div>

                 <Button 
                  disabled={loading}
                  className={`w-full h-14 rounded-2xl font-black text-lg shadow-xl border-none ${
                    role === 'admin' ? 'bg-slate-900 shadow-slate-200' : 
                    role === 'driver' ? 'bg-brand-orange shadow-brand-orange/20' : 
                    'bg-brand-blue shadow-brand-blue/20'
                  }`}
                 >
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Se connecter'}
                 </Button>
              </form>

              <div className="text-center">
                 <p className="text-sm text-gray-500 font-medium">
                    Pas encore de compte ? {" "}
                    <Link href="/auth/register" className="text-brand-blue font-bold hover:underline">Créer un compte</Link>
                 </p>
              </div>
           </CardContent>
        </Card>

        <div className="flex items-center gap-4 text-gray-200">
           <div className="h-px flex-1 bg-current" />
           <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Paiements sécurisés MoMo</span>
           <div className="h-px flex-1 bg-current" />
        </div>
      </div>
    </div>
  )
}
