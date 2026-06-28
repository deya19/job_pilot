import { NextResponse } from 'next/server'
import { createInsforgeServer } from '@/lib/insforge-server'

export async function GET() {
  const insforge = await createInsforgeServer()

  const { data: userData, error: authError } = await insforge.auth.getCurrentUser()

  if (authError || !userData?.user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { data: jobs, error } = await insforge.database
    .from('jobs')
    .select('*')
    .eq('user_id', userData.user.id)
    .order('found_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 })
  }

  return NextResponse.json({ jobs: jobs ?? [] })
}
