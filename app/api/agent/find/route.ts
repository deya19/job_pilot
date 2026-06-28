import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createInsforgeServer } from '@/lib/insforge-server'
import { searchJobs, AdzunaJob } from '@/lib/adzuna'
import { MATCH_THRESHOLD } from '@/lib/utils'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

interface ScoredJob {
  matchScore: number
  matchReason: string
  matchedSkills: string[]
  missingSkills: string[]
}

async function scoreJob(job: AdzunaJob, profile: Record<string, unknown>): Promise<ScoredJob> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    response_format: { type: 'json_object' },
    temperature: 0.3,
    max_tokens: 300,
    messages: [
      {
        role: 'system',
        content: `You are a job matching assistant. Score how well a candidate's profile matches a job listing.
Return ONLY valid JSON with this exact shape:
{
  "matchScore": number (0-100),
  "matchReason": string (one paragraph explaining the match),
  "matchedSkills": string[] (skills the candidate has that the job requires),
  "missingSkills": string[] (skills the job requires that the candidate lacks)
}`,
      },
      {
        role: 'user',
        content: `JOB:
Title: ${job.title}
Company: ${job.company.display_name}
Location: ${job.location.display_name}
Description: ${job.description}

CANDIDATE PROFILE:
Current title: ${profile.current_title ?? 'Not specified'}
Experience level: ${profile.experience_level ?? 'Not specified'}
Years of experience: ${profile.years_experience ?? 'Not specified'}
Skills: ${Array.isArray(profile.skills) ? (profile.skills as string[]).join(', ') : 'None listed'}
Industries: ${Array.isArray(profile.industries) ? (profile.industries as string[]).join(', ') : 'None listed'}
Job titles seeking: ${Array.isArray(profile.job_titles_seeking) ? (profile.job_titles_seeking as string[]).join(', ') : 'Not specified'}
Remote preference: ${profile.remote_preference ?? 'Not specified'}`,
      },
    ],
  })

  try {
    return JSON.parse(response.choices[0].message.content!) as ScoredJob
  } catch {
    return {
      matchScore: 0,
      matchReason: 'Could not score this job.',
      matchedSkills: [],
      missingSkills: [],
    }
  }
}

export async function POST(req: NextRequest) {
  const insforge = await createInsforgeServer()

  const { data: userData, error: authError } = await insforge.auth.getCurrentUser()

  if (authError || !userData?.user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const user = userData.user

  const { jobTitle, location } = await req.json()

  if (!jobTitle?.trim() || !location?.trim()) {
    return NextResponse.json({ error: 'jobTitle and location are required' }, { status: 400 })
  }

  const { data: profile, error: profileError } = await insforge.database
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return NextResponse.json({ error: 'complete_profile_required' }, { status: 400 })
  }

  if (!profile.is_complete) {
    return NextResponse.json({ error: 'complete_profile_required' }, { status: 400 })
  }

  const { data: agentRun, error: runCreateError } = await insforge.database
    .from('agent_runs')
    .insert([
      {
        user_id: user.id,
        status: 'running',
        job_title_searched: jobTitle.trim(),
        location_searched: location.trim(),
        jobs_found: 0,
        started_at: new Date().toISOString(),
      },
    ])
    .select()
    .single()

  if (runCreateError || !agentRun) {
    return NextResponse.json({ error: 'Failed to create agent run' }, { status: 500 })
  }

  const runId = agentRun.id

  try {
    const adzunaResults = await searchJobs(jobTitle.trim(), location.trim())

    let savedCount = 0

    for (const job of adzunaResults) {
      const scored = await scoreJob(job, profile as Record<string, unknown>)

      const salaryStr = job.salary_min
        ? `$${Math.round(job.salary_min / 1000)}k - $${Math.round((job.salary_max ?? job.salary_min) / 1000)}k`
        : null

      const jobRecord = {
        user_id: user.id,
        run_id: runId,
        source: 'search' as const,
        source_url: job.redirect_url,
        external_apply_url: job.redirect_url,
        title: job.title,
        company: job.company.display_name,
        location: job.location.display_name,
        salary: salaryStr,
        job_type: (job.contract_type ?? 'fulltime') as 'fulltime' | 'parttime' | 'contract',
        about_role: job.description,
        responsibilities: [],
        requirements: [],
        nice_to_have: [],
        benefits: [],
        match_score: scored.matchScore,
        match_reason: scored.matchReason,
        matched_skills: scored.matchedSkills,
        missing_skills: scored.missingSkills,
        found_at: new Date().toISOString(),
      }

      await insforge.database.from('jobs').insert([jobRecord])

      if (scored.matchScore >= MATCH_THRESHOLD) {
        savedCount++
      }
    }

    await insforge.database
      .from('agent_runs')
      .update({
        status: 'completed',
        jobs_found: adzunaResults.length,
        completed_at: new Date().toISOString(),
      })
      .eq('id', runId)

    const message =
      adzunaResults.length === 0
        ? 'No jobs found for that search. Try a different title or location.'
        : `Found ${adzunaResults.length} jobs and saved ${savedCount} strong match${savedCount !== 1 ? 'es' : ''}.`

    return NextResponse.json({
      jobsFound: adzunaResults.length,
      savedCount,
      message,
    })
  } catch (err) {
    await insforge.database
      .from('agent_runs')
      .update({ status: 'failed', completed_at: new Date().toISOString() })
      .eq('id', runId)

    console.error('[agent/find] error:', err)
    return NextResponse.json({ error: 'Job search failed. Please try again.' }, { status: 500 })
  }
}
