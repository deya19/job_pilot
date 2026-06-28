'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import Link from 'next/link'

interface SearchControlsProps {
  onSearchComplete: () => void
}

export function SearchControls({ onSearchComplete }: SearchControlsProps) {
  const [jobTitle, setJobTitle] = useState('')
  const [location, setLocation] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [needsProfile, setNeedsProfile] = useState(false)

  const handleSearch = async () => {
    if (!jobTitle.trim() || !location.trim()) return

    setIsSearching(true)
    setSuccessMessage(null)
    setError(null)
    setNeedsProfile(false)

    try {
      const res = await fetch('/api/agent/find', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobTitle: jobTitle.trim(), location: location.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.error === 'complete_profile_required') {
          setNeedsProfile(true)
        } else {
          setError(data.error ?? 'Something went wrong. Please try again.')
        }
        return
      }

      setSuccessMessage(data.message)
      onSearchComplete()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="max-w-360 mx-auto px-6 py-8">
      {/* Search Controls Card */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <div className="grid max-w-4xl grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Job Title Input */}
          <div className="lg:col-span-5">
            <label className="text-xs font-medium uppercase tracking-wide text-text-secondary">
              JOB TITLE
            </label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Frontend Engineer"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                autoComplete="off"
                spellCheck="false"
                className="w-full rounded-md border border-border bg-surface px-10 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>

          {/* Location Input */}
          <div className="lg:col-span-5">
            <label className="text-xs font-medium uppercase tracking-wide text-text-secondary">
              LOCATION
            </label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Remote, New York..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                autoComplete="off"
                spellCheck="false"
                className="w-full rounded-md border border-border bg-surface px-10 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>

          {/* Find Jobs Button */}
          <div className="lg:col-span-2">
            <label className="invisible text-xs font-medium uppercase tracking-wide text-text-secondary">
              ACTION
            </label>
            <button
              onClick={handleSearch}
              disabled={isSearching || !jobTitle.trim() || !location.trim()}
              className="mt-1 flex h-10 w-full items-center justify-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Search className="h-4 w-4" />
              {isSearching ? 'Searching...' : 'Find Jobs'}
            </button>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mt-4 rounded-lg border border-success/20 bg-success/5 px-4 py-3">
            <p className="text-sm font-medium text-success">{successMessage}</p>
          </div>
        )}

        {/* Incomplete Profile Banner */}
        {needsProfile && (
          <div className="mt-4 rounded-lg border border-warning/20 bg-warning/5 px-4 py-3">
            <p className="text-sm font-medium text-warning">
              Your profile needs to be complete before searching.{' '}
              <Link href="/profile" className="underline">
                Complete your profile
              </Link>
            </p>
          </div>
        )}

        {/* Generic Error */}
        {error && (
          <div className="mt-4 rounded-lg border border-error/20 bg-error/5 px-4 py-3">
            <p className="text-sm font-medium text-error">{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}
