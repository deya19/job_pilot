import { redirect } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { JobDetailsPage } from '@/components/find-jobs/JobDetailsPage'
import { createInsforgeServer } from '@/lib/insforge-server'
import type { Job } from '@/types'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function JobDetailPage({ params }: PageProps) {
  const { id } = await params
  const insforge = await createInsforgeServer()

  const { data: userData, error: authError } = await insforge.auth.getCurrentUser()

  if (authError || !userData?.user) {
    redirect('/login')
  }

  const { data: jobs } = await insforge.database
    .from('jobs')
    .select('*')
    .eq('id', id)
    .eq('user_id', userData.user.id)

  const job: Job | null = jobs?.[0] ?? null

  if (!job) {
    redirect('/find-jobs')
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <JobDetailsPage job={job} />
      <Footer />
    </div>
  )
}
