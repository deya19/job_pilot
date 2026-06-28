'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  ExternalLink,
  DollarSign,
  MapPin,
  Briefcase,
  Clock,
  Sparkles,
  CheckCircle2,
  XCircle,
  Building2,
  Search,
  Loader2,
  FileText,
} from 'lucide-react'
import type { Job, CompanyResearch } from '@/types'

interface JobDetailsPageProps {
  job: Job
}

function getMatchScoreColor(score: number) {
  if (score >= 80) return 'text-success'
  if (score >= 60) return 'text-warning'
  return 'text-error'
}

function getMatchScoreBg(score: number) {
  if (score >= 80) return 'bg-success-lightest'
  if (score >= 60) return 'bg-warning/10'
  return 'bg-error/10'
}

function formatDate(isoString: string) {
  const date = new Date(isoString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
  if (diffDays === 1) return '1 day ago'
  if (diffDays < 30) return `${diffDays} days ago`
  return date.toLocaleDateString()
}

function formatJobType(jobType: string | null) {
  if (!jobType) return '—'
  const map: Record<string, string> = {
    fulltime: 'Full-time',
    parttime: 'Part-time',
    contract: 'Contract',
  }
  return map[jobType] ?? jobType
}

function JobDescriptionCard({ description, sourceUrl }: { description: string; sourceUrl: string }) {
  const CHAR_LIMIT = 300
  const isTruncated = description.length > CHAR_LIMIT

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-secondary">
          <FileText className="h-4 w-4 text-text-secondary" />
        </div>
        <span className="text-base font-semibold text-text-primary">Job Description</span>
      </div>
      <p className="text-sm leading-7 text-text-primary whitespace-pre-line">{description}</p>
      {isTruncated && (
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-accent transition-colors hover:text-accent-dark"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          View full job description
        </a>
      )}
    </div>
  )
}

function CompanyResearchCard({
  job,
  research,
  onResearchComplete,
}: {
  job: Job
  research: CompanyResearch | null
  onResearchComplete: (data: CompanyResearch) => void
}) {
  const [isResearching, setIsResearching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleResearch = async () => {
    setIsResearching(true)
    setError(null)
    try {
      const res = await fetch('/api/agent/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: job.id }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? 'Research failed. Please try again.')
        return
      }
      onResearchComplete(json.research)
    } catch {
      setError('An unexpected error occurred.')
    } finally {
      setIsResearching(false)
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-surface shadow-sm">
      <div className="flex items-center justify-between p-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-secondary">
            <Building2 className="h-4 w-4 text-text-secondary" />
          </div>
          <span className="text-base font-semibold text-text-primary">Company Research</span>
        </div>
        <button
          type="button"
          onClick={() => void handleResearch()}
          disabled={isResearching}
          className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isResearching ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Researching...
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              Research Company
            </>
          )}
        </button>
      </div>

      <div className="px-6 pb-6">
        {error && (
          <div className="mb-4 rounded-lg border border-error/20 bg-error/5 px-4 py-3 text-sm text-error">
            {error}
          </div>
        )}

        {!research ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Building2 className="mb-3 h-10 w-10 text-text-muted" />
            <p className="text-sm font-medium text-text-primary">No research yet</p>
            <p className="mt-1 max-w-xs text-sm text-text-secondary">
              Click &ldquo;Research Company&rdquo; to let the AI browse{' '}
              {job.company}&apos;s public pages and build a dossier.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="mb-1.5 text-xs font-medium uppercase tracking-wide text-text-secondary">
                Company Overview
              </h3>
              <p className="text-sm leading-6 text-text-primary">{research.companyOverview}</p>
            </div>

            <div className="h-px bg-border" />

            <div>
              <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-text-secondary">
                Tech Stack
              </h3>
              <div className="flex flex-wrap gap-2">
                {research.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="inline-flex rounded-full bg-accent-muted px-2.5 py-0.5 text-xs font-medium text-accent"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="h-px bg-border" />

            <div>
              <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-text-secondary">
                Culture
              </h3>
              <ul className="flex flex-col gap-1.5">
                {research.culture.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-text-primary">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="h-px bg-border" />

            <div>
              <h3 className="mb-1.5 text-xs font-medium uppercase tracking-wide text-text-secondary">
                Why This Role
              </h3>
              <p className="text-sm leading-6 text-text-primary">{research.whyThisRole}</p>
            </div>

            <div className="h-px bg-border" />

            <div>
              <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-text-secondary">
                Your Edge
              </h3>
              <ul className="flex flex-col gap-1.5">
                {research.yourEdge.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-text-primary">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="h-px bg-border" />

            <div>
              <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-text-secondary">
                Gaps to Address
              </h3>
              <ul className="flex flex-col gap-1.5">
                {research.gapsToAddress.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-text-primary">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-warning" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="h-px bg-border" />

            <div>
              <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-text-secondary">
                Smart Questions
              </h3>
              <ul className="flex flex-col gap-1.5">
                {research.smartQuestions.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-text-primary">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-info" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="h-px bg-border" />

            <div>
              <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-text-secondary">
                Interview Prep
              </h3>
              <ul className="flex flex-col gap-1.5">
                {research.interviewPrep.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-text-primary">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {research.sources.length > 0 && (
              <>
                <div className="h-px bg-border" />
                <div>
                  <h3 className="mb-1.5 text-xs font-medium uppercase tracking-wide text-text-secondary">
                    Sources
                  </h3>
                  <ul className="flex flex-col gap-1">
                    {research.sources.map((src, i) => (
                      <li key={i} className="text-xs text-text-muted">
                        {src}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export function JobDetailsPage({ job }: JobDetailsPageProps) {
  const [research, setResearch] = useState<CompanyResearch | null>(job.company_research)
  const score = job.match_score ?? 0
  const applyUrl = job.external_apply_url ?? job.source_url

  return (
    <main className="mx-auto max-w-360 px-6 py-8">
      <Link
        href="/find-jobs"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-text-secondary transition-colors hover:text-text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Jobs
      </Link>

      <div className="flex flex-col gap-4">
        {/* Job Header Card */}
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border bg-surface-secondary">
                <Building2 className="h-6 w-6 text-text-muted" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-text-primary">{job.title}</h1>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-sm text-text-secondary">{job.company}</span>
                  {score > 0 && (
                    <>
                      <span className="text-text-muted">•</span>
                      <span
                        className={`text-sm font-medium ${getMatchScoreColor(score)} ${getMatchScoreBg(score)} rounded-full px-2.5 py-0.5`}
                      >
                        {score}% Match Score
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            {applyUrl && (
              <a
                href={applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center gap-2 rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-surface-secondary"
              >
                <ExternalLink className="h-4 w-4" />
                View Job Post
              </a>
            )}
          </div>
        </div>

        {/* Info Cards Row */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-4 shadow-sm">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-success-lightest">
              <DollarSign className="h-4 w-4 text-success-foreground" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-text-primary">
                {job.salary ?? '—'}
              </p>
              <p className="text-xs text-text-muted uppercase tracking-wide">Salary Est.</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-4 shadow-sm">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-info-lightest">
              <MapPin className="h-4 w-4 text-info-foreground" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-text-primary">
                {job.location ? (job.location.length > 12 ? job.location.slice(0, 12) + '…' : job.location) : '—'}
              </p>
              <p className="text-xs text-text-muted uppercase tracking-wide">Location</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-4 shadow-sm">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-muted">
              <Briefcase className="h-4 w-4 text-accent" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-text-primary">
                {formatJobType(job.job_type)}
              </p>
              <p className="text-xs text-text-muted uppercase tracking-wide">Job Type</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-4 shadow-sm">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-secondary">
              <Clock className="h-4 w-4 text-text-secondary" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-text-primary">
                {formatDate(job.found_at)}
              </p>
              <p className="text-xs text-text-muted uppercase tracking-wide">Date Found</p>
            </div>
          </div>
        </div>

        {/* AI Match Reasoning */}
        {job.match_reason && (
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent" />
              <span className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                AI Match Reasoning
              </span>
            </div>
            <p className="text-sm leading-7 text-text-primary">{job.match_reason}</p>
          </div>
        )}

        {/* Required Skills vs Your Profile */}
        {(job.matched_skills.length > 0 || job.missing_skills.length > 0) && (
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <h2 className="mb-4 text-xs font-medium uppercase tracking-wide text-text-secondary">
              Required Skills vs Your Profile
            </h2>

            {job.matched_skills.length > 0 && (
              <div className="mb-4">
                <p className="mb-2 text-sm text-text-secondary">You have</p>
                <div className="flex flex-wrap gap-2">
                  {job.matched_skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 rounded-full bg-success-lightest px-2.5 py-0.5 text-xs font-medium text-success-foreground"
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {job.missing_skills.length > 0 && (
              <div>
                <p className="mb-2 text-sm text-text-secondary">Gap skills</p>
                <div className="flex flex-wrap gap-2">
                  {job.missing_skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 rounded-full bg-accent-muted px-2.5 py-0.5 text-xs font-medium text-accent"
                    >
                      <XCircle className="h-3 w-3" />
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Job Description */}
        {job.about_role && (
          <JobDescriptionCard description={job.about_role} sourceUrl={applyUrl ?? job.source_url} />
        )}

        {/* Company Research */}
        <CompanyResearchCard
          job={job}
          research={research}
          onResearchComplete={setResearch}
        />

        {/* Apply Now */}
        {applyUrl && (
          <a
            href={applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center rounded-xl bg-accent py-4 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-dark"
          >
            Apply Now at {job.company}
          </a>
        )}
      </div>
    </main>
  )
}
