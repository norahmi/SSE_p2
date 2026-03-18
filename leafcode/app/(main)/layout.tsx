import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import Navbar from '@/components/ui/Navbar'


export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  return (
    <>
      <Navbar session={session} />
      {children}
    </>
  )
}