"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Truck, Mail, Lock, User, Phone, Building, ArrowRight, Loader2, CheckCircle2, ShieldCheck } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { supabase } from "@/lib/supabase"

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [role, setRole] = useState<'particular' | 'pro' | 'driver'>('particular')
  const [loading, setLoading] = useState(false)

  // OTP email verification
  const [showOtpInput, setShowOtpInput] = useState(false)
  const [otpCode, setOtpCode] = useState("")
  const [resendLoading, setResendLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    company: ""
  })

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Step 1: submit form → signUp → email sent (OTP or link depending on Supabase config)
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            phone: formData.phone,
            role: role,
            company: formData.company
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      console.log('[Register] signUp response:', { data, authError })
      if (authError) throw authError

      // If email confirmation is disabled in Supabase, user is logged in immediately
      if (data?.session) {
        console.log('[Register] Auto-logged in (email confirmation disabled)')
        setSuccess(true)
        setTimeout(() => {
          if (role === 'driver') router.push('/driver')
          else router.push('/client')
        }, 1500)
        return
      }

      // Email confirmation enabled → show OTP input
      console.log('[Register] Confirmation email sent to:', formData.email)
      setShowOtpInput(true)
      startResendCooldown()
    } catch (err: any) {
      console.error('[Register] Error:', err)
      if (err.message?.includes('already registered')) {
        setError("Cet email est déjà utilisé. Connectez-vous ou utilisez un autre email.")
      } else {
        setError(err.message || "Erreur d'inscription")
      }
    } finally {
      setLoading(false)
    }
  }

  // Step 2: verify OTP code entered by user
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email: formData.email,
        token: otpCode,
        type: 'email'
      })
      if (verifyError) throw verifyError

      // OTP verified — now set the password so the user can log in with email+password
      if (data?.user && formData.password) {
        const { error: pwError } = await supabase.auth.updateUser({
          password: formData.password
        })
        if (pwError) console.warn('[Register] Password update error:', pwError.message)
      }

      // Account is now active
      setSuccess(true)
      setTimeout(() => {
        if (role === 'driver') router.push('/driver')
        else router.push('/client')
      }, 2000)
    } catch (err: any) {
      console.error('[Register] OTP verify error:', err)
      setError(err.message || "Code invalide ou expiré")
    } finally {
      setLoading(false)
    }
  }

  // Resend OTP — re-call signInWithOtp
  const handleResend = async () => {
    setResendLoading(true)
    setError(null)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: formData.email,
        options: { shouldCreateUser: true }
      })
      if (error) throw error
      startResendCooldown()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setResendLoading(false)
    }
  }

  const startResendCooldown = () => {
    setResendCooldown(60)
    const interval = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) { clearInterval(interval); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  const handleSocialRegister = async (provider: 'google' | 'facebook') => {
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

  // ─── Success screen ───────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md space-y-6"
        >
          <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-black text-slate-900">Compte activé !</h2>
          <p className="text-gray-500 font-medium">
            Votre email a été vérifié avec succès.<br />Redirection en cours...
          </p>
          <Loader2 className="w-6 h-6 animate-spin text-brand-blue mx-auto" />
        </motion.div>
      </div>
    )
  }

  // ─── OTP verification screen ──────────────────────────────────────────────
  if (showOtpInput) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-10">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <div className="bg-brand-orange p-1.5 rounded-lg">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black text-brand-blue italic tracking-tighter">J'ARRIVE</span>
            </Link>

            <div className="w-20 h-20 bg-blue-50 text-brand-blue rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-black text-slate-900">Vérification Email</h1>
            <p className="text-gray-500 font-medium mt-3 leading-relaxed">
              Nous avons envoyé un code à 6 chiffres à<br />
              <strong className="text-slate-900">{formData.email}</strong>
            </p>
          </div>

          <Card className="border border-gray-100 shadow-premium overflow-hidden bg-white rounded-[32px]">
            <CardContent className="p-8 space-y-6">
              {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold text-center border border-red-100">
                  {error}
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Code de vérification
                  </label>
                  <Input
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
                    placeholder="_ _ _ _ _ _ _ _"
                    maxLength={8}
                    className="h-20 text-3xl tracking-[0.5em] text-center bg-gray-50/50 border-none rounded-2xl font-black text-slate-900 placeholder:text-gray-200"
                    required
                    autoFocus
                  />
                  <p className="text-[10px] text-gray-400 text-center">
                    Code à 8 chiffres · Expire dans 60 minutes
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={loading || otpCode.length < 8}
                  className={`w-full h-14 rounded-2xl font-black text-lg shadow-xl border-none ${
                    role === 'driver' ? 'bg-brand-orange shadow-brand-orange/20' : 'bg-brand-blue shadow-brand-blue/20'
                  }`}
                >
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                    <span className="flex items-center justify-center gap-2">
                      Vérifier mon compte
                      <ArrowRight className="w-5 h-5" />
                    </span>
                  )}
                </Button>
              </form>

              <div className="text-center space-y-2 pt-2">
                <p className="text-xs text-gray-400 font-medium">Vous n'avez pas reçu le code ?</p>
                {resendCooldown > 0 ? (
                  <p className="text-xs font-black text-gray-400">
                    Renvoyer dans {resendCooldown}s
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendLoading}
                    className="text-xs font-black text-brand-blue hover:underline disabled:opacity-50 flex items-center gap-1 mx-auto"
                  >
                    {resendLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                    Renvoyer le code
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => { setShowOtpInput(false); setOtpCode(""); setError(null) }}
                  className="block text-[10px] font-black text-gray-300 hover:text-gray-500 uppercase tracking-widest mx-auto mt-3"
                >
                  ← Modifier mes informations
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  // ─── Registration form ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-12">
           <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <div className="bg-brand-orange p-1.5 rounded-lg">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black text-brand-blue italic tracking-tighter">J'ARRIVE</span>
           </Link>
           <h1 className="text-4xl font-black text-slate-900 tracking-tight">Créer votre compte</h1>
           <p className="text-gray-500 font-medium mt-2">Rejoignez la révolution logistique au Congo</p>
        </div>

        <div className="mb-12 flex justify-center gap-4">
           {[1, 2].map((s) => (
             <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step === s ? 'bg-brand-blue text-white shadow-lg' : 'bg-gray-100 text-gray-400'}`}>
                   {s}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest ${step === s ? 'text-brand-blue' : 'text-gray-400'}`}>
                   {s === 1 ? 'Choisir Profil' : 'Informations'}
                </span>
                {s === 1 && <div className="w-12 h-px bg-gray-100 mx-2" />}
             </div>
           ))}
        </div>

        <AnimatePresence mode="wait">
           {step === 1 ? (
             <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
             >
                {[
                   { id: 'particular', title: 'Particulier', desc: 'Pour vos besoins personnels', icon: User, color: 'brand-blue' },
                   { id: 'pro', title: 'Professionnel', desc: 'E-commerçants & Restos', icon: Building, color: 'brand-blue' },
                   { id: 'driver', title: 'Livreur', desc: 'Devenir partenaire', icon: Truck, color: 'brand-orange' },
                ].map((p) => (
                   <button
                    key={p.id}
                    onClick={() => {
                        setRole(p.id as any)
                        setStep(2)
                    }}
                    className={`p-8 rounded-[32px] border-2 text-left transition-all hover:scale-[1.03] group ${
                        role === p.id
                            ? `border-brand-${p.id === 'driver' ? 'orange' : 'blue'} bg-white shadow-xl`
                            : 'border-gray-50 bg-gray-50/30'
                    }`}
                   >
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${
                          p.id === 'driver' ? 'bg-orange-50 text-brand-orange' : 'bg-blue-50 text-brand-blue'
                      }`}>
                         <p.icon className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-black text-slate-900 mb-2">{p.title}</h3>
                      <p className="text-xs text-gray-400 font-medium leading-relaxed">{p.desc}</p>
                   </button>
                ))}
             </motion.div>
           ) : (
             <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 max-w-lg mx-auto"
             >
                <Card className="border border-gray-100 shadow-premium overflow-hidden bg-white">
                   <CardContent className="p-8 space-y-6">
                      {error && <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold text-center border border-red-100">{error}</div>}

                      <form onSubmit={handleRegister} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                               <div className="space-y-2">
                                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nom Complet</label>
                                  <div className="relative">
                                     <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                     <Input
                                      value={formData.name}
                                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                                      placeholder="Ex: Jean Bakoula"
                                      className="pl-12 h-14 bg-gray-50/50 border-none rounded-2xl font-bold"
                                      required
                                     />
                                  </div>
                               </div>
                               <div className="space-y-2">
                                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Téléphone</label>
                                  <div className="relative">
                                     <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                     <Input
                                      value={formData.phone}
                                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                      placeholder="06 000 00 00"
                                      className="pl-12 h-14 bg-gray-50/50 border-none rounded-2xl font-bold"
                                      required
                                     />
                                  </div>
                               </div>
                            </div>

                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email</label>
                              <div className="relative">
                                 <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                 <Input
                                     value={formData.email}
                                     onChange={(e) => setFormData({...formData, email: e.target.value})}
                                     type="email"
                                     placeholder="jean@exemple.com"
                                     className="pl-12 h-14 bg-gray-50/50 border-none rounded-2xl font-bold"
                                     required
                                 />
                              </div>
                            </div>

                            {role === 'pro' && (
                              <div className="space-y-2">
                                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nom de l'entreprise</label>
                                  <div className="relative">
                                     <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                     <Input
                                      value={formData.company}
                                      onChange={(e) => setFormData({...formData, company: e.target.value})}
                                      placeholder="Bakoula Électronique"
                                      className="pl-12 h-14 bg-gray-50/50 border-none rounded-2xl font-bold"
                                      required
                                     />
                                  </div>
                              </div>
                            )}

                            <div className="space-y-2">
                               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mot de passe</label>
                               <div className="relative">
                                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                  <Input
                                      value={formData.password}
                                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                                      type="password"
                                      placeholder="••••••••"
                                      minLength={6}
                                      className="pl-12 h-14 bg-gray-50/50 border-none rounded-2xl font-bold"
                                      required
                                  />
                               </div>
                               <p className="text-[9px] text-gray-400 ml-1">Minimum 6 caractères — servira pour vos prochaines connexions.</p>
                            </div>

                        <div className="pt-4 space-y-4">
                           <Button
                            type="submit"
                            disabled={loading}
                            className={`w-full h-14 rounded-2xl font-black text-lg shadow-xl border-none ${
                                role === 'driver' ? 'bg-brand-orange shadow-brand-orange/20' : 'bg-brand-blue shadow-brand-blue/20'
                            }`}
                           >
                              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                                  <span className="flex items-center justify-center gap-2">
                                     S'inscrire <ArrowRight className="w-5 h-5" />
                                  </span>
                              )}
                           </Button>
                           <button type="button" onClick={() => setStep(1)} className="w-full text-center text-xs font-bold text-gray-400 hover:text-slate-900 transition-colors uppercase tracking-widest">Retour</button>
                        </div>
                      </form>

                      <div className="space-y-6 pt-6 border-t border-gray-50">
                         <div className="relative">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                            <div className="relative flex justify-center text-[10px] uppercase font-black text-gray-400 tracking-widest"><span className="bg-white px-4">Ou via les réseaux</span></div>
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                            <Button variant="outline" onClick={() => handleSocialRegister('google')} className="h-12 border-gray-100 rounded-2xl font-bold flex gap-2 hover:bg-gray-50">
                               <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                               Google
                            </Button>
                            <Button variant="outline" onClick={() => handleSocialRegister('facebook')} className="h-12 border-gray-100 rounded-2xl font-bold flex gap-2 hover:bg-gray-50">
                               <svg className="w-4 h-4 fill-[#1877F2]" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                               Facebook
                            </Button>
                         </div>
                      </div>

                   </CardContent>
                </Card>
              </motion.div>
           )}
        </AnimatePresence>

        <div className="text-center mt-12">
            <p className="text-sm text-gray-500 font-medium">
                Vous avez déjà un compte ? {" "}
                <Link href="/auth/login" className="text-brand-blue font-bold hover:underline">Se connecter</Link>
            </p>
        </div>
      </div>
    </div>
  )
}