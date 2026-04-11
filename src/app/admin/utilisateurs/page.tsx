"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Users, Search, Filter, MoreVertical, ShieldCheck, Mail, Phone, Download, Plus } from "lucide-react"
import { useState } from "react"

export default function AdminUsers() {
  const users = [
    { id: "U-100", name: "Jean Bakoula", email: "jean@bakoula.cg", phone: "06 445 12 34", role: "Particulier", status: "Actif", joined: "12 Mars 2026" },
    { id: "U-101", name: "Restaurant Le Phénix", email: "contact@phenix.cg", phone: "05 550 88 99", role: "Pro", status: "Actif", joined: "10 Mars 2026" },
    { id: "U-102", name: "Alice Mabiala", email: "alice@m.cg", phone: "06 999 00 11", role: "Particulier", status: "Suspendu", joined: "05 Mars 2026" },
  ]

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Gestion des Utilisateurs</h1>
          <p className="text-gray-500 font-medium">Clients particuliers et professionnels</p>
        </div>
        <div className="flex gap-3">
           <Button variant="outline" className="border-gray-200 font-bold flex gap-2">
              <Download className="w-4 h-4" /> Exporter
           </Button>
           <Button className="bg-brand-blue font-bold px-8 shadow-lg shadow-brand-blue/20 flex gap-2">
              <Plus className="w-4 h-4" /> Nouvel Utilisateur
           </Button>
        </div>
      </div>

      <Card className="border border-white shadow-premium bg-white">
        <CardHeader className="p-6 border-b border-gray-50 flex flex-row items-center justify-between">
           <div className="flex gap-4">
              <div className="relative w-80">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                 <Input className="pl-10 bg-gray-50 border-none rounded-xl" placeholder="Rechercher par nom, email..." />
              </div>
              <Button variant="outline" className="border-gray-200 flex gap-2">
                 <Filter className="w-4 h-4" /> Filtrer
              </Button>
           </div>
           <div className="flex items-center gap-6">
              <div className="text-right">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Clients</p>
                 <p className="text-xl font-black text-slate-900">2,540</p>
              </div>
           </div>
        </CardHeader>
        <CardContent className="p-0">
           <table className="w-full">
              <thead>
                 <tr className="bg-gray-50 text-left border-b border-gray-100">
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest pl-8">Utilisateur</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Statut</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date d'inscription</th>
                    <th className="p-4"></th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                 {users.map((user) => (
                   <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 pl-8">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-50 text-brand-blue flex items-center justify-center font-bold">
                               {user.name.charAt(0)}
                            </div>
                            <div>
                               <p className="text-sm font-bold text-slate-900">{user.name}</p>
                               <p className="text-[10px] font-medium text-gray-400">{user.id}</p>
                            </div>
                         </div>
                      </td>
                      <td className="p-4">
                         <span className={`text-[10px] font-black px-2 py-1 rounded-md ${user.role === 'Pro' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                            {user.role}
                         </span>
                      </td>
                      <td className="p-4">
                         <div className="space-y-1">
                            <p className="text-xs font-medium text-slate-600 flex items-center gap-2"><Mail className="w-3 h-3" /> {user.email}</p>
                            <p className="text-xs font-medium text-slate-600 flex items-center gap-2"><Phone className="w-3 h-3" /> {user.phone}</p>
                         </div>
                      </td>
                      <td className="p-4">
                         <span className={`text-[10px] font-black px-2 py-1 rounded-md ${user.status === 'Actif' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                            {user.status}
                         </span>
                      </td>
                      <td className="p-4 text-xs font-bold text-gray-400">
                         {user.joined}
                      </td>
                      <td className="p-4 text-right">
                         <Button variant="ghost" size="icon" className="text-gray-300">
                            <MoreVertical className="w-5 h-5" />
                         </Button>
                      </td>
                   </tr>
                 ))}
              </tbody>
           </table>
        </CardContent>
      </Card>
    </div>
  )
}
