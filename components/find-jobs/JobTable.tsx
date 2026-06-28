'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import type { Job } from '@/types'

export const mockJobs = [
  {
    id: 'mock-1',
    user_id: '',
    run_id: null,
    source: 'search' as const,
    source_url: '#',
    external_apply_url: null,
    title: 'Frontend Engineer',
    company: 'Vercel',
    location: 'Remote',
    salary: '$120k - $160k',
    job_type: 'fulltime' as const,
    about_role: '',
    responsibilities: [],
    requirements: [],
    nice_to_have: [],
    benefits: [],
    about_company: null,
    match_score: 92,
    match_reason: null,
    matched_skills: [],
    missing_skills: [],
    company_research: null,
    found_at: new Date().toISOString(),
  },
  {
    id: 'mock-2',
    user_id: '',
    run_id: null,
    source: 'search' as const,
    source_url: '#',
    external_apply_url: null,
    title: 'Senior Frontend Developer',
    company: 'Stripe',
    location: 'Remote',
    salary: '$140k - $180k',
    job_type: 'fulltime' as const,
    about_role: '',
    responsibilities: [],
    requirements: [],
    nice_to_have: [],
    benefits: [],
    about_company: null,
    match_score: 88,
    match_reason: null,
    matched_skills: [],
    missing_skills: [],
    company_research: null,
    found_at: new Date().toISOString(),
  },
  {
    id: 'mock-3',
    user_id: '',
    run_id: null,
    source: 'search' as const,
    source_url: '#',
    external_apply_url: null,
    title: 'React Developer',
    company: 'Linear',
    location: 'Remote',
    salary: '$110k - $150k',
    job_type: 'fulltime' as const,
    about_role: '',
    responsibilities: [],
    requirements: [],
    nice_to_have: [],
    benefits: [],
    about_company: null,
    match_score: 75,
    match_reason: null,
    matched_skills: [],
    missing_skills: [],
    company_research: null,
    found_at: new Date().toISOString(),
  },
  {
    id: 'mock-4',
    user_id: '',
    run_id: null,
    source: 'search' as const,
    source_url: '#',
    external_apply_url: null,
    title: 'Frontend Engineer',
    company: 'GitHub',
    location: 'Remote',
    salary: '$115k - $155k',
    job_type: 'fulltime' as const,
    about_role: '',
    responsibilities: [],
    requirements: [],
    nice_to_have: [],
    benefits: [],
    about_company: null,
    match_score: 68,
    match_reason: null,
    matched_skills: [],
    missing_skills: [],
    company_research: null,
    found_at: new Date().toISOString(),
  },
  {
    id: 'mock-5',
    user_id: '',
    run_id: null,
    source: 'search' as const,
    source_url: '#',
    external_apply_url: null,
    title: 'Senior Frontend Engineer',
    company: 'Notion',
    location: 'Remote',
    salary: '$130k - $170k',
    job_type: 'fulltime' as const,
    about_role: '',
    responsibilities: [],
    requirements: [],
    nice_to_have: [],
    benefits: [],
    about_company: null,
    match_score: 85,
    match_reason: null,
    matched_skills: [],
    missing_skills: [],
    company_research: null,
    found_at: new Date().toISOString(),
  },
  {
    id: 'mock-6',
    user_id: '',
    run_id: null,
    source: 'search' as const,
    source_url: '#',
    external_apply_url: null,
    title: 'Frontend Developer',
    company: 'Retool',
    location: 'Remote',
    salary: '$105k - $145k',
    job_type: 'fulltime' as const,
    about_role: '',
    responsibilities: [],
    requirements: [],
    nice_to_have: [],
    benefits: [],
    about_company: null,
    match_score: 72,
    match_reason: null,
    matched_skills: [],
    missing_skills: [],
    company_research: null,
    found_at: new Date().toISOString(),
  },
] satisfies Job[]

function getMatchScoreColor(score: number) {
  if (score >= 80) return 'bg-success'
  if (score >= 60) return 'bg-warning'
  return 'bg-error'
}

function getMatchScoreTextColor(score: number) {
  if (score >= 80) return 'text-success'
  if (score >= 60) return 'text-warning'
  return 'text-error'
}

function getMatchScoreWidth(score: number) {
  if (score <= 25) return 'w-1/4'
  if (score <= 50) return 'w-1/2'
  if (score <= 75) return 'w-3/4'
  return 'w-full'
}

function formatDate(isoString: string) {
  const date = new Date(isoString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return '1 day ago'
  if (diffDays < 30) return `${diffDays} days ago`
  return date.toLocaleDateString()
}

interface JobTableProps {
  jobs: Job[]
  isLoading?: boolean
}

export function JobTable({ jobs, isLoading = false }: JobTableProps) {
  return (
    <div className="max-w-360 mx-auto px-6 pb-8">
      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <table className="w-full">
          <thead className="border-b border-border bg-surface-secondary">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-text-secondary">
                COMPANY
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-text-secondary">
                ROLE
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-text-secondary">
                MATCH SCORE
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-text-secondary">
                SALARY EST.
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-text-secondary">
                SOURCE
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-text-secondary">
                DATE FOUND
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-text-secondary" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-sm text-text-muted">
                  Loading jobs...
                </td>
              </tr>
            ) : jobs.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-sm text-text-muted">
                  No jobs found. Search above to find matching positions.
                </td>
              </tr>
            ) : (
              jobs.map((job) => {
                const score = job.match_score ?? 0
                return (
                  <tr key={job.id} className="hover:bg-surface-secondary">
                    <td className="px-6 py-4 text-sm font-medium text-text-primary">
                      {job.company}
                    </td>
                    <td className="px-6 py-4 text-sm text-text-primary">
                      {job.title}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 overflow-hidden rounded-full bg-surface-secondary">
                          <div
                            className={`h-full ${getMatchScoreColor(score)} ${getMatchScoreWidth(score)}`}
                          />
                        </div>
                        <span className={`text-sm font-medium ${getMatchScoreTextColor(score)}`}>
                          {score}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-primary">
                      {job.salary ?? '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-full bg-accent-muted px-2.5 py-0.5 text-xs font-medium text-accent capitalize">
                        {job.source}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {formatDate(job.found_at)}
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/find-jobs/${job.id}`} className="block">
                        <ChevronRight className="h-4 w-4 text-text-muted" />
                      </Link>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
