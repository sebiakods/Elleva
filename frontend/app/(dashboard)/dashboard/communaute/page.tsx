"use client";

import { useEffect, useState, type FormEvent } from "react";
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
  Video,
} from "lucide-react";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

type Author = {
  id: string;
  name: string;
  avatarUrl: string | null;
  role: string;
};

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

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  author: Author;
};

type EventItem = {
  id: string;
  title: string;
  type: string;
  date: string;
  time: string;
  online: boolean;
  location?: string | null;
  link?: string | null;
  description?: string | null;
  institutionName?: string | null;
};

type PostsResponse = {
  success?: boolean;
  data?: {
    items?: Post[];
  };
  message?: string;
};

type CommentsResponse = {
  success?: boolean;
  data?: Comment[];
  message?: string;
};

type EventsResponse = {
  success?: boolean;
  data?: EventItem[];
  message?: string;
};

type CreatePostResponse = {
  success?: boolean;
  data?: Post;
  message?: string;
};

type CreateCommentResponse = {
  success?: boolean;
  data?: Comment;
  message?: string;
};

const API_URL = '/api';

/**
 * Authentication
 *
 * The platform should use an httpOnly authentication cookie.
 * We therefore do NOT read accessToken/token from localStorage.
 *
 * `credentials: "include"` tells the browser to send the
 * authentication cookie with the API request.
 */
const authFetchOptions: RequestInit = {
  credentials: "include",
};

/**
 * Safely parse a JSON response.
 */
async function parseJson<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export default function CommunautePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [newPost, setNewPost] = useState("");
  const [posting, setPosting] = useState(false);

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(
    null
  );

  const [openComments, setOpenComments] = useState<
    Record<string, boolean>
  >({});

  const [comments, setComments] = useState<
    Record<string, Comment[]>
  >({});

  const [loadingComments, setLoadingComments] = useState<
    Record<string, boolean>
  >({});

  const [commentDraft, setCommentDraft] = useState<
    Record<string, string>
  >({});

  const [commenting, setCommenting] = useState<
    Record<string, boolean>
  >({});

  const [liking, setLiking] = useState<Record<string, boolean>>(
    {}
  );

  useEffect(() => {
    void loadPosts();
    void loadEvents();
  }, []);

  /**
   * Load community posts.
   */
  async function loadPosts() {
    setLoadingPosts(true);

    try {
      const response = await fetch(
        `${API_URL}/community/posts`,
        {
          method: "GET",
          ...authFetchOptions,
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const json = await parseJson<PostsResponse>(response);

      if (!response.ok) {
        throw new Error(
          json?.message ||
            `Impossible de charger les publications (${response.status}).`
        );
      }

      if (!json?.success) {
        throw new Error(
          json?.message ||
            "Impossible de charger les publications."
        );
      }

      setPosts(json.data?.items ?? []);
    } catch (error) {
      console.error("Failed to load posts:", error);
      setPosts([]);
    } finally {
      setLoadingPosts(false);
    }
  }

  /**
   * Load upcoming events.
   */
  async function loadEvents() {
    setLoadingEvents(true);

    try {
      const response = await fetch(`${API_URL}/events`, {
        method: "GET",
        ...authFetchOptions,
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      });

      const json = await parseJson<EventsResponse>(response);

      if (!response.ok) {
        throw new Error(
          json?.message ||
            `Impossible de charger les événements (${response.status}).`
        );
      }

      if (!json?.success) {
        throw new Error(
          json?.message ||
            "Impossible de charger les événements."
        );
      }

      const eventList = Array.isArray(json.data)
        ? json.data
        : [];

      setEvents(eventList.slice(0, 5));
    } catch (error) {
      console.error("Failed to load events:", error);
      setEvents([]);
    } finally {
      setLoadingEvents(false);
    }
  }

  /**
   * Create a new community post.
   */
  async function submitPost(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const content = newPost.trim();

    if (!content || posting) {
      return;
    }

    setPosting(true);

    try {
      const response = await fetch(
        `${API_URL}/community/posts`,
        {
          method: "POST",
          ...authFetchOptions,
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content,
          }),
        }
      );

      const json =
        await parseJson<CreatePostResponse>(response);

      if (!response.ok) {
        throw new Error(
          json?.message ||
            `Impossible de publier (${response.status}).`
        );
      }

      if (!json?.success || !json.data) {
        throw new Error(
          json?.message ||
            "Impossible de publier la publication."
        );
      }

      setPosts((previous) => [json.data!, ...previous]);
      setNewPost("");
    } catch (error) {
      console.error("Failed to create post:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Impossible de publier la publication."
      );
    } finally {
      setPosting(false);
    }
  }

  /**
   * Like / unlike a post.
   *
   * Uses an optimistic update and rolls back if the API fails.
   */
  async function toggleLike(postId: string) {
    if (liking[postId]) {
      return;
    }

    const currentPost = posts.find(
      (post) => post.id === postId
    );

    if (!currentPost) {
      return;
    }

    const previousLiked = currentPost.isLikedByMe;
    const previousCount = currentPost.likesCount;

    setLiking((previous) => ({
      ...previous,
      [postId]: true,
    }));

    setPosts((previous) =>
      previous.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLikedByMe: !post.isLikedByMe,
              likesCount: Math.max(
                0,
                post.likesCount +
                  (post.isLikedByMe ? -1 : 1)
              ),
            }
          : post
      )
    );

    try {
      const response = await fetch(
        `${API_URL}/community/posts/${encodeURIComponent(
          postId
        )}/like`,
        {
          method: "POST",
          ...authFetchOptions,
          headers: {
            Accept: "application/json",
          },
        }
      );

      const json = await parseJson<{
        success?: boolean;
        message?: string;
        data?: {
          isLikedByMe?: boolean;
          likesCount?: number;
        };
      }>(response);

      if (!response.ok || json?.success === false) {
        throw new Error(
          json?.message ||
            "Impossible de modifier le like."
        );
      }

      /*
       * If the backend returns the authoritative values,
       * use them instead of the optimistic values.
       */
      if (
        json?.data &&
        typeof json.data.likesCount === "number"
      ) {
        setPosts((previous) =>
          previous.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  likesCount: json.data!.likesCount!,
                  ...(typeof json.data
                    ?.isLikedByMe === "boolean"
                    ? {
                        isLikedByMe:
                          json.data.isLikedByMe,
                      }
                    : {}),
                }
              : post
          )
        );
      }
    } catch (error) {
      console.error("Failed to toggle like:", error);

      // Rollback optimistic update.
      setPosts((previous) =>
        previous.map((post) =>
          post.id === postId
            ? {
                ...post,
                isLikedByMe: previousLiked,
                likesCount: previousCount,
              }
            : post
        )
      );
    } finally {
      setLiking((previous) => {
        const next = { ...previous };
        delete next[postId];
        return next;
      });
    }
  }

  /**
   * Open / close comments and load them only once.
   */
  async function toggleComments(postId: string) {
    const willOpen = !openComments[postId];

    setOpenComments((previous) => ({
      ...previous,
      [postId]: willOpen,
    }));

    if (!willOpen || comments[postId]) {
      return;
    }

    setLoadingComments((previous) => ({
      ...previous,
      [postId]: true,
    }));

    try {
      const response = await fetch(
        `${API_URL}/community/posts/${encodeURIComponent(
          postId
        )}/comments`,
        {
          method: "GET",
          ...authFetchOptions,
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const json =
        await parseJson<CommentsResponse>(response);

      if (!response.ok) {
        throw new Error(
          json?.message ||
            "Impossible de charger les commentaires."
        );
      }

      if (!json?.success) {
        throw new Error(
          json?.message ||
            "Impossible de charger les commentaires."
        );
      }

      setComments((previous) => ({
        ...previous,
        [postId]: json.data ?? [],
      }));
    } catch (error) {
      console.error(
        "Failed to load comments:",
        error
      );

      setComments((previous) => ({
        ...previous,
        [postId]: [],
      }));
    } finally {
      setLoadingComments((previous) => ({
        ...previous,
        [postId]: false,
      }));
    }
  }

  /**
   * Submit a comment.
   */
  async function submitComment(postId: string) {
    const content = (
      commentDraft[postId] ?? ""
    ).trim();

    if (!content || commenting[postId]) {
      return;
    }

    setCommenting((previous) => ({
      ...previous,
      [postId]: true,
    }));

    try {
      const response = await fetch(
        `${API_URL}/community/posts/${encodeURIComponent(
          postId
        )}/comments`,
        {
          method: "POST",
          ...authFetchOptions,
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content,
          }),
        }
      );

      const json =
        await parseJson<CreateCommentResponse>(
          response
        );

      if (!response.ok) {
        throw new Error(
          json?.message ||
            "Impossible d'ajouter le commentaire."
        );
      }

      if (!json?.success || !json.data) {
        throw new Error(
          json?.message ||
            "Impossible d'ajouter le commentaire."
        );
      }

      setComments((previous) => ({
        ...previous,
        [postId]: [
          ...(previous[postId] ?? []),
          json.data!,
        ],
      }));

      setCommentDraft((previous) => ({
        ...previous,
        [postId]: "",
      }));

      setPosts((previous) =>
        previous.map((post) =>
          post.id === postId
            ? {
                ...post,
                commentsCount:
                  post.commentsCount + 1,
              }
            : post
        )
      );
    } catch (error) {
      console.error(
        "Failed to create comment:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Impossible d'ajouter le commentaire."
      );
    } finally {
      setCommenting((previous) => ({
        ...previous,
        [postId]: false,
      }));
    }
  }

  function toggleExpandEvent(id: string) {
    setExpandedEventId((previous) =>
      previous === id ? null : id
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-10 font-body text-ink">
      {/* Breadcrumb */}
      <div className="mb-8 text-sm text-ink-soft">
        <span>Espace Communauté</span>
        <span className="mx-2 text-ink-soft/40">
          /
        </span>
        <span className="font-medium text-wine-700">
          Flux &amp; Événements
        </span>
      </div>

      {/* Header */}
      <div className="relative mb-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 right-0 -z-10 h-56 w-56 rounded-full bg-rise-gradient-soft opacity-70 blur-3xl md:h-72 md:w-72"
        />

        <p className="font-script text-2xl leading-none text-rose-500">
          Réseau &amp; Partage
        </p>

        <h1 className="mt-2 font-display text-3xl font-semibold text-wine-900 sm:text-4xl">
          La{" "}
          <span className="text-gradient-rise">
            Communauté
          </span>{" "}
          Elleva
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-soft">
          Échangez avec d&apos;autres entrepreneures,
          posez vos questions et découvrez les
          événements à venir.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        {/* Feed */}
        <section className="space-y-6">
          {/* Create post */}
          <Card hover={false}>
            <form
              onSubmit={submitPost}
              className="space-y-3"
            >
              <textarea
                rows={3}
                maxLength={5000}
                className="w-full rounded-xl border border-wine-100 bg-white px-4 py-3 text-[15px] text-ink placeholder:text-ink-soft/50 transition-colors focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
                placeholder="Partagez une question, une victoire, un conseil avec la communauté..."
                value={newPost}
                onChange={(event) =>
                  setNewPost(event.target.value)
                }
                disabled={posting}
              />

              <div className="flex items-center justify-between">
                <span className="text-xs text-ink-soft">
                  {newPost.length}/5000
                </span>

                <button
                  type="submit"
                  disabled={
                    posting || !newPost.trim()
                  }
                  className="flex items-center gap-2 rounded-xl bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-rose-500/20 transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {posting ? (
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                  ) : (
                    <Send size={16} />
                  )}

                  {posting
                    ? "Publication..."
                    : "Publier"}
                </button>
              </div>
            </form>
          </Card>

          {/* Loading */}
          {loadingPosts ? (
            <Card hover={false}>
              <div className="flex justify-center py-10 text-rose-500">
                <Loader2
                  className="animate-spin"
                  size={24}
                />
              </div>
            </Card>
          ) : posts.length === 0 ? (
            <Card hover={false}>
              <p className="py-6 text-center text-sm text-ink-soft">
                Aucune publication pour le moment.
                Soyez la première à partager quelque
                chose !
              </p>
            </Card>
          ) : (
            posts.map((post) => {
              const isLiking = Boolean(
                liking[post.id]
              );

              const isCommentsOpen = Boolean(
                openComments[post.id]
              );

              const isLoadingComments = Boolean(
                loadingComments[post.id]
              );

              const isCommenting = Boolean(
                commenting[post.id]
              );

              return (
                <Card key={post.id}>
                  {/* Author */}
                  <div className="flex items-start gap-3">
                    <Link
                      href={`/dashboard/profile/${post.author.id}`}
                      className="group shrink-0"
                      aria-label={`Voir le profil de ${post.author.name}`}
                    >
                      <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-rose-100 font-bold text-rose-700 transition group-hover:ring-2 group-hover:ring-rose-400">
                        {post.author.avatarUrl ? (
                          <img
                            src={post.author.avatarUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          post.author.name
                            .charAt(0)
                            .toUpperCase()
                        )}
                      </div>
                    </Link>

                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/dashboard/profile/${post.author.id}`}
                        className="font-semibold text-ink hover:text-rose-600 hover:underline"
                      >
                        {post.author.name}
                      </Link>

                      <p className="text-xs text-ink-soft">
                        {new Date(
                          post.createdAt
                        ).toLocaleString("fr-FR")}
                      </p>
                    </div>
                  </div>

                  {/* Content */}
                  <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-ink">
                    {post.content}
                  </p>

                  {/* Image */}
                  {post.imageUrl && (
                    <div className="mt-4 overflow-hidden rounded-2xl border border-wine-100">
                      <img
                        src={post.imageUrl}
                        alt="Image de la publication"
                        className="max-h-[500px] w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-4 flex items-center gap-5 border-t border-wine-100 pt-3 text-sm text-ink-soft">
                    <button
                      type="button"
                      onClick={() =>
                        void toggleLike(post.id)
                      }
                      disabled={isLiking}
                      aria-label={
                        post.isLikedByMe
                          ? "Retirer le like"
                          : "Aimer la publication"
                      }
                      className={`flex items-center gap-1.5 transition disabled:cursor-not-allowed disabled:opacity-60 ${
                        post.isLikedByMe
                          ? "font-semibold text-rose-500"
                          : "hover:text-rose-500"
                      }`}
                    >
                      <Heart
                        size={16}
                        fill={
                          post.isLikedByMe
                            ? "currentColor"
                            : "none"
                        }
                      />

                      {post.likesCount}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        void toggleComments(post.id)
                      }
                      aria-expanded={isCommentsOpen}
                      className="flex items-center gap-1.5 transition hover:text-rose-500"
                    >
                      <MessageCircle size={16} />
                      {post.commentsCount}
                    </button>
                  </div>

                  {/* Comments */}
                  {isCommentsOpen && (
                    <div className="mt-4 space-y-3 border-t border-wine-100 pt-4">
                      {isLoadingComments ? (
                        <div className="flex justify-center py-3">
                          <Loader2
                            size={18}
                            className="animate-spin text-rose-500"
                          />
                        </div>
                      ) : (
                        <>
                          {(comments[post.id] ?? [])
                            .length === 0 ? (
                            <p className="text-xs text-ink-soft">
                              Aucun commentaire pour
                              le moment.
                            </p>
                          ) : (
                            (
                              comments[
                                post.id
                              ] ?? []
                            ).map((comment) => (
                              <div
                                key={comment.id}
                                className="flex gap-2 rounded-xl border border-wine-100/50 bg-sand-100/60 p-2.5 text-sm"
                              >
                                <Link
                                  href={`/dashboard/profile/${comment.author.id}`}
                                  className="shrink-0 font-semibold text-ink hover:text-rose-600 hover:underline"
                                >
                                  {
                                    comment.author
                                      .name
                                  }
                                  :
                                </Link>

                                <span className="break-words text-ink">
                                  {comment.content}
                                </span>
                              </div>
                            ))
                          )}

                          {/* Add comment */}
                          <form
                            onSubmit={(event) => {
                              event.preventDefault();
                              void submitComment(
                                post.id
                              );
                            }}
                            className="flex gap-2 pt-1"
                          >
                            <input
                              type="text"
                              maxLength={2000}
                              className="min-w-0 flex-1 rounded-xl border border-wine-100 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
                              placeholder="Écrire un commentaire..."
                              value={
                                commentDraft[
                                  post.id
                                ] ?? ""
                              }
                              onChange={(event) =>
                                setCommentDraft(
                                  (previous) => ({
                                    ...previous,
                                    [post.id]:
                                      event.target
                                        .value,
                                  })
                                )
                              }
                              disabled={isCommenting}
                            />

                            <button
                              type="submit"
                              disabled={
                                isCommenting ||
                                !(
                                  commentDraft[
                                    post.id
                                  ] ?? ""
                                ).trim()
                              }
                              aria-label="Envoyer le commentaire"
                              className="flex shrink-0 items-center justify-center rounded-xl bg-rose-500 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {isCommenting ? (
                                <Loader2
                                  size={14}
                                  className="animate-spin"
                                />
                              ) : (
                                <Send size={14} />
                              )}
                            </button>
                          </form>
                        </>
                      )}
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </section>

        {/* Events sidebar */}
        <aside className="space-y-4">
          <Card hover={false}>
            <div className="mb-4 flex items-center gap-2">
              <CalendarDays
                size={18}
                className="text-rose-500"
              />

              <h2 className="font-display text-lg font-bold text-ink">
                Événements à venir
              </h2>
            </div>

            {loadingEvents ? (
              <div className="flex justify-center py-6">
                <Loader2
                  className="animate-spin text-rose-500"
                  size={20}
                />
              </div>
            ) : events.length === 0 ? (
              <p className="text-sm text-ink-soft">
                Aucun événement publié pour le moment.
              </p>
            ) : (
              <div className="space-y-4">
                {events.map((event) => {
                  const isExpanded =
                    expandedEventId === event.id;

                  const hasLink =
                    typeof event.link === "string" &&
                    event.link.trim().length > 0;

                  return (
                    <div
                      key={event.id}
                      className="space-y-3 rounded-2xl border border-wine-100 bg-sand-100/50 p-4 transition hover:border-rose-200 hover:shadow-sm"
                    >
                      {/* Event header */}
                      <div className="flex items-start justify-between gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            toggleExpandEvent(
                              event.id
                            )
                          }
                          className="min-w-0 flex-1 text-left"
                          aria-expanded={isExpanded}
                        >
                          <Badge tone="gold">
                            {event.type}
                          </Badge>

                          <p className="mt-1.5 text-sm font-bold leading-snug text-ink">
                            {event.title}
                          </p>

                          <p className="mt-0.5 text-xs font-medium text-ink-soft">
                            {event.date} à{" "}
                            {event.time}
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            toggleExpandEvent(
                              event.id
                            )
                          }
                          aria-label={
                            isExpanded
                              ? "Réduire les détails"
                              : "Afficher les détails"
                          }
                          className="pt-1 text-wine-300 transition hover:text-ink"
                        >
                          {isExpanded ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          )}
                        </button>
                      </div>

                      {/* Location */}
                      <div className="flex items-center gap-1.5 text-xs font-medium text-ink-soft">
                        {event.online ? (
                          <Video
                            size={14}
                            className="text-rose-500"
                          />
                        ) : (
                          <MapPin
                            size={14}
                            className="text-rose-500"
                          />
                        )}

                        <span>
                          {event.online
                            ? "En ligne"
                            : event.location ||
                              "Présentiel"}
                        </span>
                      </div>

                      {/* Meeting/event link */}
                      {hasLink && (
                        <a
                          href={event.link!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-500 px-3 py-2 text-xs font-bold text-white shadow-sm shadow-rose-500/20 transition hover:bg-rose-600"
                        >
                          {event.online
                            ? "Rejoindre la visio"
                            : "Voir l'événement"}

                          <ExternalLink size={13} />
                        </a>
                      )}

                      {/* Expanded details */}
                      {isExpanded && (
                        <div className="space-y-2 border-t border-wine-100 pt-3 text-xs">
                          {event.description && (
                            <p className="leading-relaxed text-ink/80">
                              {event.description}
                            </p>
                          )}

                          {event.institutionName && (
                            <p className="italic text-ink-soft/90">
                              Organisé par :{" "}
                              {event.institutionName}
                            </p>
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
    </main>
  );
}
