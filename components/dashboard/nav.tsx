'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Package,
  Bell,
  CreditCard,
  LogOut,
  Menu,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Дашборд', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Конкуренты', href: '/competitors', icon: Users },
  { name: 'Продукты', href: '/products', icon: Package },
  { name: 'Алерты', href: '/alerts', icon: Bell },
  { name: 'Подписка', href: '/subscription', icon: CreditCard },
]

export function Nav() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="flex h-16 items-center justify-between border-b px-6">
      <div className="flex items-center space-x-8">
        <Link href="/dashboard" className="text-xl font-bold">
          Price Tracker
        </Link>
        <div className="hidden md:flex space-x-1">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  pathname === item.href
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            )}
          )}
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Меню</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <DropdownMenuItem key={item.href} asChild>
                <Link href={item.href} className="flex items-center">
                  <Icon className="mr-2 h-4 w-4" />
                  {item.name}
                </Link>
              </DropdownMenuItem>
            )
          })}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Выйти
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  )
}
