'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api } from '@/services/api';
import authService, { type User } from '@/services/auth';

type Role = 'ADMIN' | 'EXPERT' | 'ENTREPRENEUR' | 'INSTITUTION';

interface UserSummary {
  id: string;
  name: string;
  email?: string;
  role: Role;
}

interface MessageItem {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender: UserSummary;
  receiver: UserSummary;
}

interface ConversationSummary {
  id: string;
  updatedAt: string;
  participant: UserSummary | null;
  lastMessage: MessageItem | null;
  unreadCount: number;
}

const ROLE_LABELS: Record<Role, string> = {
  ADMIN: 'Admin',
  EXPERT: 'Expert',
  ENTREPRENEUR: 'Entrepreneur',
  INSTITUTION: 'Institution',
};

const ROLE_FILTERS: Array<{ value: Role | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'All' },
  { value: 'ENTREPRENEUR', label: 'Entrepreneurs' },
  { value: 'INSTITUTION', label: 'Institutions' },
  { value: 'ADMIN', label: 'Admins' },
];

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function ExpertMessagesPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserSummary | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [input, setInput] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | 'ALL'>('ALL');

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const data = await api.get<UserSummary[]>('/messages/users');
      setUsers(data);
    } catch {
      setError('Could not load the users list. Please try again.');
    }
  }, []);

  const fetchConversations = useCallback(async () => {
    try {
      const data = await api.get<ConversationSummary[]>('/messages/conversations');
      setConversations(data);
    } catch {
      // Non-fatal: users list is the primary source of truth.
    }
  }, []);

  const fetchMessages = useCallback(async (userId: string) => {
    setLoadingMessages(true);
    setError(null);
    try {
      const data = await api.get<MessageItem[]>(`/messages/${userId}`);
      setMessages(data);
    } catch {
      setError('Could not load this conversation. Please try again.');
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    setCurrentUser(authService.getUser());
    setLoadingUsers(true);
    Promise.all([fetchUsers(), fetchConversations()]).finally(() => setLoadingUsers(false));
  }, [fetchUsers, fetchConversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectUser = (user: UserSummary) => {
    setSelectedUser(user);
    fetchMessages(user.id);
  };

  const handleSend = async () => {
    if (!selectedUser || !input.trim() || sending) return;
    setSending(true);
    setError(null);
    const content = input.trim();
    try {
      const created = await api.post<MessageItem>('/messages', {
        receiverId: selectedUser.id,
        content,
      });
      setMessages((prev) => [...prev, created]);
      setInput('');
      fetchConversations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const unreadForUser = (userId: string) =>
    conversations.find((c) => c.participant?.id === userId)?.unreadCount ?? 0;

  const lastMessageForUser = (userId: string) =>
    conversations.find((c) => c.participant?.id === userId)?.lastMessage ?? null;

  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      const aConvo = conversations.find((c) => c.participant?.id === a.id);
      const bConvo = conversations.find((c) => c.participant?.id === b.id);
      if (aConvo && bConvo) {
        return new Date(bConvo.updatedAt).getTime() - new Date(aConvo.updatedAt).getTime();
      }
      if (aConvo) return -1;
      if (bConvo) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [users, conversations]);

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return sortedUsers.filter((user) => {
      const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
      if (!matchesRole) return false;
      if (!query) return true;
      const haystack = `${user.name} ${user.email ?? ''}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [sortedUsers, roleFilter, searchQuery]);

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  return (
    <div className="relative flex h-[calc(100vh-4rem)] w-full flex-col overflow-hidden bg-sand-50 font-body">
      {/* Ambient decorative blooms */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-rose-200/40 blur-3xl animate-float" />
      <div
        className="pointer-events-none absolute -right-20 top-1/3 h-64 w-64 rounded-full bg-wine-100/50 blur-3xl animate-float"
        style={{ animationDelay: '2s' }}
      />
      <div
        className="pointer-events-none absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-gold-400/10 blur-3xl animate-float"
        style={{ animationDelay: '4s' }}
      />

      <header className="relative z-10 flex-shrink-0 border-b border-sand-200 bg-white/70 px-5 py-5 backdrop-blur-md sm:px-8">
        <div className="flex items-center justify-between gap-3">
          <div>
                    {/* Breadcrumb */}
        <div className="mb-8 text-sm text-ink-soft">
          <span>Espace Experte</span>
          <span className="mx-2 text-ink-soft/40">/</span>
          <span className="font-medium text-wine-700">Messages</span>
        </div>
            <p className="font-script text-2xl leading-none text-rose-500">say hello,</p>
            <h1 className="font-display text-3xl text-ink">
              Your <span className="text-gradient-rise">Messages</span>
            </h1>
          </div>
          {totalUnread > 0 && (
            <span className="hidden flex-shrink-0 items-center gap-1.5 rounded-full bg-rise-gradient px-4 py-2 text-xs font-semibold text-white shadow-bloom sm:inline-flex">
              {totalUnread} new
            </span>
          )}
        </div>
      </header>

      <div className="relative z-10 flex flex-1 gap-4 overflow-hidden p-4 sm:p-6">
        {/* Users list */}
        <aside
          className={`card-surface flex w-full flex-shrink-0 flex-col overflow-hidden shadow-card sm:w-80 ${
            selectedUser ? 'hidden sm:flex' : 'flex'
          }`}
        >
          {/* Search + filters */}
          <div className="flex-shrink-0 space-y-3 border-b border-sand-100 bg-rise-gradient-soft/40 px-4 py-4">
            <div className="relative">
              <svg
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-rose-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0a7.5 7.5 0 10-10.6 0 7.5 7.5 0 0010.6 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search contacts…"
                aria-label="Search contacts"
                className="focus-ring w-full rounded-full border border-rose-100 bg-white py-2.5 pl-10 pr-9 text-sm text-ink shadow-sm placeholder:text-ink-soft/40 transition focus:border-rose-300 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-ink-soft/40 transition hover:bg-rose-100 hover:text-rose-600"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-0.5">
              {ROLE_FILTERS.map((filter) => {
                const isActive = roleFilter === filter.value;
                return (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => setRoleFilter(filter.value)}
                    className={`focus-ring flex-shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                      isActive
                        ? 'bg-rise-gradient text-white shadow-bloom'
                        : 'bg-white text-wine-500 ring-1 ring-inset ring-rose-100 hover:bg-rose-50'
                    }`}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loadingUsers ? (
              <div className="space-y-1 px-4 py-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 py-2.5">
                    <div className="h-11 w-11 flex-shrink-0 animate-pulse rounded-full bg-rose-100" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-2/3 animate-pulse rounded-full bg-rose-100" />
                      <div className="h-2.5 w-1/3 animate-pulse rounded-full bg-sand-100" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
                <span className="font-script text-3xl text-rose-300">nothing here</span>
                <p className="text-sm font-medium text-ink">
                  {searchQuery || roleFilter !== 'ALL' ? 'No contacts match' : 'No one to message yet'}
                </p>
                <p className="text-xs text-ink-soft">
                  {searchQuery || roleFilter !== 'ALL'
                    ? 'Try a different name or filter.'
                    : 'Contacts will appear here once available.'}
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-sand-100 px-2 py-2">
                {filteredUsers.map((user) => {
                  const unread = unreadForUser(user.id);
                  const isActive = selectedUser?.id === user.id;
                  const lastMessage = lastMessageForUser(user.id);
                  return (
                    <li key={user.id} className="px-0.5">
                      <button
                        type="button"
                        onClick={() => handleSelectUser(user)}
                        className={`focus-ring flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-rose-50 ${
                          isActive ? 'bg-rise-gradient-soft shadow-sm' : ''
                        }`}
                      >
                        <span className="relative flex-shrink-0">
                          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-rise-gradient text-sm font-semibold text-white shadow-sm ring-2 ring-white">
                            {getInitials(user.name)}
                          </span>
                          {unread > 0 && (
                            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-gold-500 text-[10px] font-bold text-white ring-2 ring-white">
                              {unread > 9 ? '9+' : unread}
                            </span>
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center justify-between gap-2">
                            <span className="truncate text-sm font-semibold text-ink">
                              {user.name}
                            </span>
                          </span>
                          <span className="flex items-center justify-between gap-2">
                            <span className="truncate text-xs text-ink-soft">
                              {lastMessage ? lastMessage.content : `New to ${ROLE_LABELS[user.role].toLowerCase()}s`}
                            </span>
                            <span className="flex-shrink-0 rounded-full bg-wine-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-wine-500">
                              {ROLE_LABELS[user.role]}
                            </span>
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </aside>

        {/* Conversation */}
        <section
          className={`card-surface flex flex-1 flex-col overflow-hidden shadow-card ${
            selectedUser ? 'flex' : 'hidden sm:flex'
          }`}
        >
          {!selectedUser ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-rise-gradient-soft shadow-inner">
                <svg className="h-7 w-7 text-wine-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </span>
              <p className="font-script text-3xl text-rose-500">pick a conversation</p>
              <p className="max-w-xs text-sm text-ink-soft">
                Choose someone from the list, or search for a contact by name to get started.
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-shrink-0 items-center gap-3 border-b border-sand-100 bg-rise-gradient-soft/30 px-5 py-3.5">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="focus-ring text-sm font-medium text-rose-600 sm:hidden"
                >
                  ← Back
                </button>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-rise-gradient text-xs font-semibold text-white shadow-sm ring-2 ring-white">
                  {getInitials(selectedUser.name)}
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">{selectedUser.name}</p>
                  <p className="text-xs text-wine-400">{ROLE_LABELS[selectedUser.role]}</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-5">
                {loadingMessages ? (
                  <div className="text-sm text-ink-soft">Loading messages…</div>
                ) : messages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center gap-1 text-center">
                    <span className="font-script text-2xl text-rose-300">say something sweet</span>
                    <p className="text-sm text-ink-soft">
                      No messages yet. Say hello to {selectedUser.name.split(' ')[0]}.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    {messages.map((message) => {
                      const isMine = message.senderId === currentUser?.id;
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                              isMine
                                ? 'rounded-br-md bg-rise-gradient text-white shadow-bloom'
                                : 'rounded-bl-md border border-sand-200 bg-white text-ink shadow-sm'
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words">{message.content}</p>
                            <p
                              className={`mt-1 text-right text-[10px] tracking-wide ${
                                isMine ? 'text-rose-100' : 'text-ink-soft/50'
                              }`}
                            >
                              {formatTime(message.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {error && (
                <div className="mx-5 mb-2 flex-shrink-0 rounded-xl bg-rose-50 px-3 py-2 text-xs text-wine-600">
                  {error}
                </div>
              )}

              <div className="flex flex-shrink-0 items-end gap-2 border-t border-sand-100 bg-white px-5 py-4">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Write a message…"
                  rows={1}
                  className="focus-ring flex-1 resize-none rounded-full border border-rose-100 bg-sand-50 px-4 py-2.5 text-sm text-ink placeholder:text-ink-soft/40 transition focus:border-rose-300 focus:bg-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!input.trim() || sending}
                  className="focus-ring flex-shrink-0 rounded-full bg-rise-gradient px-6 py-2.5 text-sm font-medium text-white shadow-bloom transition hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
                >
                  {sending ? 'Sending…' : 'Send'}
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
