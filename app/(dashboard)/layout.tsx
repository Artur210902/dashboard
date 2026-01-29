import { Nav } from '@/components/dashboard/nav'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="container mx-auto py-6">{children}</main>
    </div>
  )
}
