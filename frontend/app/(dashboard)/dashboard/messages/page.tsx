"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  GraduationCap,
  Building2,
  Headset,
  Search,
  X,
  MessageCircle,
  ArrowRight,
  Send,
  Loader2,
  ChevronUp,
  AlertCircle,
  RotateCcw,
  ArrowDown,
  Check,
  CheckCheck,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// How often we poll for new messages / unread counts. Tune to taste,
// or swap the polling effects below for a WebSocket/SSE subscription later.
const MESSAGE_POLL_MS = 4000;
const UNREAD_POLL_MS = 15000;

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string | null;
  bio?: string | null;
};

type Message = {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  readAt?: string | null;
};

// Client-only fields layered on top of a real Message while a send is in flight.
type UIMessage = Message & {
  pending?: boolean;
  failed?: boolean;
  clientId?: string;
};

const categories = [
  {
    key: "EXPERT",
    title: "Experts",
    description: "Mentoring, advice, courses and business guidance.",
    icon: GraduationCap,
  },
  {
    key: "INSTITUTION",
    title: "Institutions",
    description: "Funding programs, partnerships and opportunities.",
    icon: Building2,
  },
  {
    key: "ADMIN",
    title: "Support",
    description: "Account issues and platform assistance.",
    icon: Headset,
  },
] as const;

const AVATAR_TINTS = [
  "from-wine-500 to-rose-400",
  "from-rose-500 to-amber-400",
  "from-wine-600 to-rose-500",
  "from-amber-500 to-rose-400",
];

function tintFor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash + id.charCodeAt(i)) % AVATAR_TINTS.length;
  return AVATAR_TINTS[hash];
}

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

function formatDateDivider(iso: string) {
  try {
    const date = new Date(iso);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const isSameDay = (a: Date, b: Date) =>
      a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

    if (isSameDay(date, today)) return "Today";
    if (isSameDay(date, yesterday)) return "Yesterday";
    return date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return "";
  }
}

function dedupeAndSort(messages: UIMessage[]): UIMessage[] {
  const map = new Map<string, UIMessage>();
  for (const m of messages) map.set(m.id, m);
  return Array.from(map.values()).sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 rounded-xl2 border border-rose-100 bg-white p-4">
      <div className="h-12 w-12 shrink-0 animate-pulse rounded-full bg-rose-100" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-1/3 animate-pulse rounded bg-rose-100" />
        <div className="h-2.5 w-2/3 animate-pulse rounded bg-rose-50" />
      </div>
      <div className="h-9 w-24 shrink-0 animate-pulse rounded-lg bg-rose-50" />
    </div>
  );
}

export default function MessagesPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [errored, setErrored] = useState(false);
  const [selectedRole, setSelectedRole] = useState<(typeof categories)[number]["key"]>("EXPERT");
  const [search, setSearch] = useState("");
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  // conversation panel state
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [conversationError, setConversationError] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [showJumpToLatest, setShowJumpToLatest] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const activeIdRef = useRef<string | null>(null);
  const messagesRef = useRef<UIMessage[]>([]);
  const isNearBottomRef = useRef(true);

  // temporary until auth token is connected
  const currentUserId = "cmseo90l50001r603a8oi9992";

  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // ---------- Load contacts ----------
  const loadUsers = useCallback(async () => {
    try {
      setErrored(false);
      const res = await fetch(`${API_URL}/messages/users`, {
        headers: { "user-id": currentUserId },
      });
      const data = await safeJson(res);
      if (Array.isArray(data)) setUsers(data);
    } catch (error) {
      console.error("LOAD USERS ERROR:", error);
      setErrored(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // ---------- Unread counts (polled) ----------
  const loadUnreadCounts = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/messages/unread-counts`, {
        headers: { "user-id": currentUserId },
      });
      if (!res.ok) return;
      const data = await safeJson(res);
      if (data && typeof data === "object") setUnreadCounts(data);
    } catch (error) {
      // Non-fatal: the badge simply stays hidden if this endpoint is unavailable.
      console.error("LOAD UNREAD COUNTS ERROR:", error);
    }
  }, []);

  useEffect(() => {
    loadUnreadCounts();
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") loadUnreadCounts();
    }, UNREAD_POLL_MS);
    const onVisibility = () => {
      if (document.visibilityState === "visible") loadUnreadCounts();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [loadUnreadCounts]);

  // ---------- Conversation loading ----------
  async function loadConversation(otherUserId: string, { silent }: { silent?: boolean } = {}) {
    if (!silent) {
      setLoadingMessages(true);
      setConversationError(false);
    }
    try {
      const res = await fetch(`${API_URL}/messages/${otherUserId}`, {
        headers: { "user-id": currentUserId },
      });
      if (!res.ok) throw new Error(`Load failed: ${res.status}`);
      const data = await safeJson(res);
      if (activeIdRef.current !== otherUserId) return; // user switched away mid-request

      const incoming: UIMessage[] = Array.isArray(data) ? data : [];
      setMessages((prev) => {
        // keep any still-pending optimistic messages that the server hasn't echoed back yet
        const stillPending = prev.filter((m) => m.pending && !incoming.some((i) => i.id === m.id));
        return dedupeAndSort([...incoming, ...stillPending]);
      });
      if (!silent) setConversationError(false);
    } catch (err) {
      console.error("LOAD CONVERSATION ERROR:", err);
      if (!silent) setConversationError(true);
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  }

  async function markAsRead(otherUserId: string) {
    setUnreadCounts((prev) => {
      if (!prev[otherUserId]) return prev;
      const next = { ...prev };
      delete next[otherUserId];
      return next;
    });
    try {
      await fetch(`${API_URL}/messages/${otherUserId}/read`, {
        method: "POST",
        headers: { "user-id": currentUserId },
      });
    } catch (error) {
      // Non-fatal: worst case the badge re-appears on the next unread-count poll.
      console.error("MARK READ ERROR:", error);
    }
  }

  function toggleConversation(user: User) {
    if (activeId === user.id) {
      setActiveId(null);
      setMessages([]);
      setNewMessage("");
      return;
    }
    setActiveId(user.id);
    setNewMessage("");
    isNearBottomRef.current = true;
    loadConversation(user.id);
    markAsRead(user.id);
  }

  // Poll the open conversation for messages the other person just sent.
  useEffect(() => {
    if (!activeId) return;
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        loadConversation(activeId, { silent: true });
      }
    }, MESSAGE_POLL_MS);
    const onVisibility = () => {
      if (document.visibilityState === "visible") loadConversation(activeId, { silent: true });
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  // Keep unread badge cleared while the thread is actively open and new messages arrive.
  useEffect(() => {
    if (activeId) markAsRead(activeId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length]);

  // ---------- Scroll handling ----------
  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const nearBottom = distanceFromBottom < 80;
    isNearBottomRef.current = nearBottom;
    setShowJumpToLatest(!nearBottom);
  }

  function scrollToBottom(behavior: ScrollBehavior = "smooth") {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior });
    setShowJumpToLatest(false);
    isNearBottomRef.current = true;
  }

  useEffect(() => {
    // Only auto-scroll if the user is already near the bottom, so reading
    // older history isn't interrupted by incoming messages.
    if (isNearBottomRef.current) {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
    } else {
      setShowJumpToLatest(true);
    }
  }, [messages, activeId]);

  // Auto-resize the composer as the user types.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [newMessage]);

  useEffect(() => {
    if (activeId) textareaRef.current?.focus();
  }, [activeId]);

  // ---------- Sending ----------
  async function sendMessage(otherUserId: string) {
    const content = newMessage.trim();
    if (!content || sending) return;

    const clientId = `pending-${Date.now()}`;
    const optimisticMessage: UIMessage = {
      id: clientId,
      senderId: currentUserId,
      receiverId: otherUserId,
      content,
      createdAt: new Date().toISOString(),
      pending: true,
      clientId,
    };

    setMessages((prev) => dedupeAndSort([...prev, optimisticMessage]));
    setNewMessage("");
    isNearBottomRef.current = true;
    setSending(true);

    try {
      const res = await fetch(`${API_URL}/messages/${otherUserId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "user-id": currentUserId,
        },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) throw new Error(`Send failed: ${res.status}`);

      const data: Message = await res.json();
      setMessages((prev) =>
        dedupeAndSort(prev.filter((m) => m.clientId !== clientId).concat({ ...data }))
      );
    } catch (err) {
      console.error("SEND MESSAGE ERROR:", err);
      setMessages((prev) =>
        prev.map((m) => (m.clientId === clientId ? { ...m, pending: false, failed: true } : m))
      );
    } finally {
      setSending(false);
    }
  }

  async function retrySend(message: UIMessage) {
    if (!activeId) return;
    setMessages((prev) => prev.filter((m) => m.clientId !== message.clientId));
    setNewMessage(message.content);
    // small delay so state updates before re-sending
    setTimeout(() => sendMessage(activeId), 0);
  }

  function handleComposerKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>, otherUserId: string) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(otherUserId);
    }
  }

  const counts = useMemo(() => {
    return categories.reduce<Record<string, number>>((acc, c) => {
      acc[c.key] = users.filter((u) => u.role === c.key).length;
      return acc;
    }, {});
  }, [users]);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((user) => {
      const roleMatch = user.role === selectedRole;
      if (!roleMatch) return false;
      if (!q) return true;
      return (
        user.name.toLowerCase().includes(q) ||
        user.email?.toLowerCase().includes(q) ||
        user.bio?.toLowerCase().includes(q)
      );
    });
  }, [users, selectedRole, search]);

  const activeCategory = categories.find((c) => c.key === selectedRole)!;
  const activeUser = users.find((u) => u.id === activeId) || null;

  return (
    <div className="min-h-screen bg-sand-50">
      <div className="mx-auto max-w-5xl px-6 py-8 md:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl2 bg-rise-gradient text-white shadow-bloom">
            <MessageCircle size={20} />
          </div>
          <div>
            <h1 className="font-display text-2xl text-wine-700 md:text-3xl">Messages</h1>
            <p className="text-sm text-ink-soft">Connect with the right person for your needs.</p>
          </div>
        </div>

        {/* Category tabs */}
        <div
          role="tablist"
          aria-label="Contact categories"
          className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3"
        >
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = selectedRole === category.key;
            const count = counts[category.key] ?? 0;
            const categoryUnread = users
              .filter((u) => u.role === category.key)
              .reduce((sum, u) => sum + (unreadCounts[u.id] || 0), 0);

            return (
              <button
                key={category.key}
                role="tab"
                aria-selected={isActive}
                onClick={() => setSelectedRole(category.key)}
                className={`
                  group relative flex items-center gap-3 rounded-xl2 border px-4 py-3.5
                  text-left transition-all duration-150
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine-400 focus-visible:ring-offset-2 focus-visible:ring-offset-sand-50
                  ${
                    isActive
                      ? "border-transparent bg-rise-gradient text-white shadow-bloom"
                      : "border-rose-100 bg-white text-ink hover:-translate-y-0.5 hover:border-rose-300 hover:shadow-card"
                  }
                `}
              >
                {categoryUnread > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-wine-600 px-1 text-[10px] font-bold text-white shadow-card">
                    {categoryUnread > 9 ? "9+" : categoryUnread}
                  </span>
                )}

                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    isActive ? "bg-white/15" : "bg-rose-50 text-wine-600"
                  }`}
                >
                  <Icon size={18} />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">{category.title}</p>
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none ${
                        isActive ? "bg-white/20 text-white" : "bg-rose-100 text-wine-600"
                      }`}
                    >
                      {count}
                    </span>
                  </div>
                  <p
                    className={`mt-0.5 truncate text-xs ${
                      isActive ? "text-white/80" : "text-ink-soft"
                    }`}
                  >
                    {category.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative mb-6 max-w-md">
          <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-wine-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${activeCategory.title.toLowerCase()}...`}
            className="w-full rounded-xl border border-rose-100 bg-white py-2.5 pl-10 pr-9 text-sm text-ink outline-none transition focus:border-wine-300 focus:ring-2 focus:ring-rose-200"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft transition hover:text-wine-600"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Section heading */}
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-base font-semibold text-wine-700">
            Available {activeCategory.title}
          </h2>
          {!loading && (
            <span className="text-xs text-ink-soft">
              {filteredUsers.length} {filteredUsers.length === 1 ? "contact" : "contacts"}
            </span>
          )}
        </div>

        {/* List */}
        <div className="space-y-3">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
          ) : errored ? (
            <div className="rounded-xl2 border border-rose-100 bg-white p-8 text-center">
              <AlertCircle size={20} className="mx-auto mb-2 text-wine-400" />
              <p className="text-sm font-medium text-ink">Couldn&apos;t load contacts.</p>
              <p className="mt-1 text-xs text-ink-soft">Check your connection and try again.</p>
              <button
                onClick={() => {
                  setLoading(true);
                  loadUsers();
                }}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-medium text-wine-600 transition hover:bg-rise-gradient hover:text-white"
              >
                <RotateCcw size={13} /> Retry
              </button>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="rounded-xl2 border border-dashed border-rose-200 bg-white p-10 text-center">
              <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-rose-50 text-wine-400">
                <Search size={18} />
              </div>
              <p className="text-sm font-medium text-ink">No contacts found</p>
              <p className="mt-1 text-xs text-ink-soft">
                {search
                  ? `Nothing matches "${search}" in ${activeCategory.title.toLowerCase()}.`
                  : `No ${activeCategory.title.toLowerCase()} are available right now.`}
              </p>
            </div>
          ) : (
            filteredUsers.map((user) => {
              const isOpen = activeId === user.id;
              const unread = unreadCounts[user.id] || 0;

              return (
                <div
                  key={user.id}
                  className={`
                    rounded-xl2 border bg-white transition-all duration-150
                    ${isOpen ? "border-wine-300 shadow-bloom" : "border-rose-100 hover:border-rose-300 hover:shadow-card"}
                  `}
                >
                  {/* Row */}
                  <div className="flex w-full items-center gap-4 p-4">
                    <div className="relative shrink-0">
                      {user.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={user.avatarUrl}
                          alt={user.name}
                          className="h-12 w-12 rounded-full object-cover ring-2 ring-white shadow-card"
                        />
                      ) : (
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${tintFor(
                            user.id
                          )} text-base font-bold text-white shadow-card`}
                        >
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      {unread > 0 && !isOpen && (
                        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-wine-600 px-1 text-[10px] font-bold text-white">
                          {unread > 9 ? "9+" : unread}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3
                          className={`truncate ${unread > 0 && !isOpen ? "font-bold text-ink" : "font-semibold text-ink"}`}
                        >
                          {user.name}
                        </h3>
                        <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-wine-500">
                          {user.role}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-sm text-ink-soft">
                        {user.bio || "Elleva member"}
                      </p>
                    </div>

                    <button
                      onClick={() => toggleConversation(user)}
                      aria-expanded={isOpen}
                      className={`
                        flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-all
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine-400
                        ${
                          isOpen
                            ? "bg-rise-gradient text-white shadow-bloom"
                            : "bg-rose-50 text-wine-600 hover:bg-rise-gradient hover:text-white hover:shadow-bloom"
                        }
                      `}
                    >
                      {isOpen ? "Close" : "Message"}
                      {isOpen ? (
                        <ChevronUp size={14} />
                      ) : (
                        <ArrowRight size={14} className="transition-transform" />
                      )}
                    </button>
                  </div>

                  {/* Inline conversation panel */}
                  {isOpen && (
                    <div className="border-t border-rose-100 bg-sand-50/60 px-4 py-3">
                      <div className="relative">
                        <div
                          ref={scrollRef}
                          onScroll={handleScroll}
                          className="mb-3 max-h-80 space-y-1 overflow-y-auto pr-1 scroll-smooth"
                        >
                          {loadingMessages ? (
                            <div className="flex items-center justify-center py-6 text-ink-soft">
                              <Loader2 size={16} className="mr-2 animate-spin" />
                              <span className="text-xs">Loading conversation...</span>
                            </div>
                          ) : conversationError ? (
                            <div className="py-4 text-center">
                              <p className="text-xs text-ink-soft">Couldn&apos;t load this conversation.</p>
                              <button
                                onClick={() => loadConversation(user.id)}
                                className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-1 text-xs font-medium text-wine-600 transition hover:bg-rise-gradient hover:text-white"
                              >
                                <RotateCcw size={12} /> Retry
                              </button>
                            </div>
                          ) : messages.length === 0 ? (
                            <p className="py-4 text-center text-xs text-ink-soft">
                              No messages yet. Say hello to {user.name.split(" ")[0]}.
                            </p>
                          ) : (
                            messages.map((m, idx) => {
                              const isMine = m.senderId === currentUserId;
                              const prev = messages[idx - 1];
                              const showDivider =
                                !prev || formatDateDivider(prev.createdAt) !== formatDateDivider(m.createdAt);

                              return (
                                <div key={m.id}>
                                  {showDivider && (
                                    <div className="my-3 flex items-center justify-center">
                                      <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-medium text-wine-500">
                                        {formatDateDivider(m.createdAt)}
                                      </span>
                                    </div>
                                  )}
                                  <div className={`flex py-0.5 ${isMine ? "justify-end" : "justify-start"}`}>
                                    <div
                                      className={`
                                        max-w-[75%] rounded-xl px-3.5 py-2 text-sm
                                        ${
                                          isMine
                                            ? m.failed
                                              ? "border border-red-300 bg-red-50 text-red-700"
                                              : "bg-rise-gradient text-white"
                                            : "border border-rose-100 bg-white text-ink"
                                        }
                                        ${m.pending ? "opacity-60" : ""}
                                      `}
                                    >
                                      <p className="whitespace-pre-wrap break-words">{m.content}</p>
                                      <div
                                        className={`mt-1 flex items-center gap-1 text-[10px] ${
                                          isMine && !m.failed ? "text-white/70" : "text-ink-soft"
                                        }`}
                                      >
                                        <span>{formatTime(m.createdAt)}</span>
                                        {isMine && !m.failed && (
                                          m.pending ? (
                                            <Loader2 size={10} className="animate-spin" />
                                          ) : m.readAt ? (
                                            <CheckCheck size={12} />
                                          ) : (
                                            <Check size={12} />
                                          )
                                        )}
                                        {m.failed && (
                                          <button
                                            onClick={() => retrySend(m)}
                                            className="ml-1 inline-flex items-center gap-1 font-medium text-red-700 underline"
                                          >
                                            <RotateCcw size={10} /> Retry
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>

                        {showJumpToLatest && messages.length > 0 && (
                          <button
                            onClick={() => scrollToBottom()}
                            className="absolute bottom-3 right-2 flex items-center gap-1 rounded-full bg-wine-600 px-3 py-1.5 text-xs font-medium text-white shadow-bloom transition hover:bg-wine-700"
                          >
                            <ArrowDown size={12} /> New
                          </button>
                        )}
                      </div>

                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          sendMessage(user.id);
                        }}
                        className="flex items-end gap-2"
                      >
                        <textarea
                          ref={textareaRef}
                          rows={1}
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={(e) => handleComposerKeyDown(e, user.id)}
                          placeholder={`Message ${user.name.split(" ")[0]}... (Enter to send)`}
                          className="max-h-32 flex-1 resize-none rounded-lg border border-rose-100 bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-wine-300 focus:ring-2 focus:ring-rose-200"
                        />
                        <button
                          type="submit"
                          disabled={sending || !newMessage.trim()}
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rise-gradient text-white shadow-bloom transition disabled:cursor-not-allowed disabled:opacity-50"
                          aria-label="Send message"
                        >
                          {sending ? (
                            <Loader2 size={15} className="animate-spin" />
                          ) : (
                            <Send size={15} />
                          )}
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}