'use client'

import { Search } from 'lucide-react'

interface FilterBarProps {
  searchText: string
  onSearchTextChange: (value: string) => void
  matchFilter: string
  onMatchFilterChange: (value: string) => void
  sortBy: string
  onSortByChange: (value: string) => void
}

export function FilterBar({ 
  searchText, 
  onSearchTextChange, 
  matchFilter, 
  onMatchFilterChange, 
  sortBy, 
  onSortByChange 
}: FilterBarProps) {
  return (
    <div className="max-w-360 mx-auto px-6 pb-4">
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 md:flex-row md:items-center">
        {/* Text Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Filter by company or role..."
              value={searchText}
              onChange={(e) => onSearchTextChange(e.target.value)}
              autoComplete="off"
              spellCheck="false"
              className="w-full rounded-md border border-border bg-surface px-10 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
        </div>

        {/* All Matches Dropdown */}
        <div className="min-w-40">
          <select 
            aria-label="Filter by match type"
            value={matchFilter}
            onChange={(e) => onMatchFilterChange(e.target.value)}
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
          >
            <option>All Matches</option>
            <option>High Match</option>
            <option>Low Match</option>
          </select>
        </div>

        {/* Match Score Sort Dropdown */}
        <div className="min-w-40">
          <select 
            aria-label="Sort by match score"
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
          >
            <option>Match Score</option>
            <option>Newest</option>
            <option>Oldest</option>
          </select>
        </div>
      </div>
    </div>
  )
}
