"use client";

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import { 
  Heart, 
  MessageCircle, 
  Send, 
  CalendarDays, 
  Loader2, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  MapPin, 
  Video 
} from "lucide-react";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

type Author = { id: string; name: string; avatarUrl: string | null; role: string };

type Post = {
  id: string;
  content: string;
  imageUrl: string | null;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  author: Author;
  isLikedByMe: boolean;
  isMine: boolean;
};

type Comment = { id: string; content: string; createdAt: string; author: Author };

type EventItem = {
  id: string;
  title: string;
  type: string;
  date: string;
  time: string;
  online: boolean;
  location?: string;
  link?: string; // Google Meet or event link
  description?: string;
  institutionName?: string;
};

const API = "http://localhost:4000/api";

function authHeaders() {
  const token = typeof window !== "undefined" 
    ? (localStorage.getItem("accessToken") ?? localStorage.getItem("token")) 
    : "";
  return { Authorization: `Bearer ${token}` };
}

export default function CommunautePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [newPost, setNewPost] = useState("");
  const [posting, setPosting] = useState(false);

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [commentDraft, setCommentDraft] = useState<Record<string, string>>({});

  useEffect(() => {
    loadPosts();
    loadEvents();
  }, []);

  async function loadPosts() {
    setLoadingPosts(true);
    try {
      const res = await fetch(`${API}/community/posts`, { headers: authHeaders() });
      const json = await res.json();
      if (json.success) setPosts(json.data.items);
    } catch (e) {
      console.error("Failed to load posts", e);
    } finally {
      setLoadingPosts(false);
    }
  }

  async function loadEvents() {
    setLoadingEvents(true);
    try {
      const res = await fetch(`${API}/events`);
      const json = await res.json();
      if (json.success) setEvents(json.data.slice(0, 5));
    } catch (e) {
      console.error("Failed to load events", e);
    } finally {
      setLoadingEvents(false);
    }
  }

  async function submitPost(e: FormEvent) {
    e.preventDefault();
    if (!newPost.trim()) return;
    setPosting(true);
    try {
      const res = await fetch(`${API}/community/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ content: newPost }),
      });
      const json = await res.json();
      if (json.success) {
        setPosts((prev) => [json.data, ...prev]);
        setNewPost("");
      }
    } finally {
      setPosting(false);
    }
  }

  async function toggleLike(postId: string) {
    // Optimistic update
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, isLikedByMe: !p.isLikedByMe, likesCount: p.likesCount + (p.isLikedByMe ? -1 : 1) }
          : p
      )
    );
    try {
      await fetch(`${API}/community/posts/${postId}/like`, {
        method: "POST",
        headers: authHeaders(),
      });
    } catch (e) {
      console.error("Failed to toggle like", e);
    }
  }

  async function toggleComments(postId: string) {
    setOpenComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
    if (!comments[postId]) {
      const res = await fetch(`${API}/community/posts/${postId}/comments`, { headers: authHeaders() });
      const json = await res.json();
      if (json.success) setComments((prev) => ({ ...prev, [postId]: json.data }));
    }
  }

  async function submitComment(postId: string) {
    const content = commentDraft[postId];
    if (!content?.trim()) return;
    const res = await fetch(`${API}/community/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ content }),
    });
    const json = await res.json();
    if (json.success) {
      setComments((prev) => ({ ...prev, [postId]: [...(prev[postId] ?? []), json.data] }));
      setCommentDraft((prev) => ({ ...prev, [postId]: "" }));
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p))
      );
    }
  }

  function toggleExpandEvent(id: string) {
    setExpandedEventId((prev) => (prev === id ? null : id));
  }

  return (
    <>
      
        {/* Breadcrumb */}
        <div className="mb-8 text-sm text-ink-soft">
          <span>Espace Communauté</span>
          <span className="mx-2 text-ink-soft/40">/</span>
          <span className="font-medium text-wine-700">Flux & Événements</span>
        </div>

        {/* Header */}
        <div className="relative mb-10">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-16 right-0 -z-10 h-56 w-56 rounded-full bg-rise-gradient-soft opacity-70 blur-3xl md:h-72 md:w-72"
          />

          <p className="font-script text-2xl leading-none text-rose-500">Réseau & Partage</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-wine-900 sm:text-4xl">
            La <span className="text-gradient-rise">Communauté</span> Elleva
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-soft">
            Échangez avec d'autres entrepreneures, posez vos questions et découvrez les événements à venir.
          </p>
        </div>
<div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[2fr_1fr] font-body text-ink">
          {/* Feed Section */}
          <div className="space-y-6">
            <Card hover={false}>
              <form onSubmit={submitPost} className="space-y-3">
                <textarea
                  rows={3}
                  className="w-full rounded-xl border border-wine-100 bg-white px-4 py-3 text-[15px] text-ink placeholder:text-ink-soft/50 transition-colors focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                  placeholder="Partagez une question, une victoire, un conseil avec la communauté..."
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={posting || !newPost.trim()}
                    className="flex items-center gap-2 rounded-xl bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60 shadow-md shadow-rose-500/20"
                  >
                    {posting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    Publier
                  </button>
                </div>
              </form>
            </Card>

            {loadingPosts ? (
              <div className="flex justify-center py-10 text-rose-500">
                <Loader2 className="animate-spin" size={24} />
              </div>
            ) : posts.length === 0 ? (
              <Card hover={false}>
                <p className="py-6 text-center text-sm text-ink-soft">
                  Aucune publication pour le moment. Soyez la première à partager quelque chose !
                </p>
              </Card>
            ) : (
              posts.map((post) => (
                <Card key={post.id}>
                  <div className="flex items-start gap-3">
                    {/* Clickable Author Profile Avatar */}
                    <Link href={`/dashboard/profile/${post.author.id}`} className="shrink-0 group">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 font-bold text-rose-700 transition group-hover:ring-2 group-hover:ring-rose-400">
                        {post.author.name.charAt(0).toUpperCase()}
                      </div>
                    </Link>

                    <div className="min-w-0 flex-1">
                      {/* Clickable Author Name */}
                      <Link 
                        href={`/dashboard/profile/${post.author.id}`} 
                        className="font-semibold text-ink hover:text-rose-600 hover:underline"
                      >
                        {post.author.name}
                      </Link>
                      <p className="text-xs text-ink-soft">
                        {new Date(post.createdAt).toLocaleString("fr-FR")}
                      </p>
                    </div>
                  </div>

                  <p className="mt-3 whitespace-pre-wrap text-[15px] text-ink leading-relaxed">{post.content}</p>

                  <div className="mt-4 flex items-center gap-5 border-t border-wine-100 pt-3 text-sm text-ink-soft">
                    <button
                      onClick={() => toggleLike(post.id)}
                      className={`flex items-center gap-1.5 transition ${
                        post.isLikedByMe ? "text-rose-500 font-semibold" : "hover:text-rose-500"
                      }`}
                    >
                      <Heart size={16} fill={post.isLikedByMe ? "currentColor" : "none"} />
                      {post.likesCount}
                    </button>
                    <button
                      onClick={() => toggleComments(post.id)}
                      className="flex items-center gap-1.5 transition hover:text-rose-500"
                    >
                      <MessageCircle size={16} />
                      {post.commentsCount}
                    </button>
                  </div>

                  {openComments[post.id] && (
                    <div className="mt-4 space-y-3 border-t border-wine-100 pt-4">
                      {(comments[post.id] ?? []).map((c) => (
                        <div key={c.id} className="flex gap-2 text-sm bg-sand-100/60 p-2.5 rounded-xl border border-wine-100/50">
                          <Link 
                            href={`/dashboard/profile/${c.author.id}`} 
                            className="font-semibold text-ink hover:text-rose-600 hover:underline shrink-0"
                          >
                            {c.author.name}:
                          </Link>
                          <span className="text-ink">{c.content}</span>
                        </div>
                      ))}
                      <div className="flex gap-2 pt-1">
                        <input
                          className="flex-1 rounded-xl border border-wine-100 px-3 py-2 text-sm focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                          placeholder="Écrire un commentaire..."
                          value={commentDraft[post.id] ?? ""}
                          onChange={(e) =>
                            setCommentDraft((prev) => ({ ...prev, [post.id]: e.target.value }))
                          }
                          onKeyDown={(e) => e.key === "Enter" && submitComment(post.id)}
                        />
                        <button
                          onClick={() => submitComment(post.id)}
                          className="rounded-xl bg-rose-500 px-3.5 py-2 text-sm font-semibold text-white hover:bg-rose-600 transition"
                        >
                          <Send size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>

          {/* Sidebar: Events */}
          <aside className="space-y-4">
            <Card hover={false}>
              <div className="mb-4 flex items-center gap-2">
                <CalendarDays size={18} className="text-rose-500" />
                <h3 className="font-display text-lg font-bold text-ink">Événements à venir</h3>
              </div>

              {loadingEvents ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="animate-spin text-rose-500" size={20} />
                </div>
              ) : events.length === 0 ? (
                <p className="text-sm text-ink-soft">Aucun événement publié pour le moment.</p>
              ) : (
                <div className="space-y-4">
                  {events.map((e) => {
                    const isExpanded = expandedEventId === e.id;
                    const meetingUrl = e.link && e.link.trim() !== "" ? e.link : "https://meet.google.com";

                    return (
                      <div 
                        key={e.id} 
                        className="rounded-2xl border border-wine-100 bg-sand-100/50 p-4 transition hover:border-rose-200 hover:shadow-sm space-y-3"
                      >
                        <div 
                          className="flex cursor-pointer items-start justify-between gap-2"
                          onClick={() => toggleExpandEvent(e.id)}
                        >
                          <div>
                            <Badge tone="gold">{e.type}</Badge>
                            <p className="mt-1.5 text-sm font-bold text-ink leading-snug">{e.title}</p>
                            <p className="text-xs font-medium text-ink-soft mt-0.5">
                              {e.date} à {e.time}
                            </p>
                          </div>
                          <button className="text-wine-300 hover:text-ink pt-1">
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        </div>

                        {/* Location Badge */}
                        <div className="flex items-center gap-1.5 text-xs font-medium text-ink-soft">
                          {e.online ? <Video size={14} className="text-rose-500" /> : <MapPin size={14} className="text-rose-500" />}
                          <span>{e.online ? "En ligne" : (e.location || "Présentiel")}</span>
                        </div>

                        {/* Visio Button (Shows if online or link exists) */}
                        {(e.online || e.link) && (
                          <a
                            href={meetingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-500 px-3 py-2 text-xs font-bold text-white transition hover:bg-rose-600 shadow-sm shadow-rose-500/20"
                          >
                            Rejoindre la visio <ExternalLink size={13} />
                          </a>
                        )}

                        {/* Expandable Extra Details */}
                        {isExpanded && (
                          <div className="border-t border-wine-100 pt-3 text-xs space-y-2">
                            {e.description && (
                              <p className="text-ink/80 leading-relaxed">{e.description}</p>
                            )}
                            {e.institutionName && (
                              <p className="text-ink-soft/90 italic">Organisé par : {e.institutionName}</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </aside>
        </div>
      </div>
    </>
  );
}