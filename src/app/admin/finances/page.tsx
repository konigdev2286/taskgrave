"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DollarSign, PieChart, Wallet, CreditCard, RefreshCw, Loader2, ArrowUpRight, ArrowDownLeft, TrendingUp, Package } from "lucide-react"
import { motion } from "framer-motion"
import { useAdminFinances } from "@/hooks/use-supabase"

const STATUS_TRANSLATE: Record<string, string> = {
  pending:    'En attente',
  accepted:   'Accepté',
  picked_up:  'En transit',
  delivered:  'Livré',
  cancelled:  'Annulé',
}

const STATUS_COLORS: Record<string, string> = {
  pending:   'text-brand-orange bg-orange-50',
  accepted:  'text-brand-blue bg-blue-50',
  picked_up: 'text-purple-600 bg-purple-50',
  delivered: 'text-green-600 bg-green-50',
  cancelled: 'text-red-500 bg-red-50',
}

const PAYMENT_COLORS: Record<string, string> = {
  paid:     'text-green-600',
  unpaid:   'text-red-500',
  refunded: 'text-gray-400',
}

export default function AdminFinances() {
  const { finances, transactions, loading, refresh } = useAdminFinances()

  const kpis = [
    { label: "Volume d'affaires", value: finances.totalVolume, sub: `${transactions.length} missions`, icon: DollarSign, color: "text-blue-600", bg: "bg-blue-50", unit: "FCFA" },
    { label: "Marge J'ARRIVE (15%)", value: finances.margin, sub: "Commission plateforme", icon: PieChart, color: "text-brand-orange", bg: "bg-orange-50", unit: "FCFA" },
    { label: "Paies Livreurs (85%)", value: finances.driverPayouts, sub: "À reverser aux partenaires", icon: Wallet, color: "text-green-600", bg: "bg-green-50", unit: "FCFA" },
    { label: "Frais Système (3%)", value: finances.systemCosts, sub: "Infra & services", icon: CreditCard, color: "text-slate-600", bg: "bg-slate-100", unit: "FCFA" },
  ]

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gestion Financière</h1>
          <p className="text-gray-500 font-medium">Revenus, commissions et paiements livreurs • Temps réel</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-gray-200 font-bold flex gap-2 rounded-2xl" onClick={refresh}>
            <RefreshCw className="w-4 h-4" /> Actualiser
          </Button>
          <Button className="bg-brand-blue font-bold px-8 shadow-lg shadow-brand-blue/20 rounded-2xl">
            Exporter rapport
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      {loading ? (
        <div className="flex items-center justify-center p-20">
          <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {kpis.map((kpi, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <Card className="border-none shadow-sm bg-white p-6 rounded-[24px]">
                  <div className={`${kpi.bg} w-10 h-10 rounded-xl flex items-center justify-center mb-4`}>
                    <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                  </div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{kpi.label}</p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <p className="text-xl font-black text-slate-900">{kpi.value.toLocaleString()}</p>
                    <span className="text-[8px] font-bold text-gray-400">{kpi.unit}</span>
                  </div>
                  <p className="text-[10px] font-bold text-gray-400 mt-1">{kpi.sub}</p>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Paiements reçus</p>
                <p className="text-2xl font-black text-green-600">{finances.paidCount} missions</p>
              </div>
            </Card>
            <Card className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
                <ArrowDownLeft className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Impayés livrés</p>
                <p className="text-2xl font-black text-red-500">{finances.pendingPaymentCount} missions</p>
              </div>
            </Card>
            <Card className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-blue/10 rounded-xl flex items-center justify-center shrink-0">
                <TrendingUp className="w-6 h-6 text-brand-blue" />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Marge nette</p>
                <p className="text-2xl font-black text-brand-blue">{finances.margin.toLocaleString()} FCFA</p>
              </div>
            </Card>
          </div>

          {/* Transactions Table */}
          <Card className="border border-white shadow-premium bg-white overflow-hidden rounded-[24px]">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center">
              <div>
                <h3 className="font-black text-slate-900">Historique des Transactions</h3>
                <p className="text-xs text-gray-400 font-bold mt-0.5">{transactions.length} dernières missions • Synchronisé en temps réel</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Live</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase pl-8">Référence</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase">Client</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase">Livreur</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase">Type</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase">Montant</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase">Paiement</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase">Mission</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-12 text-center text-gray-400 font-medium">
                        Aucune transaction enregistrée
                      </td>
                    </tr>
                  ) : transactions.map((t, i) => (
                    <tr key={t.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 pl-8 text-xs font-bold text-slate-400">#{t.id.slice(0, 8).toUpperCase()}</td>
                      <td className="p-4 text-sm font-black text-slate-900">{t.client?.full_name || '—'}</td>
                      <td className="p-4 text-sm font-bold text-slate-600">{t.driver?.full_name || 'Non assigné'}</td>
                      <td className="p-4">
                        <span className="text-[10px] font-black px-2 py-1 rounded-md bg-gray-50 text-slate-600 uppercase">
                          {t.type}
                        </span>
                      </td>
                      <td className="p-4 font-black text-slate-900 text-sm">{(t.price_fcfa || 0).toLocaleString()} FCFA</td>
                      <td className="p-4">
                        <span className={`text-[10px] font-black ${PAYMENT_COLORS[t.payment_status] || 'text-gray-400'}`}>
                          {t.payment_method === 'cash' ? 'Espèces' : t.payment_method}
                          {' · '}
                          {t.payment_status === 'paid' ? 'Payé' : t.payment_status === 'unpaid' ? 'Impayé' : 'Remboursé'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`text-[10px] font-black px-2 py-1 rounded-md ${STATUS_COLORS[t.status] || 'text-gray-400 bg-gray-50'}`}>
                          {STATUS_TRANSLATE[t.status] || t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
