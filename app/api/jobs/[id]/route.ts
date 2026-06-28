import { NextResponse } from 'next/server'
import { createInsforgeServer } from '@/lib/insforge-server'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const insforge = await createInsforgeServer()

  const { data: userData, error: authError } = await insforge.auth.getCurrentUser()

  if (authError || !userData?.user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { data: jobs, error } = await insforge.database
    .from('jobs')
    .select('*')
    .eq('id', id)
    .eq('user_id', userData.user.id)

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch job' }, { status: 500 })
  }

  const job = jobs?.[0] ?? null

  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 })
  }

  return NextResponse.json({ job })
}
