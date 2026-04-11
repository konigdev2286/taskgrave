"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Truck, DollarSign, TrendingUp, AlertTriangle, MapPin, ChevronRight, BarChart3, Clock, Package, Loader2, ShieldCheck } from "lucide-react"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeDrivers: 0,
    revenue: 0,
    activeMissions: 0
  })
  const [recentMissions, setRecentMissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAdminData()
    
    // Subscribe to both missions and profiles for real-time updates
    const missionsChannel = supabase
      .channel('admin:missions-watch')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'missions' }, () => {
        fetchAdminData()
      })
      .subscribe()

    const profilesChannel = supabase
      .channel('admin:profiles-watch')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchAdminData()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(missionsChannel)
      supabase.removeChannel(profilesChannel)
    }
  }, [])

  const fetchAdminData = async () => {
    try {
      // 1. Total Users
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      // 2. Active Drivers (using role='driver')
      const { count: driverCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'driver')

      // 3. Revenue (Paid Missions)
      const { data: revenueData } = await supabase
        .from('missions')
        .select('price_fcfa')
        .eq('payment_status', 'paid')

      const totalRevenue = revenueData?.reduce((acc, curr) => acc + (curr.price_fcfa || 0), 0) || 0

      // 4. Active Missions (not delivered)
      const { count: missionCount } = await supabase
        .from('missions')
        .select('*', { count: 'exact', head: true })
        .in('status', ['pending', 'accepted', 'picked_up'])

      // 5. Recent Missions List
      const { data: missions } = await supabase
        .from('missions')
        .select(`
          *,
          client:client_id (full_name),
          driver:driver_id (full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(10)

      setStats({
        totalUsers: userCount || 0,
        activeDrivers: driverCount || 0,
        revenue: totalRevenue,
        activeMissions: missionCount || 0
      })
      setRecentMissions(missions || [])
    } catch (error) {
      console.error("Error fetching admin data:", error)
    } finally {
      setLoading(false)
    }
  }

  const kpis = [
    { label: "Utilisateurs Totaux", value: stats.totalUsers.toLocaleString(), icon: Users, color: "text-blue-600", bg: "bg-blue-50", trend: "0%" },
    { label: "Livreurs Actifs", value: stats.activeDrivers.toLocaleString(), icon: Truck, color: "text-orange-600", bg: "bg-orange-50", trend: "0%" },
    { label: "Revenu Total", value: stats.revenue.toLocaleString(), icon: DollarSign, color: "text-green-600", bg: "bg-green-50", trend: "0%", unit: "FCFA" },
    { label: "Missions en cours", value: stats.activeMissions.toLocaleString(), icon: Package, color: "text-purple-600", bg: "bg-purple-50", trend: "Direct" },
  ]

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
         <Loader2 className="w-10 h-10 text-brand-blue animate-spin" />
         <p className="mt-4 text-gray-400 font-bold tracking-tight">Synchronisation des données...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Tableau de Bord Global</h1>
          <p className="text-gray-500 font-medium">Supervision de J'ARRIVE Logistique Congo</p>
        </div>
        <div className="flex gap-3">
           <Button variant="outline" className="border-gray-200 font-bold flex gap-2 rounded-2xl">
              <BarChart3 className="w-4 h-4" /> Rapport
           </Button>
           <Button 
            onClick={() => { setLoading(true); fetchAdminData(); }}
            className="bg-brand-blue font-bold px-8 shadow-xl shadow-brand-blue/20 rounded-2xl"
           >
             Actualiser
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-none shadow-premium bg-white rounded-[32px]">
              <CardContent className="p-6">
                 <div className="flex justify-between items-start mb-4">
                    <div className={`${kpi.bg} p-4 rounded-2xl`}>
                       <kpi.icon className={`w-7 h-7 ${kpi.color}`} />
                    </div>
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full ${kpi.trend.startsWith('+') ? 'bg-green-50 text-green-600' : 'bg-brand-blue/5 text-brand-blue'}`}>
                       {kpi.trend}
                    </span>
                 </div>
                 <p className="text-xs text-gray-400 font-black uppercase tracking-widest leading-none mb-2">{kpi.label}</p>
                 <div className="flex items-baseline gap-1">
                    <p className="text-3xl font-black text-slate-900">{kpi.value}</p>
                    {kpi.unit && <span className="text-xs font-bold text-gray-400">{kpi.unit}</span>}
                 </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           <Card className="border-none shadow-premium bg-white overflow-hidden rounded-[32px]">
              <CardHeader className="bg-gray-50/20 border-b border-gray-100 flex flex-row items-center justify-between p-8">
                 <div>
                    <CardTitle className="text-xl font-black text-slate-900 leading-tight">Supervision des Livraisons</CardTitle>
                    <CardDescription className="text-gray-400 font-medium tracking-tight">Missions actives en temps réel</CardDescription>
                 </div>
                 <Button variant="ghost" className="text-brand-blue font-black text-[10px] uppercase tracking-widest">Voir la carte live</Button>
              </CardHeader>
              <CardContent className="p-0">
                 <div className="divide-y divide-gray-50">
                    {recentMissions.length > 0 ? recentMissions.map((mission, i) => (
                      <div key={mission.id} className="p-8 flex items-center justify-between hover:bg-gray-50/20 transition-all group">
                         <div className="flex items-center gap-6">
                            <div className={`w-3 h-3 rounded-full ${mission.status === 'pending' ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                            <div>
                               <p className="text-base font-black text-slate-900 leading-none mb-1">#{mission.id.slice(0, 8)} • {mission.type}</p>
                               <p className="text-xs text-gray-400 font-bold tracking-tight">
                                {mission.client?.full_name || 'Client Inconnu'} ➔ {mission.driver?.full_name || '---'}
                               </p>
                            </div>
                         </div>
                         <div className="flex items-center gap-10">
                            <div className="text-right">
                               <p className={`text-[10px] font-black uppercase tracking-widest ${mission.status === 'pending' ? 'text-red-500' : 'text-brand-blue'}`}>
                                 {mission.status === 'pending' ? 'En attente' :
                                  mission.status === 'accepted' ? 'Confirmé' :
                                  mission.status === 'picked_up' ? 'En transit' : 'Livré'}
                               </p>
                               <p className="text-xs text-gray-500 font-bold">{new Date(mission.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                            <Button variant="ghost" size="icon" className="text-gray-200 group-hover:text-brand-blue group-hover:translate-x-1 transition-all">
                               <ChevronRight className="w-6 h-6" />
                            </Button>
                         </div>
                      </div>
                    )) : (
                      <div className="p-12 text-center text-gray-400 font-medium">Aucune mission enregistrée</div>
                    )}
                 </div>
              </CardContent>
           </Card>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="border-none shadow-premium bg-white p-8 rounded-[32px]">
                 <h3 className="font-black text-slate-900 mb-6 flex items-center gap-3">
                    <ShieldCheck className="w-6 h-6 text-brand-blue shadow-lg shadow-brand-blue/10" /> Documents à valider
                 </h3>
                 <div className="space-y-4">
                    {[
                      { name: "Sylvain M.", doc: "Permis A (Motos)", date: "Aujourd'hui" },
                      { name: "Brice K.", doc: "Assurance Véhicule", date: "Hier" },
                    ].map((v, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100/50">
                         <div>
                            <p className="text-sm font-black text-slate-900 leading-none mb-1">{v.name}</p>
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{v.doc}</p>
                         </div>
                         <Button size="sm" className="bg-brand-blue h-9 px-4 text-[10px] font-black rounded-xl uppercase tracking-widest shadow-lg shadow-brand-blue/10">VÉRIFIER</Button>
                      </div>
                    ))}
                 </div>
              </Card>

              <Card className="border-none shadow-premium bg-white p-8 rounded-[32px]">
                 <h3 className="font-black text-slate-900 mb-6 flex items-center gap-3">
                    <TrendingUp className="w-6 h-6 text-brand-orange" /> Alertes Système
                 </h3>
                 <div className="space-y-4">
                    <div className="p-5 bg-brand-orange/5 border border-brand-orange/10 rounded-[24px]">
                       <p className="text-xs font-black text-brand-orange mb-2 uppercase tracking-widest">Pointe de midi</p>
                       <p className="text-xs text-slate-600 font-medium leading-relaxed">Augmentation de 15% des commandes de repas. Zone Poto-Poto en tension.</p>
                       <Button size="sm" className="mt-4 w-full bg-brand-orange text-white h-9 text-[10px] font-black rounded-xl uppercase tracking-widest shadow-xl shadow-brand-orange/20">ACTIVER MAJORATION</Button>
                    </div>
                 </div>
              </Card>
           </div>
        </div>

        <div className="space-y-8">
           <Card className="border-none bg-slate-900 text-white p-8 rounded-[40px] shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                 <h3 className="text-lg font-black mb-8 tracking-tight">Santé de la Flotte</h3>
                 <div className="space-y-8">
                    <div>
                       <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-3">
                          <span className="opacity-50">Utilisation</span>
                          <span>0%</span>
                       </div>
                       <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: "0%" }} className="h-full bg-brand-orange" />
                       </div>
                    </div>
                    <div>
                       <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-3">
                          <span className="opacity-50">SLA Livraisons</span>
                          <span>100%</span>
                       </div>
                       <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} className="h-full bg-green-500" />
                       </div>
                    </div>
                    <div>
                       <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-3">
                          <span className="opacity-50">Support</span>
                          <span>0%</span>
                       </div>
                       <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: "0%" }} className="h-full bg-red-500" />
                       </div>
                    </div>
                 </div>

                 <div className="mt-12 p-8 bg-white/5 rounded-[32px] border border-white/10 text-center backdrop-blur-sm">
                    <p className="text-[10px] font-black opacity-30 uppercase tracking-widest mb-2">Marge Nette Prévue</p>
                    <p className="text-4xl font-black">{Math.floor(stats.revenue * 0.15).toLocaleString()} <span className="text-xs opacity-40">FCFA</span></p>
                 </div>
              </div>
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-brand-blue opacity-20 rounded-full blur-3xl animate-pulse" />
           </Card>

           <Card className="border-none shadow-premium bg-white p-8 rounded-[32px]">
              <h3 className="font-black text-slate-900 mb-6">Événements Récents</h3>
              <div className="space-y-6">
                 {[
                   { icon: ShieldCheck, msg: "Nouveau livreur certifié", time: "10:30", color: "text-green-500" },
                   { icon: AlertTriangle, msg: "Litige signalé #8255", time: "09:45", color: "text-red-500" },
                   { icon: DollarSign, msg: "Paiements MoMo validés", time: "Lundi", color: "text-brand-blue" },
                 ].map((event, i) => (
                   <div key={i} className="flex gap-5 items-start">
                      <div className={`p-3 rounded-2xl bg-gray-50/50 ${event.color} border border-gray-100/50`}>
                         <event.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                         <p className="text-xs font-black text-slate-900 leading-snug truncate">{event.msg}</p>
                         <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">{event.time}</p>
                      </div>
                   </div>
                 ))}
              </div>
              <Button variant="ghost" className="w-full mt-8 text-brand-blue font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-gray-50 border border-gray-100">Voir tous les logs</Button>
           </Card>
        </div>
      </div>
    </div>
  )
}
