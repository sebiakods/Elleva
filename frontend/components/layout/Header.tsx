import { Bell, Search } from "lucide-react";

export function Header({ title }: { title: string }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h1 className="font-display text-2xl text-ink sm:text-3xl">{title}</h1>
      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-full border border-sand-200 bg-white px-4 py-2 sm:flex">
          <Search size={15} className="text-ink-soft" />
          <input
            placeholder="Rechercher…"
            className="w-40 bg-transparent text-sm outline-none placeholder:text-ink-soft/60"
          />
        </div>
        <button className="relative flex h-10 w-10 items-center justify-center rounded-full border border-sand-200 bg-white text-ink-soft hover:text-rose-600 focus-ring">
          <Bell size={17} />
          <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-rose-500" />
        </button>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rise-gradient text-sm font-semibold text-white">
          AM
        </div>
      </div>
    </div>
  );
}

