"use client";

import { useMemo, useState, FormEvent } from "react";
import {
  MessageSquare,
  Search,
  Send,
  Paperclip,
  Plus,
  X,
} from "lucide-react";

import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

type Message = {
  id: string;
  sender: "institution" | "entrepreneur";
  text: string;
  time: string;
};

type Conversation = {
  id: string;
  name: string;
  initials: string;
  program: string;
  unread: number;
  messages: Message[];
};

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: "1",
    name: "Amina Meziane",
    initials: "AM",
    program: "Programme Innovation Femmes 2026",
    unread: 2,
    messages: [
      {
        id: "m1",
        sender: "entrepreneur",
        text: "Bonjour, j'ai bien déposé mon dossier. Manque-t-il des documents ?",
        time: "09:12",
      },
      {
        id: "m2",
        sender: "institution",
        text: "Bonjour Amina, il manque votre relevé bancaire des 3 derniers mois.",
        time: "09:40",
      },
      {
        id: "m3",
        sender: "entrepreneur",
        text: "D'accord, je l'envoie aujourd'hui. Merci !",
        time: "09:52",
      },
    ],
  },
  {
    id: "2",
    name: "Sarah Boudiaf",
    initials: "SB",
    program: "Micro-crédit Numérique",
    unread: 0,
    messages: [
      {
        id: "m1",
        sender: "institution",
        text: "Félicitations, votre dossier a été approuvé !",
        time: "Hier",
      },
      {
        id: "m2",
        sender: "entrepreneur",
        text: "Merci beaucoup pour votre confiance !",
        time: "Hier",
      },
    ],
  },
  {
    id: "3",
    name: "Nour El Houda Kaci",
    initials: "NK",
    program: "Subvention Agri-Femmes",
    unread: 1,
    messages: [
      {
        id: "m1",
        sender: "entrepreneur",
        text: "Bonjour, quand aurai-je une réponse concernant ma candidature ?",
        time: "Lun.",
      },
    ],
  },
  {
    id: "4",
    name: "Yasmine Belkacem",
    initials: "YB",
    program: "Prêt PME 2026",
    unread: 0,
    messages: [
      {
        id: "m1",
        sender: "institution",
        text: "Merci pour votre candidature, nous reviendrons vers vous sous 10 jours.",
        time: "3 juil.",
      },
    ],
  },
];

export default function InstitutionMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>(
    INITIAL_CONVERSATIONS
  );
  const [selectedId, setSelectedId] = useState<string>(
    INITIAL_CONVERSATIONS[0].id
  );
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [composing, setComposing] = useState(false);
  const [composeRecipient, setComposeRecipient] = useState("");
  const [composeText, setComposeText] = useState("");

  const filteredConversations = useMemo(() => {
    return conversations.filter(
      (c) =>
        query.trim() === "" ||
        c.name.toLowerCase().includes(query.trim().toLowerCase()) ||
        c.program.toLowerCase().includes(query.trim().toLowerCase())
    );
  }, [conversations, query]);

  const selected = conversations.find((c) => c.id === selectedId) ?? null;

  function selectConversation(id: string) {
    setSelectedId(id);
    setComposing(false);
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c))
    );
  }

  function sendMessage(e: FormEvent) {
    e.preventDefault();
    if (!selected || draft.trim() === "") return;

    const newMessage: Message = {
      id: `m-${Date.now()}`,
      sender: "institution",
      text: draft.trim(),
      time: "À l'instant",
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === selected.id
          ? { ...c, messages: [...c.messages, newMessage] }
          : c
      )
    );
    setDraft("");
  }

  function sendNewConversation(e: FormEvent) {
    e.preventDefault();
    if (composeRecipient === "" || composeText.trim() === "") return;

    const recipient = conversations.find((c) => c.id === composeRecipient);
    if (!recipient) return;

    const newMessage: Message = {
      id: `m-${Date.now()}`,
      sender: "institution",
      text: composeText.trim(),
      time: "À l'instant",
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === recipient.id
          ? { ...c, messages: [...c.messages, newMessage] }
          : c
      )
    );

    setSelectedId(recipient.id);
    setComposing(false);
    setComposeRecipient("");
    setComposeText("");
  }

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread, 0);

  return (
    <>
      <Header title="Messages" />

      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <Badge tone="rose">Communications</Badge>
              {totalUnread > 0 && (
                <Badge tone="gold">{totalUnread} non lus</Badge>
              )}
            </div>

            <h1 className="font-display text-4xl text-ink">Messages</h1>

            <p className="mt-3 max-w-3xl text-ink-soft">
              Communiquez directement avec les entrepreneures candidates.
              Demandez des documents complémentaires ou apportez des
              précisions sur vos programmes.
            </p>
          </div>

          <Button
            onClick={() => {
              setComposing(true);
              setSelectedId("");
            }}
          >
            <Plus size={18} />
            Nouveau message
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          {/* Conversation list */}
          <Card hover={false} className="flex flex-col p-0">
            <div className="border-b border-sand-200 p-4">
              <div className="relative">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft"
                />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Rechercher..."
                  className="w-full rounded-xl border border-sand-200 bg-white py-2 pl-9 pr-3 text-sm text-ink outline-none transition focus:border-rose-400"
                />
              </div>
            </div>

            <div className="max-h-[560px] overflow-y-auto">
              {filteredConversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => selectConversation(c.id)}
                  className={`flex w-full items-start gap-3 border-b border-sand-100 p-4 text-left transition hover:bg-sand-50 ${
                    selectedId === c.id ? "bg-rose-50" : ""
                  }`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-100 font-display text-sm text-rose-700">
                    {c.initials}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate font-semibold text-ink">
                        {c.name}
                      </p>
                      {c.unread > 0 && (
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-500 text-xs font-semibold text-white">
                          {c.unread}
                        </span>
                      )}
                    </div>
                    <p className="truncate text-xs text-ink-soft">
                      {c.program}
                    </p>
                    <p className="mt-1 truncate text-sm text-ink-soft">
                      {c.messages[c.messages.length - 1]?.text}
                    </p>
                  </div>
                </button>
              ))}

              {filteredConversations.length === 0 && (
                <p className="p-4 text-sm text-ink-soft">
                  Aucune conversation trouvée.
                </p>
              )}
            </div>
          </Card>

          {/* Thread / compose */}
          <Card hover={false} className="flex flex-col p-0">
            {composing ? (
              <>
                <div className="flex items-center justify-between border-b border-sand-200 p-4">
                  <h2 className="font-display text-lg text-ink">
                    Nouveau message
                  </h2>
                  <button
                    onClick={() => setComposing(false)}
                    className="rounded-lg p-1.5 text-ink-soft transition hover:bg-sand-100"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form
                  onSubmit={sendNewConversation}
                  className="flex flex-1 flex-col gap-4 p-4"
                >
                  <Select
                    label="Destinataire"
                    value={composeRecipient}
                    onChange={(e) => setComposeRecipient(e.target.value)}
                  >
                    <option value="">Sélectionner une entrepreneure...</option>
                    {conversations.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} — {c.program}
                      </option>
                    ))}
                  </Select>

                  <label className="flex flex-1 flex-col">
                    <span className="mb-1.5 text-sm font-medium text-ink-soft">
                      Message
                    </span>
                    <textarea
                      rows={8}
                      value={composeText}
                      onChange={(e) => setComposeText(e.target.value)}
                      placeholder="Écrivez votre message..."
                      className="w-full flex-1 rounded-xl border border-sand-200 bg-white px-4 py-3 text-[15px] text-ink placeholder:text-ink-soft/50 transition-colors focus-ring focus:border-rose-400"
                    />
                  </label>

                  <div className="flex justify-end">
                    <Button type="submit">
                      <Send size={16} />
                      Envoyer
                    </Button>
                  </div>
                </form>
              </>
            ) : selected ? (
              <>
                <div className="flex items-center gap-3 border-b border-sand-200 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 font-display text-sm text-rose-700">
                    {selected.initials}
                  </div>
                  <div>
                    <p className="font-semibold text-ink">{selected.name}</p>
                    <p className="text-xs text-ink-soft">{selected.program}</p>
                  </div>
                </div>

                <div className="flex-1 space-y-4 overflow-y-auto p-4">
                  {selected.messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex ${
                        m.sender === "institution"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                          m.sender === "institution"
                            ? "bg-rose-600 text-white"
                            : "bg-sand-100 text-ink"
                        }`}
                      >
                        <p>{m.text}</p>
                        <p
                          className={`mt-1 text-[11px] ${
                            m.sender === "institution"
                              ? "text-rose-100"
                              : "text-ink-soft"
                          }`}
                        >
                          {m.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <form
                  onSubmit={sendMessage}
                  className="flex items-center gap-2 border-t border-sand-200 p-4"
                >
                  <button
                    type="button"
                    className="rounded-xl p-2.5 text-ink-soft transition hover:bg-sand-100"
                  >
                    <Paperclip size={18} />
                  </button>

                  <input
                    type="text"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Écrivez un message..."
                    className="flex-1 rounded-xl border border-sand-200 bg-white px-4 py-2.5 text-sm text-ink outline-none transition focus:border-rose-400"
                  />

                  <button
                    type="submit"
                    disabled={draft.trim() === ""}
                    className="flex items-center justify-center rounded-xl bg-rose-600 p-2.5 text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Send size={16} />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 p-10 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sand-100 text-ink-soft">
                  <MessageSquare size={22} />
                </div>
                <p className="font-display text-lg text-ink">
                  Sélectionnez une conversation
                </p>
                <p className="max-w-xs text-sm text-ink-soft">
                  Choisissez une entrepreneure dans la liste pour afficher
                  l'échange, ou démarrez un nouveau message.
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}