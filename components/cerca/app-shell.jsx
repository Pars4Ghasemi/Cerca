'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Map, Users, Store, User, Sparkles, Bell } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/', label: 'Home', icon: Home, id: 'home' },
  { href: '/map', label: 'Map', icon: Map, id: 'map' },
  { href: '/community', label: 'Community', icon: Users, id: 'community' },
  { href: '/services', label: 'Services', icon: Store, id: 'services' },
  { href: '/profile', label: 'Profile', icon: User, id: 'profile' },
]

function isActive(pathname, href) {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname?.startsWith(href + '/')
}

export function CercaLogo({ className }) {
  return (
    <span className={cn('flex items-center gap-2', className)}>
      <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground shadow-soft">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
          <circle cx="7" cy="7.5" r="2.1" />
          <circle cx="12" cy="5.8" r="2.1" />
          <circle cx="17" cy="7.5" r="2.1" />
          <path d="M12 10.2c3.2 0 5.6 2.3 5.6 4.9 0 2-1.6 3.4-3.7 3.4-1 0-1.5-.3-1.9-.3s-.9.3-1.9.3c-2.1 0-3.7-1.4-3.7-3.4 0-2.6 2.4-4.9 5.6-4.9Z" />
        </svg>
      </span>
      <span className="font-display text-xl font-extrabold tracking-tight text-foreground">Cerca</span>
    </span>
  )
}

export default function AppShell({ children }) {
  const pathname = usePathname() || '/'
  const aiActive = isActive(pathname, '/ai')

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" aria-label="Cerca home" className="press">
            <CercaLogo />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
            {NAV.map((item) => {
              const active = isActive(pathname, item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  data-testid={`nav-desktop-${item.id}`}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors',
                    active
                      ? 'bg-secondary text-secondary-foreground'
                      : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Button asChild size="sm" className="press hidden rounded-full lg:inline-flex">
              <Link href="/ai" data-testid="nav-desktop-ai">
                <Sparkles className="mr-1.5 h-4 w-4" /> Ask Cerca
              </Link>
            </Button>
            <Button variant="ghost" size="icon" className="press rounded-full text-muted-foreground" aria-label="Notifications">
              <Bell className="h-5 w-5" />
            </Button>
            <Link href="/profile" aria-label="Your profile" className="press">
              <Avatar className="h-9 w-9 border border-border">
                <AvatarImage src="" alt="Mia" />
                <AvatarFallback className="bg-accent text-xs font-semibold text-accent-foreground">MI</AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="mx-auto w-full max-w-6xl px-4 pb-32 pt-5 sm:px-6 lg:pb-16">{children}</main>

      {/* Floating Cerca AI button (mobile) */}
      <Link
        href="/ai"
        data-testid="nav-fab-ai"
        aria-label="Ask Cerca AI"
        className={cn(
          'press fixed bottom-[86px] right-3 z-40 grid h-14 w-14 place-items-center rounded-full shadow-lift lg:hidden',
          aiActive ? 'bg-foreground text-background' : 'bg-primary text-primary-foreground'
        )}
      >
        <Sparkles className="h-6 w-6" />
      </Link>

      {/* Mobile bottom navigation */}
      <nav
        aria-label="Bottom navigation"
        className="safe-bottom fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md lg:hidden"
      >
        <ul className="mx-auto flex max-w-lg items-stretch justify-between px-1.5 py-1.5">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href)
            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  data-testid={`nav-mobile-${item.id}`}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex flex-col items-center gap-0.5 rounded-xl px-1 py-2 text-[11px] font-medium transition-colors',
                    active ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  <span
                    className={cn(
                      'grid h-8 w-12 place-items-center rounded-full transition-colors',
                      active && 'bg-secondary'
                    )}
                  >
                    <item.icon className={cn('h-5 w-5', active && 'stroke-[2.4]')} />
                  </span>
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
