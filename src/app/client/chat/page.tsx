"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Send, User, CheckCheck, Truck, ShieldCheck } from "lucide-react"
import { useState } from "react"

export default function ChatPage() {
  const [activeChat, setActiveChat] = useState(0)

  const chats = [
    { id: 0, name: "Mamadou K.", role: "Livreur", status: "En ligne", lastMsg: "Je suis devant l'entrée du restaurant.", time: "14:15", unread: 0, avatar: "MK" },
    { id: 1, name: "Support Client", role: "J'ARRIVE", status: "En ligne", lastMsg: "Votre demande de remboursement est validée.", time: "Hier", unread: 1, avatar: "SC" },
    { id: 2, name: "Christian T.", role: "Livreur", status: "Hors ligne", lastMsg: "Merci pour le pourboire !", time: "Mar", unread: 0, avatar: "CT" },
  ]

  return (
    <div className="h-[calc(100vh-140px)] flex gap-8">
      {/* Sidebar - Chat List */}
      <Card className="w-96 border border-gray-100 shadow-sm bg-white flex flex-col overflow-hidden">
        <div className="p-6 border-b border-gray-50">
           <h2 className="text-xl font-bold text-slate-900 mb-4">Messages</h2>
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input className="pl-10 h-10 bg-gray-50/50 border-none" placeholder="Rechercher une discussion..." />
           </div>
        </div>
        <div className="flex-1 overflow-y-auto">
           {chats.map((chat) => (
             <button 
              key={chat.id}
              onClick={() => setActiveChat(chat.id)}
              className={`w-full p-6 flex items-center gap-4 border-b border-gray-50 hover:bg-gray-50 transition-all text-left ${activeChat === chat.id ? 'bg-blue-50/50 border-r-4 border-r-brand-blue' : ''}`}
             >
                <div className="relative">
                   <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-white shadow-lg ${chat.role === 'J\'ARRIVE' ? 'bg-slate-900' : 'bg-brand-orange'}`}>
                      {chat.avatar}
                   </div>
                   {chat.status === 'En ligne' && <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />}
                </div>
                <div className="flex-1 min-w-0">
                   <div className="flex justify-between items-start mb-1">
                      <p className="font-bold text-slate-900 truncate">{chat.name}</p>
                      <span className="text-[10px] text-gray-400 font-bold">{chat.time}</span>
                   </div>
                   <p className="text-xs text-brand-blue font-bold mb-1">{chat.role}</p>
                   <p className="text-xs text-gray-400 truncate font-medium">{chat.lastMsg}</p>
                </div>
                {chat.unread > 0 && (
                   <div className="w-5 h-5 bg-brand-blue text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                      {chat.unread}
                   </div>
                )}
             </button>
           ))}
        </div>
      </Card>

      {/* Main Chat Area */}
      <Card className="flex-1 border border-gray-100 shadow-premium bg-white flex flex-col overflow-hidden">
         {/* Top Header */}
         <div className="p-5 border-b border-gray-50 flex justify-between items-center bg-gray-50/10">
            <div className="flex items-center gap-4">
               <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white shadow-md ${chats[activeChat].role === 'J\'ARRIVE' ? 'bg-slate-900' : 'bg-brand-orange'}`}>
                  {chats[activeChat].avatar}
               </div>
               <div>
                  <div className="flex items-center gap-2">
                     <p className="font-bold text-slate-900">{chats[activeChat].name}</p>
                     {chats[activeChat].role === 'J\'ARRIVE' && <ShieldCheck className="w-4 h-4 text-brand-blue" />}
                  </div>
                  <p className="text-[10px] text-green-500 font-black uppercase tracking-widest">{chats[activeChat].status}</p>
               </div>
            </div>
            <Button variant="ghost" className="text-brand-blue font-bold">Signaler</Button>
         </div>

         {/* Messages area */}
         <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-gray-50/30">
            <div className="flex justify-center">
               <span className="bg-white px-4 py-1.5 rounded-full text-[10px] font-bold text-gray-400 shadow-sm border border-gray-100 uppercase tracking-widest">Aujourd'hui</span>
            </div>

            <div className="flex justify-start">
               <div className="max-w-[70%] bg-white p-4 rounded-3xl rounded-tl-none shadow-sm border border-gray-100">
                  <p className="text-sm text-slate-700 leading-relaxed font-medium">Bonjour Jean ! J'ai bien récupéré votre colis. Je suis en route, j'arrive dans environ 10 minutes.</p>
                  <p className="text-[10px] text-gray-400 font-bold mt-2 text-right">14:05</p>
               </div>
            </div>

            <div className="flex justify-end">
               <div className="max-w-[70%] bg-brand-blue p-4 rounded-3xl rounded-tr-none shadow-xl shadow-brand-blue/20">
                  <p className="text-sm text-white leading-relaxed font-medium">Parfait, merci ! Je vous attends devant le portail vert.</p>
                  <div className="flex justify-end items-center gap-1 mt-2">
                     <p className="text-[10px] text-white/70 font-bold">14:08</p>
                     <CheckCheck className="w-3 h-3 text-white/70" />
                  </div>
               </div>
            </div>

            <div className="flex justify-start">
               <div className="max-w-[70%] bg-white p-4 rounded-3xl rounded-tl-none shadow-sm border border-gray-100">
                  <p className="text-sm text-slate-700 leading-relaxed font-medium">Je suis devant l'entrée du restaurant.</p>
                  <p className="text-[10px] text-gray-400 font-bold mt-2 text-right">14:15</p>
               </div>
            </div>
         </div>

         {/* Input Box */}
         <div className="p-6 border-t border-gray-50 bg-white shadow-2xl">
            <div className="flex gap-4">
               <Input className="flex-1 h-14 bg-gray-50 border-none rounded-2xl px-6 text-slate-900 font-medium" placeholder="Écrivez votre message ici..." />
               <Button className="h-14 w-14 rounded-2xl bg-brand-blue shadow-lg shadow-brand-blue/20 flex items-center justify-center group">
                  <Send className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
               </Button>
            </div>
         </div>
      </Card>
    </div>
  )
}
