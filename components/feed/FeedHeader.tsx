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
    <header className="sticky top-0 z-30 border-b border-border bg-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <Logo />
          <div className="relative hidden flex-1 md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full rounded-md border border-border bg-surface py-2.5 pl-10 pr-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-muted/60 focus:border-accent"
              placeholder="Search title, agency, NAICS"
            />
          </div>
          <Link
            href="/profile"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-surface text-ink-muted transition-colors hover:text-ink"
            title="Profile"
          >
            <UserCircle className="h-5 w-5" />
          </Link>
        </div>
        <div className="relative md:hidden">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-md border border-border bg-surface py-2.5 pl-10 pr-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-muted/60 focus:border-accent"
            placeholder="Search opportunities"
          />
        </div>
        <FilterChips active={filter} onChange={onFilterChange} />
      </div>
    </header>
  );
}
