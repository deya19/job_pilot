import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { FindJobsPage } from '@/components/find-jobs/FindJobsPage'

export default function FindJobs() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <FindJobsPage />
      <Footer />
    </div>
  )
}
