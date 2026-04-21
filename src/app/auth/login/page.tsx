"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Truck, Mail, Lock, Eye, EyeOff, Building, User, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function LoginPage() {
  const router = useRouter()
  const [role, setRole] = useState<'client' | 'driver'>('client')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
         const { data: profile } = await supabase
           .from('profiles')
           .select('role')
           .eq('id', session.user.id)
           .maybeSingle()
         
         if (profile) {
            if (profile.role === 'admin') router.push('/admin')
            else if (profile.role === 'driver') router.push('/driver')
            else router.push('/client')
         }
      }
    }
    checkUser()
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (authError) throw authError
      await handleSuccessfulLogin(authData.user?.id)
    } catch (err: any) {
      setError(err.message || "Erreur de connexion. Vérifiez vos identifiants.")
    } finally {
      setLoading(false)
    }
  }

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?role=${role}`,
          data: { role } // Ceci est stocké dans raw_user_meta_data
        }
      })
      if (error) throw error
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Veuillez saisir votre email pour réinitialiser votre mot de passe.")
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      if (error) throw error
      setMessage("Un lien de réinitialisation a été envoyé à votre adresse email.")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSuccessfulLogin = async (userId?: string) => {
    if (!userId) return

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle()

    if (profileError) throw profileError

    if (profile?.role === 'admin') router.push('/admin')
    else if (profile?.role === 'driver') router.push('/driver')
    else router.push('/client')
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[100%] h-[100%] bg-brand-orange/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[100%] h-[100%] bg-brand-blue/5 rounded-full blur-[120px]" />
      </div>

      <Card className="w-full max-w-[480px] border-none shadow-premium bg-white rounded-[50px] overflow-hidden">
        <div className="bg-slate-900 p-10 text-white text-center">
          <div className="flex justify-center items-center gap-3 mb-6">
            <div className="bg-brand-orange p-2 rounded-xl">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black italic tracking-tighter">J'ARRIVE</span>
          </div>
          <h1 className="text-3xl font-black mb-2">Bon retour !</h1>
          <p className="text-gray-400 text-sm font-medium">Connectez-vous pour gérer vos livraisons.</p>
        </div>

        <CardContent className="p-10 space-y-8">
          <div className="grid grid-cols-2 gap-3">
             {[
               { id: 'client', label: 'Client', icon: User },
               { id: 'driver', label: 'Livreur', icon: Truck },
             ].map((r) => (
               <button
                 key={r.id}
                 onClick={() => setRole(r.id as any)}
                 className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                   role === r.id 
                   ? 'border-brand-blue bg-brand-blue/5 text-brand-blue' 
                   : 'border-gray-50 bg-gray-50 text-gray-400 hover:border-gray-200'
                 }`}
               >
                 <r.icon className="w-5 h-5" />
                 <span className="text-[10px] font-black uppercase tracking-widest">{r.label}</span>
               </button>
             ))}
          </div>


          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-brand-blue transition-colors" />
                  <Input 
                    type="email" 
                    placeholder="Email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-16 pl-12 bg-gray-50 border-none rounded-2xl font-bold focus:ring-2 ring-brand-blue/20"
                    required
                  />
                </div>

              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-brand-blue transition-colors" />
                <Input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Mot de passe" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-16 pl-12 pr-12 bg-gray-50 border-none rounded-2xl font-bold focus:ring-2 ring-brand-blue/20"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <div className="text-right">
                <button 
                  type="button" 
                  onClick={handleForgotPassword}
                  className="text-xs font-bold text-brand-orange hover:underline transition-colors"
                >
                  Mot de passe oublié ?
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl text-xs font-bold text-center border border-red-100">
                {error}
              </div>
            )}
            {message && (
              <div className="p-4 bg-green-50 text-green-600 rounded-xl text-xs font-bold text-center border border-green-100">
                {message}
              </div>
            )}

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-16 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-2xl font-black text-xl shadow-xl shadow-brand-blue/20 transition-all active:scale-95 flex gap-2"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Se Connecter"}
            </Button>
          </form>

          <div className="space-y-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
              <div className="relative flex justify-center text-[10px] uppercase font-black text-gray-400 tracking-widest"><span className="bg-white px-4">Ou continuer avec</span></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                onClick={() => handleSocialLogin('google')}
                className="h-14 rounded-2xl border-gray-100 font-bold flex gap-2 hover:bg-gray-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleSocialLogin('facebook')}
                className="h-14 rounded-2xl border-gray-100 font-bold flex gap-2 hover:bg-gray-50"
              >
                <svg className="w-5 h-5 fill-[#1877F2]" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </Button>
            </div>
          </div>

          <div className="text-center pt-4">
            <p className="text-sm font-medium text-gray-500">
              Pas encore de compte ?{' '}
              <Link href="/auth/register" className="text-brand-blue font-black hover:underline underline-offset-4">
                Inscrivez-vous ici
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

