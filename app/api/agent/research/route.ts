import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import OpenAI from 'openai'
import { createInsforgeServer } from '@/lib/insforge-server'
import { createBrowserbaseSession, createStagehand } from '@/lib/browserbase'
import type { Job, Profile, CompanyResearch } from '@/types'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

const homepageSchema = z.object({
  oneLiner: z.string().describe('What the company does in one sentence'),
  productSummary: z
    .string()
    .describe('What they build/sell and who it is for'),
  signals: z
    .array(z.string())
    .describe('Funding, notable customers, scale, mission, recent news'),
  pageLinks: z
    .array(
      z.object({
        url: z.string(),
        kind: z.enum([
          'about',
          'careers',
          'blog',
          'engineering',
          'product',
          'team',
          'other',
        ]),
      }),
    )
    .describe('Internal links worth visiting'),
})

const subPageSchema = z.object({
  keyPoints: z.array(z.string()),
  technologies: z
    .array(z.string())
    .describe('Specific languages, frameworks, tools, platforms'),
  valuesOrCulture: z
    .array(z.string())
    .describe('Stated values, working style, team norms'),
  notable: z
    .array(z.string())
    .describe('Customers, funding, scale, projects, awards'),
})

const dossierSchema = z.object({
  companyOverview: z.string(),
  techStack: z.array(z.string()),
  culture: z.array(z.string()),
  whyThisRole: z.string(),
  yourEdge: z.array(z.string()),
  gapsToAddress: z.array(z.string()),
  smartQuestions: z.array(z.string()),
  interviewPrep: z.array(z.string()),
  sources: z.array(z.string()),
})

const TWO_PART_TLDS = [
  'co.uk',
  'com.au',
  'co.nz',
  'org.uk',
  'com.br',
  'co.in',
  'co.jp',
  'com.mx',
  'net.au',
  'org.au',
]

function getRootDomain(hostname: string): string {
  const parts = hostname.split('.').filter(Boolean)
  if (parts.length <= 2) return hostname

  const lastTwo = parts.slice(-2).join('.').toLowerCase()
  if (TWO_PART_TLDS.includes(lastTwo)) {
    return parts.slice(-3).join('.')
  }

  return parts.slice(-2).join('.')
}

function companyFallbackDomain(company: string): string {
  return company
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .replace(/^(the|a|an)/, '')
}

async function deriveHomepageUrl(job: Job): Promise<string> {
  try {
    const response = await fetch(job.source_url, {
      redirect: 'follow',
      method: 'GET',
    })

    const finalUrl = response.url
    if (finalUrl.toLowerCase().includes('adzuna.com')) {
      throw new Error('Adzuna redirect did not resolve to employer domain')
    }

    const url = new URL(finalUrl)
    const rootDomain = getRootDomain(url.hostname)
    return `https://${rootDomain}`
  } catch {
    return `https://www.${companyFallbackDomain(job.company)}.com`
  }
}

function selectSubPageLinks(
  links: { url: string; kind: string }[],
  homepageUrl: string,
): { url: string; kind: string }[] {
  const preference = [
    'about',
    'blog',
    'engineering',
    'product',
    'team',
    'careers',
    'other',
  ]

  const homepageOrigin = new URL(homepageUrl).origin

  const validLinks = links
    .filter((link) => {
      try {
        const url = new URL(link.url, homepageUrl)
        return url.origin === homepageOrigin
      } catch {
        return false
      }
    })
    .map((link) => ({
      ...link,
      url: new URL(link.url, homepageUrl).href,
    }))

  const seen = new Set<string>()
  const deduplicated: { url: string; kind: string }[] = []
  for (const link of validLinks) {
    if (seen.has(link.url)) continue
    seen.add(link.url)
    deduplicated.push(link)
  }

  return deduplicated
    .sort((a, b) => {
      const idxA = preference.indexOf(a.kind)
      const idxB = preference.indexOf(b.kind)
      return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB)
    })
    .slice(0, 3)
}

function getResearchSources(value: unknown): string[] {
  if (!value || typeof value !== 'object' || !('sources' in value)) {
    return []
  }

  const sources = value.sources
  return Array.isArray(sources) && sources.every((source) => typeof source === 'string')
    ? sources
    : []
}

function createFallbackDossier(companyResearch: unknown, job: Job, profile: Profile): CompanyResearch {
  return {
    companyOverview:
      job.about_company ??
      `Research collected for ${job.company} was limited. Review the job posting and the company's public website before applying.`,
    techStack: profile.skills.slice(0, 10),
    culture: [],
    whyThisRole:
      job.match_reason ??
      `This role may align with the candidate's profile based on the available job information.`,
    yourEdge: job.matched_skills.slice(0, 8),
    gapsToAddress: job.missing_skills.slice(0, 8),
    smartQuestions: [
      `What would success look like in the first 90 days for this ${job.title} role?`,
      `Which technologies and processes does the team use most often?`,
    ],
    interviewPrep: job.requirements.slice(0, 8),
    sources: getResearchSources(companyResearch),
  }
}

async function synthesizeCompanyResearch(
  companyResearch: unknown,
  job: Job,
  profile: Profile,
): Promise<CompanyResearch> {
  const fallback = createFallbackDossier(companyResearch, job, profile)
  const systemPrompt = `You are a sharp career strategist preparing a candidate to apply for a specific role. You are given (a) research collected from the company's own website, (b) the job posting, and (c) the candidate's profile. Produce a concise, concrete briefing that gives this specific candidate an edge for this specific role.

Rules:
- Ground every company claim in the provided research or job posting. Never invent funding, customers, headcount, or facts. If research was thin, infer carefully from the job posting and say what is inferred.
- Be specific to THIS candidate. Connect their actual skills and past work to this company's stack, product, and values. No generic advice that would apply to anyone.
- Turn the candidate's missing skills into a strategy: how to frame the gap honestly and what adjacent experience to lean on.
- Talking points and questions must reference real things from the research, the kind of detail that signals the candidate did their homework.
- Keep every item tight: one or two sentences. No fluff.

Return ONLY valid JSON matching this shape:
{
  "companyOverview": string,
  "techStack": string[],
  "culture": string[],
  "whyThisRole": string,
  "yourEdge": string[],
  "gapsToAddress": string[],
  "smartQuestions": string[],
  "interviewPrep": string[],
  "sources": string[]
}`

  const userPrompt = `COMPANY RESEARCH (from their website):
${JSON.stringify(companyResearch)}

JOB POSTING:
Title: ${job.title}
Company: ${job.company}
Description: ${job.about_role ?? 'Not provided'}
Matched skills (already computed): ${job.matched_skills.join(', ')}
Missing skills (already computed): ${job.missing_skills.join(', ')}

CANDIDATE PROFILE:
Current title: ${profile.current_title ?? 'Not specified'}
Experience: ${profile.years_experience ?? 'Not specified'} years, level ${profile.experience_level ?? 'Not specified'}
Skills: ${profile.skills.join(', ')}
Work history: ${JSON.stringify(profile.work_experience)}`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      temperature: 0.4,
      max_tokens: 800,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    })

    const content = response.choices[0].message.content
    if (!content) {
      return fallback
    }

    let parsedJson: unknown
    try {
      parsedJson = JSON.parse(content)
    } catch {
      return fallback
    }

    const parsed = dossierSchema.safeParse(parsedJson)
    if (!parsed.success) {
      return fallback
    }

    return {
      companyOverview: parsed.data.companyOverview,
      techStack: parsed.data.techStack,
      culture: parsed.data.culture,
      whyThisRole: parsed.data.whyThisRole,
      yourEdge: parsed.data.yourEdge,
      gapsToAddress: parsed.data.gapsToAddress,
      smartQuestions: parsed.data.smartQuestions,
      interviewPrep: parsed.data.interviewPrep,
      sources: parsed.data.sources,
    }
  } catch (error) {
    console.error('[agent/research] synthesis request failed:', error)
    return fallback
  }
}

export async function POST(req: NextRequest) {
  const insforge = await createInsforgeServer()

  const { data: userData, error: authError } = await insforge.auth.getCurrentUser()
  if (authError || !userData?.user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const user = userData.user

  const { jobId } = (await req.json()) as { jobId?: string }
  if (!jobId?.trim()) {
    return NextResponse.json({ error: 'jobId is required' }, { status: 400 })
  }

  const { data: jobs, error: jobError } = await insforge.database
    .from('jobs')
    .select('*')
    .eq('id', jobId.trim())
    .eq('user_id', user.id)

  if (jobError) {
    return NextResponse.json({ error: 'Failed to fetch job' }, { status: 500 })
  }

  const job = jobs?.[0] as Job | undefined
  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 })
  }

  const { data: profiles, error: profileError } = await insforge.database
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError || !profiles) {
    return NextResponse.json(
      { error: 'Complete your profile before researching a company.' },
      { status: 400 },
    )
  }

  const profile = profiles as Profile

  let homepageData: z.infer<typeof homepageSchema> | null = null
  const subPageData: z.infer<typeof subPageSchema>[] = []
  const sources: string[] = []
  try {
    const homepageUrl = await deriveHomepageUrl(job)
    sources.push(homepageUrl)

    const session = await createBrowserbaseSession()
    const stagehand = createStagehand(session.id)

    try {
      await stagehand.init()
      const page = stagehand.context.activePage()
      if (!page) {
        throw new Error('Stagehand did not open an active page')
      }

      await page.goto(homepageUrl, { waitUntil: 'domcontentloaded' })

      homepageData = await stagehand.extract(
        "This is a company's homepage. Capture what the company actually does, who it's for, and any concrete signals (funding, customers, scale, mission, recent launches). Then find the internal links most worth visiting to research them as an employer.",
        homepageSchema,
        { page },
      )

      if (homepageData?.oneLiner || homepageData?.productSummary) {
        const subPageLinks = selectSubPageLinks(
          homepageData.pageLinks ?? [],
          homepageUrl,
        )

        for (const link of subPageLinks) {
          try {
            await page.goto(link.url, { waitUntil: 'domcontentloaded' })
            const data = await stagehand.extract(
              'Extract substance that helps a candidate understand this company before applying: what they do, their values and how they work, the specific technologies and tools they use, notable projects or customers, and how the team operates. Ignore nav, footers, cookie banners, and generic marketing copy.',
              subPageSchema,
              { page },
            )
            subPageData.push(data)
            sources.push(link.url)
          } catch (err) {
            console.error(
              `[agent/research] sub-page extraction failed for ${link.url}:`,
              err,
            )
          }
        }
      }
    } finally {
      await stagehand.close()
    }
  } catch (err) {
    console.error('[agent/research] browser session failed:', err)
  }

  const companyResearch = {
    homepage: homepageData,
    subPages: subPageData,
    sources,
  }

  try {
    const dossier = await synthesizeCompanyResearch(companyResearch, job, profile)

    const { error: updateError } = await insforge.database
      .from('jobs')
      .update({ company_research: dossier })
      .eq('id', job.id)
      .eq('user_id', user.id)

    if (updateError) {
      console.error('[agent/research] failed to save dossier:', updateError)
      return NextResponse.json(
        { error: 'Failed to save research. Please try again.' },
        { status: 500 },
      )
    }

    await insforge.database.from('agent_logs').insert([
      {
        user_id: user.id,
        run_id: null,
        job_id: job.id,
        message: `Researched ${job.company}`,
        level: 'success',
        created_at: new Date().toISOString(),
      },
    ])

    return NextResponse.json({ research: dossier })
  } catch (err) {
    console.error('[agent/research] synthesis failed:', err)
    return NextResponse.json(
      { error: 'Research failed. Please try again.' },
      { status: 500 },
    )
  }
}
