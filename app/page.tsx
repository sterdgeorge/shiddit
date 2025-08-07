import { Suspense } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import Feed from '@/components/feed/Feed'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export const dynamic = 'force-dynamic'

export default function HomePage() {
  return (
    <MainLayout>
      <Suspense fallback={<LoadingSpinner />}>
        <Feed />
      </Suspense>
    </MainLayout>
  )
} 