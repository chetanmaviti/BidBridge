"use client";

import Link from "next/link";
import { Search, UserCircle } from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { FilterChips, type FeedFilter } from "./FilterChips";

export function FeedHeader({
  search,
  onSearchChange,
  filter,
  onFilterChange,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  filter: FeedFilter;
  onFilterChange: (value: FeedFilter) => void;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-3">
        <div className="flex items-center gap-4">
          <Logo />
          <div className="relative hidden flex-1 md:block">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted" />
            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface py-2 pl-10 pr-3.5 text-sm text-ink outline-none transition-all placeholder:text-ink-muted/40 focus:border-accent/60 focus:ring-2 focus:ring-accent/10"
              placeholder="Search title, agency, NAICS…"
            />
          </div>
          <Link
            href="/profile"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-ink-muted transition-all hover:border-border-bright hover:text-ink"
            title="Profile"
          >
            <UserCircle className="h-4.5 w-4.5" />
          </Link>
        </div>
        <div className="relative md:hidden">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface py-2 pl-10 pr-3.5 text-sm text-ink outline-none transition-all placeholder:text-ink-muted/40 focus:border-accent/60 focus:ring-2 focus:ring-accent/10"
            placeholder="Search opportunities…"
          />
        </div>
        <FilterChips active={filter} onChange={onFilterChange} />
      </div>
    </header>
  );
}
