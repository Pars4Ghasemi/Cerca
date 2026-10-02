'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { PageHeader, SectionHeader, Chip, StatusBadge, EmptyState, ModuleCard, PlaceholderRows } from '@/components/cerca/ui-kit'
import { Bone, Bookmark, Dog } from 'lucide-react'

const SWATCHES = [
  { name: 'background', className: 'bg-background border' },
  { name: 'card', className: 'bg-card border' },
  { name: 'primary', className: 'bg-primary' },
  { name: 'secondary', className: 'bg-secondary' },
  { name: 'accent', className: 'bg-accent' },
  { name: 'muted', className: 'bg-muted' },
  { name: 'lost', className: 'bg-lost' },
  { name: 'found', className: 'bg-found' },
]

export default function DesignSystemPage() {
  const [chip, setChip] = useState('all')

  return (
    <div className="animate-fade-up space-y-9 pb-6">
      <PageHeader eyebrow="Foundation" title="Cerca design system" subtitle="Reusable building blocks: colour, type, buttons, cards, chips, tabs, avatars, badges, inputs, sheets and status labels." />

      <section>
        <SectionHeader title="Colour" subtitle="Warm off-white surfaces, deep muted green primary, coral for urgent Lost alerts" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {SWATCHES.map((s) => (
            <div key={s.name} className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
              <div className={`h-16 w-full ${s.className}`} />
              <p className="px-3 py-2 text-xs font-semibold text-muted-foreground">{s.name}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title="Typography" />
        <Card className="space-y-2 rounded-2xl p-5 shadow-soft">
          <h1 className="text-3xl font-extrabold">Display · Plus Jakarta Sans</h1>
          <h2 className="text-xl font-bold">Heading 2 · section titles</h2>
          <p className="text-sm leading-relaxed text-foreground">Body · Inter, comfortable reading size for feed and detail content.</p>
          <p className="text-xs text-muted-foreground">Caption · metadata, timestamps, neighbourhood labels</p>
        </Card>
      </section>

      <section>
        <SectionHeader title="Buttons" subtitle="default · hover · pressed (active) · disabled" />
        <Card className="flex flex-wrap gap-3 rounded-2xl p-5 shadow-soft">
          <Button className="press rounded-full">Primary</Button>
          <Button variant="secondary" className="press rounded-full">Secondary</Button>
          <Button variant="outline" className="press rounded-full">Outline</Button>
          <Button variant="ghost" className="press rounded-full">Ghost</Button>
          <Button variant="destructive" className="press rounded-full">Urgent</Button>
          <Button disabled className="rounded-full">Disabled</Button>
          <Button size="lg" className="press rounded-full"><Bone className="mr-2 h-4 w-4" /> With icon</Button>
        </Card>
      </section>

      <section>
        <SectionHeader title="Status labels" subtitle="Icon + text, never colour alone" />
        <Card className="flex flex-wrap items-center gap-3 rounded-2xl p-5 shadow-soft">
          <StatusBadge status="lost" />
          <StatusBadge status="found" />
          <StatusBadge status="reunited" />
          <Badge>Badge</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
        </Card>
      </section>

      <section>
        <SectionHeader title="Chips & tabs" />
        <Card className="space-y-4 rounded-2xl p-5 shadow-soft">
          <div className="flex flex-wrap gap-2">
            {['all', 'lost', 'found', 'dogs', 'cats'].map((c) => (
              <Chip key={c} active={chip === c} onClick={() => setChip(c)}>
                {c[0].toUpperCase() + c.slice(1)}
              </Chip>
            ))}
            <Chip disabled className="opacity-50">Disabled</Chip>
          </div>
          <Tabs defaultValue="one" className="w-full">
            <TabsList className="grid w-full max-w-xs grid-cols-2 rounded-full bg-muted p-1">
              <TabsTrigger value="one" className="rounded-full data-[state=active]:bg-card">Feed</TabsTrigger>
              <TabsTrigger value="two" className="rounded-full data-[state=active]:bg-card">Questions</TabsTrigger>
            </TabsList>
            <TabsContent value="one" className="pt-3 text-sm text-muted-foreground">Feed tab content</TabsContent>
            <TabsContent value="two" className="pt-3 text-sm text-muted-foreground">Questions tab content</TabsContent>
          </Tabs>
        </Card>
      </section>

      <section>
        <SectionHeader title="Avatars, inputs & overlays" />
        <Card className="space-y-4 rounded-2xl p-5 shadow-soft">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border border-border"><AvatarFallback className="bg-accent text-accent-foreground">MI</AvatarFallback></Avatar>
            <Avatar className="h-10 w-10 border border-border"><AvatarFallback className="bg-secondary">AN</AvatarFallback></Avatar>
            <Avatar className="h-8 w-8 border border-border"><AvatarFallback className="bg-muted text-xs">LU</AvatarFallback></Avatar>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="ds-name">Pet name</Label>
              <Input id="ds-name" placeholder="e.g. Milo" className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ds-note">Description</Label>
              <Textarea id="ds-note" placeholder="Where and when did you last see the pet?" className="rounded-xl" />
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Dialog>
              <DialogTrigger asChild><Button variant="outline" className="press rounded-full">Open modal</Button></DialogTrigger>
              <DialogContent className="rounded-2xl">
                <DialogHeader>
                  <DialogTitle>Contact the owner</DialogTitle>
                  <DialogDescription>Demo modal used for contact and confirmation flows.</DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
            <Drawer>
              <DrawerTrigger asChild><Button variant="outline" className="press rounded-full">Open bottom sheet</Button></DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Report details</DrawerTitle>
                  <DrawerDescription>Bottom sheet used for map marker details on mobile.</DrawerDescription>
                </DrawerHeader>
                <div className="px-4 pb-8"><PlaceholderRows rows={1} /></div>
              </DrawerContent>
            </Drawer>
          </div>
        </Card>
      </section>

      <section>
        <SectionHeader title="Cards, empty & loading states" />
        <div className="grid gap-4 sm:grid-cols-2">
          <ModuleCard icon={Dog} title="Module card" level="Level X" description="Used for feature modules and shortcuts across the app." />
          <EmptyState icon={Bookmark} title="Nothing here yet" description="Polished empty state with icon, title and guidance." />
        </div>
        <div className="mt-4"><PlaceholderRows rows={2} /></div>
      </section>
    </div>
  )
}
