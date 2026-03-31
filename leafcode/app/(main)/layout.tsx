import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import Navbar from '@/components/ui/Navbar'


export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  const navbarSession = {
    user: {
      name: session?.user.name ?? '',
      email: session?.user.email ?? '',
      image: session?.user.image ?? `https://api.dicebear.com/8.x/bottts-neutral/svg?seed=${session?.user.id ?? 'guest'}`,
    }
  }

  return (
    <>
      <Navbar session={session && navbarSession} />
      {children}
    </>
  )
}