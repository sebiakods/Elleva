"use client";
import { useState } from "react";
import { MessageSquare, Send, Search } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Avatar } from "@/components/common/Avatar";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { cn } from "@/lib/utils";

const THREADS = [
  { id:"1", name:"Amina Kaddour", preview:"Merci pour vos conseils sur le plan financier !", time:"10:24", unread:2 },
  { id:"2", name:"Yasmine Bensaid", preview:"Pouvez-vous m'aider avec mon étude de marché ?", time:"Hier", unread:0 },
  { id:"3", name:"Lina Tabet", preview:"J'ai mis à jour la section stratégie.", time:"Lun.", unread:1 },
];

const MESSAGES: Record<string, { from:"me"|"them", text:string, time:string }[]> = {
  "1": [
    { from:"them", text:"Bonjour Dr. Leila, j'ai une question sur mon plan financier.", time:"09:10" },
    { from:"me",   text:"Bonjour Amina ! Je vous lis. Dites-moi tout.", time:"09:15" },
    { from:"them", text:"Merci pour vos conseils sur le plan financier !", time:"10:24" },
  ],
  "2": [
    { from:"them", text:"Bonjour, pouvez-vous m'aider avec mon étude de marché ?", time:"Hier 14:00" },
  ],
  "3": [
    { from:"them", text:"J'ai mis à jour la section stratégie.", time:"Lun. 16:30" },
  ],
};

export default function ExpertMessagesPage() {
  const [active, setActive] = useState("1");
  const [draft, setDraft] = useState("");
  const thread = MESSAGES[active] ?? [];
  const contact = THREADS.find(t => t.id === active);

  return (
    <>
      <Header title="Messages" />
      <div className="card-surface shadow-card overflow-hidden" style={{ height:"calc(100vh - 200px)", minHeight:"520px" }}>
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-72 shrink-0 border-r border-sand-200 flex flex-col">
            <div className="p-4 border-b border-sand-100">
              <div className="flex items-center gap-2 rounded-xl border border-sand-200 bg-sand-50 px-3 py-2">
                <Search size={14} className="text-ink-soft" />
                <input placeholder="Rechercher…" className="bg-transparent text-sm outline-none w-full placeholder:text-ink-soft/60" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {THREADS.length === 0 ? (
                <EmptyState icon={MessageSquare} title="Aucun message" description="Vos conversations apparaîtront ici." />
              ) : THREADS.map(t => (
                <button key={t.id} onClick={() => setActive(t.id)}
                  className={cn("w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-sand-50",
                    active === t.id ? "bg-rose-50" : "hover:bg-sand-50"
                  )}>
                  <Avatar name={t.name} size="sm"/>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm text-ink truncate">{t.name}</p>
                      <span className="text-xs text-ink-soft shrink-0 ml-1">{t.time}</span>
                    </div>
                    <p className="text-xs text-ink-soft truncate">{t.preview}</p>
                  </div>
                  {t.unread > 0 && (
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rise-gradient text-[10px] font-bold text-white">
                      {t.unread}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Chat */}
          <div className="flex flex-1 flex-col">
            <div className="flex items-center gap-3 border-b border-sand-200 px-5 py-3">
              {contact && <><Avatar name={contact.name} size="sm"/>
              <p className="font-semibold text-ink">{contact.name}</p></>}
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 p-5">
              {thread.map((m, i) => (
                <div key={i} className={cn("flex", m.from === "me" ? "justify-end" : "justify-start")}>
                  <div className={cn("max-w-xs rounded-2xl px-4 py-2.5 text-sm",
                    m.from === "me"
                      ? "bg-rise-gradient text-white rounded-br-sm"
                      : "bg-sand-100 text-ink rounded-bl-sm"
                  )}>
                    <p>{m.text}</p>
                    <p className={cn("mt-1 text-[10px]", m.from === "me" ? "text-white/70" : "text-ink-soft")}>{m.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-sand-200 p-4 flex items-center gap-3">
              <input
                value={draft}
                onChange={e => setDraft(e.target.value)}
                placeholder="Votre message…"
                className="flex-1 rounded-xl border border-sand-200 bg-white px-4 py-2.5 text-sm outline-none focus-ring focus:border-rose-400"
              />
              <Button size="sm" onClick={() => setDraft("")}>
                <Send size={15}/> Envoyer
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}