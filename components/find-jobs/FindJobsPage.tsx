'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { SearchControls } from './SearchControls'
import { FilterBar } from './FilterBar'
import { JobTable } from './JobTable'
import { Pagination } from './Pagination'
import type { Job } from '@/types'

const RESULTS_PER_PAGE = 20

export function FindJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchText, setSearchText] = useState('')
  const [matchFilter, setMatchFilter] = useState('All Matches')
  const [sortBy, setSortBy] = useState('Match Score')
  const [currentPage, setCurrentPage] = useState(1)

  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch('/api/jobs')
      const data = await res.json()
      if (res.ok && Array.isArray(data.jobs)) {
        setJobs(data.jobs as Job[])
      }
    } catch {
      // keep existing jobs
    }
  }, [])

  useEffect(() => {
    async function load() {
      await fetchJobs()
      setIsLoading(false)
    }
    load()
  }, [fetchJobs])

  const handleSearchComplete = useCallback(async () => {
    setCurrentPage(1)
    await fetchJobs()
  }, [fetchJobs])

  const displayJobs = jobs

  const filteredJobs = useMemo(() => {
    let filtered = [...displayJobs]

    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase()
      filtered = filtered.filter(job =>
        job.company.toLowerCase().includes(searchLower) ||
        job.title.toLowerCase().includes(searchLower)
      )
    }

    if (matchFilter === 'High Match') {
      filtered = filtered.filter(job => (job.match_score ?? 0) >= 70)
    } else if (matchFilter === 'Low Match') {
      filtered = filtered.filter(job => (job.match_score ?? 0) < 70)
    }

    if (sortBy === 'Match Score') {
      filtered.sort((a, b) => (b.match_score ?? 0) - (a.match_score ?? 0))
    } else if (sortBy === 'Newest') {
      filtered.sort((a, b) => new Date(b.found_at).getTime() - new Date(a.found_at).getTime())
    } else if (sortBy === 'Oldest') {
      filtered.sort((a, b) => new Date(a.found_at).getTime() - new Date(b.found_at).getTime())
    }

    return filtered
  }, [displayJobs, searchText, matchFilter, sortBy])

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / RESULTS_PER_PAGE))
  const safePage = Math.min(currentPage, totalPages)
  const pagedJobs = filteredJobs.slice(
    (safePage - 1) * RESULTS_PER_PAGE,
    safePage * RESULTS_PER_PAGE,
  )

  return (
    <div className="min-h-screen bg-background">
      <SearchControls onSearchComplete={handleSearchComplete} />
      <FilterBar
        searchText={searchText}
        onSearchTextChange={(v) => { setSearchText(v); setCurrentPage(1) }}
        matchFilter={matchFilter}
        onMatchFilterChange={(v) => { setMatchFilter(v); setCurrentPage(1) }}
        sortBy={sortBy}
        onSortByChange={(v) => { setSortBy(v); setCurrentPage(1) }}
      />
      <JobTable jobs={pagedJobs} isLoading={isLoading} />
      <Pagination
        total={filteredJobs.length}
        currentPage={safePage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  )
}
