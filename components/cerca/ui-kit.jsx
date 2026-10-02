'use client'

import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { AlertCircle, ChevronRight, Search } from 'lucide-react'

/* ---------------- Status label (Lost / Found / Reunited) ----------------
   Status is never communicated by colour alone: each has an icon + label. */
const STATUS = {
  lost: { label: 'Lost', dot: '!', className: 'bg-lost-soft text-lost border-lost/25' },
  found: { label: 'Found', dot: '\u2713', className: 'bg-found-soft text-found border-found/25' },
  reunited: { label: 'Reunited', dot: '\u2665', className: 'bg-secondary text-secondary-foreground border-border' },
}

export function StatusBadge({ status = 'lost', className, size = 'md' }) {
  const s = STATUS[status] || STATUS.lost
  return (
    <span
      data-testid={`status-badge-${status}`}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-semibold uppercase tracking-wide',
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-[11px]',
        s.className,
        className
      )}
    >
      <span className="grid h-4 w-4 place-items-center rounded-full bg-current/10 text-[10px] leading-none">{s.dot}</span>
      {s.label}
    </span>
  )
}

/* ---------------- Chip (filter pill) ---------------- */
export function Chip({ active = false, children, className, icon: Icon, ...props }) {
  return (
    <button
      type="button"
      data-active={active}
      className={cn(
        'press inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        active
          ? 'border-primary bg-primary text-primary-foreground shadow-soft'
          : 'border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground',
        className
      )}
      {...props}
    >
      {Icon ? <Icon className="h-4 w-4" /> : null}
      {children}
    </button>
  )
}

/* ---------------- Page header ---------------- */
export function PageHeader({ eyebrow, title, subtitle, action, className }) {
  return (
    <div className={cn('mb-5 flex flex-wrap items-end justify-between gap-3', className)}>
      <div className="min-w-0">
        {eyebrow ? (
          <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-primary/70">{eyebrow}</p>
        ) : null}
        <h1 className="text-2xl font-extrabold leading-tight sm:text-3xl">{title}</h1>
        {subtitle ? <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  )
}

/* ---------------- Section header ---------------- */
export function SectionHeader({ title, subtitle, href, actionLabel = 'See all' }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div>
        <h2 className="text-lg font-bold leading-snug">{title}</h2>
        {subtitle ? <p className="text-xs text-muted-foreground">{subtitle}</p> : null}
      </div>
      {href ? (
        <a href={href} className="press inline-flex items-center text-sm font-semibold text-primary">
          {actionLabel} <ChevronRight className="h-4 w-4" />
        </a>
      ) : null}
    </div>
  )
}

/* ---------------- Empty state ---------------- */
export function EmptyState({ icon: Icon = Search, title, description, action, className }) {
  return (
    <Card className={cn('flex flex-col items-center gap-3 rounded-2xl border-dashed bg-card/60 px-6 py-10 text-center shadow-none', className)}>
      <span className="grid h-12 w-12 place-items-center rounded-full bg-secondary text-secondary-foreground">
        <Icon className="h-6 w-6" />
      </span>
      <div>
        <p className="font-semibold">{title}</p>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {action}
    </Card>
  )
}

/* ---------------- Placeholder block for upcoming feature modules ---------------- */
export function ModuleCard({ icon: Icon = AlertCircle, title, description, level, className }) {
  return (
    <Card className={cn('group rounded-2xl border-border bg-card p-5 shadow-soft transition-shadow hover:shadow-lift', className)}>
      <div className="flex items-start gap-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-secondary text-secondary-foreground">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold leading-snug">{title}</h3>
            {level ? (
              <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {level}
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
        </div>
      </div>
    </Card>
  )
}

/* ---------------- Skeleton-style content placeholder ---------------- */
export function PlaceholderRows({ rows = 3, className }) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft">
          <div className="h-14 w-14 shrink-0 animate-pulse-soft rounded-xl bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-1/3 animate-pulse-soft rounded-full bg-muted" />
            <div className="h-3 w-2/3 animate-pulse-soft rounded-full bg-muted/70" />
          </div>
        </div>
      ))}
    </div>
  )
}
