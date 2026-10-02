'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import Link from 'next/link'
import { formatDistanceToNowStrict } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { PageHeader, Chip, EmptyState, PlaceholderRows } from '@/components/cerca/ui-kit'
import { PET_IMAGES } from '@/lib/seed-data'
import { Heart, MessageCircle, Bookmark, PenLine, ChevronUp, ChevronRight, HelpCircle, ImagePlus, Loader2, Send, MessageSquarePlus } from 'lucide-react'

const CATEGORIES = ['Training', 'Nutrition', 'Behaviour', 'Health', 'Cats', 'Dogs', 'New Pet Owners']
const SAMPLE_PHOTOS = [PET_IMAGES.goldenRetriever, PET_IMAGES.gingerCat, PET_IMAGES.jackRussell, PET_IMAGES.greyCat]

const ago = (iso) => {
  try { return formatDistanceToNowStrict(new Date(iso), { addSuffix: true }) } catch { return 'just now' }
}

export default function CommunityPage() {
  const [tab, setTab] = useState('feed')
  const [posts, setPosts] = useState([])
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)

  const [composerOpen, setComposerOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const [draftPhoto, setDraftPhoto] = useState(null)
  const [posting, setPosting] = useState(false)
  const [composerError, setComposerError] = useState('')

  const [commentsFor, setCommentsFor] = useState(null)
  const [commentDraft, setCommentDraft] = useState('')

  const [askOpen, setAskOpen] = useState(false)
  const [ask, setAsk] = useState({ title: '', body: '', category: 'Training' })
  const [asking, setAsking] = useState(false)
  const [askError, setAskError] = useState('')
  const [category, setCategory] = useState('all')

  const load = useCallback(async () => {
    try {
      const [p, q] = await Promise.all([
        fetch('/api/posts').then((r) => r.json()),
        fetch('/api/questions').then((r) => r.json()),
      ])
      setPosts((p.posts || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
      setQuestions((q.questions || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const patchPost = (post) => setPosts((prev) => prev.map((p) => (p.id === post.id ? post : p)))

  const toggle = async (post, kind) => {
    // optimistic
    const optimistic = kind === 'like'
      ? { ...post, liked: !post.liked, likes: Math.max(0, post.likes + (post.liked ? -1 : 1)) }
      : { ...post, saved: !post.saved }
    patchPost(optimistic)
    try {
      const res = await fetch(`/api/posts/${post.id}/${kind}`, { method: 'POST' })
      const data = await res.json()
      if (data.post) patchPost(data.post)
      if (kind === 'save') toast(optimistic.saved ? 'Saved to your profile' : 'Removed from saved')
    } catch {
      patchPost(post)
      toast.error('That did not work \u2014 check your connection')
    }
  }

  const publishPost = async () => {
    if (draft.trim().length < 3) return setComposerError('Write a little more before posting.')
    setPosting(true)
    setComposerError('')
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: draft, photo: draftPhoto }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not publish')
      setPosts((prev) => [data.post, ...prev])
      toast.success('Your post is live in the feed')
      setDraft('')
      setDraftPhoto(null)
      setComposerOpen(false)
      setTab('feed')
    } catch (e) {
      setComposerError(e.message)
    } finally {
      setPosting(false)
    }
  }

  const sendComment = async () => {
    if (!commentsFor || commentDraft.trim().length < 2) return
    const id = commentsFor.id
    try {
      const res = await fetch(`/api/posts/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: commentDraft }),
      })
      const data = await res.json()
      if (data.post) {
        patchPost(data.post)
        setCommentsFor(data.post)
      }
      setCommentDraft('')
    } catch {}
  }

  const submitQuestion = async () => {
    if (ask.title.trim().length < 10) return setAskError('Give your question a clear title (at least 10 characters).')
    setAsking(true)
    setAskError('')
    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ask),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not post the question')
      setQuestions((prev) => [data.question, ...prev])
      toast.success('Question posted \u2014 the community can answer now')
      setAsk({ title: '', body: '', category: 'Training' })
      setAskOpen(false)
      setTab('questions')
      setCategory('all')
    } catch (e) {
      setAskError(e.message)
    } finally {
      setAsking(false)
    }
  }

  const voteQuestion = async (q) => {
    const optimistic = { ...q, voted: !q.voted, votes: Math.max(0, q.votes + (q.voted ? -1 : 1)) }
    setQuestions((prev) => prev.map((x) => (x.id === q.id ? optimistic : x)))
    try {
      const res = await fetch(`/api/questions/${q.id}/vote`, { method: 'POST' })
      const data = await res.json()
      if (data.question) setQuestions((prev) => prev.map((x) => (x.id === q.id ? data.question : x)))
    } catch {
      setQuestions((prev) => prev.map((x) => (x.id === q.id ? q : x)))
    }
  }

  const visibleQuestions = useMemo(
    () => (category === 'all' ? questions : questions.filter((q) => q.category === category)),
    [questions, category]
  )

  return (
    <div className="animate-fade-up space-y-5">
      <PageHeader
        eyebrow="Community"
        title="Your neighbourhood pet people"
        subtitle="Share moments, ask questions, and learn from other owners in Berlin."
        action={
          tab === 'feed' ? (
            <Button className="press rounded-full" onClick={() => setComposerOpen(true)} data-testid="open-composer">
              <PenLine className="mr-2 h-4 w-4" /> New post
            </Button>
          ) : (
            <Button className="press rounded-full" onClick={() => setAskOpen(true)} data-testid="open-ask">
              <MessageSquarePlus className="mr-2 h-4 w-4" /> Ask a question
            </Button>
          )
        }
      />

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="grid w-full max-w-sm grid-cols-2 rounded-full bg-muted p-1">
          <TabsTrigger value="feed" className="rounded-full data-[state=active]:bg-card" data-testid="tab-feed">Feed</TabsTrigger>
          <TabsTrigger value="questions" className="rounded-full data-[state=active]:bg-card" data-testid="tab-questions">Questions</TabsTrigger>
        </TabsList>

        {/* ---------------- FEED ---------------- */}
        <TabsContent value="feed" className="mt-5 space-y-4">
          <button onClick={() => setComposerOpen(true)} className="press w-full text-left" data-testid="composer-trigger">
            <Card className="flex items-center gap-3 rounded-2xl border-border p-3.5 shadow-soft">
              <Avatar className="h-10 w-10 border border-border">
                <AvatarFallback className="bg-accent text-xs font-semibold text-accent-foreground">MI</AvatarFallback>
              </Avatar>
              <span className="flex-1 truncate text-sm text-muted-foreground">What&apos;s new with Milo today?</span>
              <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground"><PenLine className="h-4 w-4" /></span>
            </Card>
          </button>

          {loading ? (
            <PlaceholderRows rows={3} />
          ) : posts.length === 0 ? (
            <EmptyState title="No posts yet" description="Be the first to share something with your neighbourhood." />
          ) : (
            posts.map((p) => (
              <Card key={p.id} className="overflow-hidden rounded-2xl border-border shadow-soft" data-testid={`post-${p.id}`}>
                <div className="flex items-center gap-3 px-4 pt-4">
                  <Avatar className="h-10 w-10 border border-border">
                    <AvatarFallback className="bg-accent text-xs font-semibold text-accent-foreground">{p.initials}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold leading-tight">{p.author} <span className="font-normal text-muted-foreground">with {p.petName}</span></p>
                    <p className="truncate text-xs text-muted-foreground">{p.neighborhood} · {ago(p.createdAt)}</p>
                  </div>
                </div>
                <p className="px-4 pt-3 text-sm leading-relaxed">{p.text}</p>
                {p.photo ? (
                  <div className="mt-3 h-56 w-full overflow-hidden bg-muted sm:h-72">
                    <img src={p.photo} alt="" className="h-full w-full object-cover" loading="lazy" />
                  </div>
                ) : null}
                <div className="flex items-center gap-1 px-2 py-2">
                  <button
                    onClick={() => toggle(p, 'like')}
                    data-testid={`like-${p.id}`}
                    className={`press flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold ${p.liked ? 'text-lost' : 'text-muted-foreground hover:bg-muted'}`}
                  >
                    <Heart className={`h-4 w-4 ${p.liked ? 'fill-current' : ''}`} /> {p.likes}
                  </button>
                  <button
                    onClick={() => { setCommentsFor(p); setCommentDraft('') }}
                    data-testid={`comment-${p.id}`}
                    className="press flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted"
                  >
                    <MessageCircle className="h-4 w-4" /> {p.comments}
                  </button>
                  <button
                    onClick={() => toggle(p, 'save')}
                    data-testid={`save-${p.id}`}
                    className={`press ml-auto flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold ${p.saved ? 'text-primary' : 'text-muted-foreground hover:bg-muted'}`}
                  >
                    <Bookmark className={`h-4 w-4 ${p.saved ? 'fill-current' : ''}`} /> {p.saved ? 'Saved' : 'Save'}
                  </button>
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        {/* ---------------- QUESTIONS ---------------- */}
        <TabsContent value="questions" className="mt-5 space-y-4">
          <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 py-0.5">
            <Chip active={category === 'all'} onClick={() => setCategory('all')} data-testid="cat-all">All</Chip>
            {CATEGORIES.map((c) => (
              <Chip key={c} active={category === c} onClick={() => setCategory(c)} data-testid={`cat-${c}`}>{c}</Chip>
            ))}
          </div>

          {loading ? (
            <PlaceholderRows rows={3} />
          ) : visibleQuestions.length === 0 ? (
            <EmptyState
              icon={HelpCircle}
              title="No questions in this category yet"
              description="Ask the first one — someone nearby has probably been through it."
              action={<Button className="press rounded-full" onClick={() => setAskOpen(true)}>Ask a question</Button>}
            />
          ) : (
            visibleQuestions.map((q) => (
              <Card key={q.id} className="flex gap-3 rounded-2xl border-border p-4 shadow-soft" data-testid={`question-${q.id}`}>
                <button
                  onClick={() => voteQuestion(q)}
                  data-testid={`vote-question-${q.id}`}
                  className={`press flex h-fit shrink-0 flex-col items-center gap-0.5 rounded-xl border px-2.5 py-2 text-xs font-bold ${
                    q.voted ? 'border-primary bg-secondary text-primary' : 'border-border bg-card text-muted-foreground'
                  }`}
                >
                  <ChevronUp className="h-4 w-4" />
                  <span data-testid={`votes-${q.id}`}>{q.votes}</span>
                </button>
                <Link href={`/community/questions/${q.id}`} className="press min-w-0 flex-1" data-testid={`open-question-${q.id}`}>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-primary/70">{q.category}</p>
                  <h3 className="mt-0.5 font-bold leading-snug">{q.title}</h3>
                  {q.body ? <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{q.body}</p> : null}
                  <p className="mt-2 flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground">
                    <span>{(q.answers || []).length} answer{(q.answers || []).length === 1 ? '' : 's'}</span>
                    <span>· {q.author}</span>
                    <span>· {ago(q.createdAt)}</span>
                  </p>
                </Link>
                <ChevronRight className="h-5 w-5 shrink-0 self-center text-muted-foreground" />
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* composer */}
      <Dialog open={composerOpen} onOpenChange={setComposerOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Share with your community</DialogTitle>
            <DialogDescription>Posts are visible to pet owners in Berlin.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Textarea
              rows={5}
              className="rounded-2xl"
              placeholder="What&apos;s new with Milo today?"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              data-testid="composer-text"
            />
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground"><ImagePlus className="h-4 w-4" /> Add a photo (optional)</p>
              <div className="flex gap-2">
                {SAMPLE_PHOTOS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setDraftPhoto(draftPhoto === s ? null : s)}
                    data-testid="composer-photo"
                    className={`press h-14 w-14 overflow-hidden rounded-xl border-2 ${draftPhoto === s ? 'border-primary' : 'border-transparent'}`}
                  >
                    <img src={s} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
            {composerError ? <p className="rounded-xl bg-lost-soft px-3 py-2 text-sm font-medium text-lost">{composerError}</p> : null}
          </div>
          <DialogFooter>
            <Button variant="ghost" className="press rounded-full" onClick={() => setComposerOpen(false)}>Cancel</Button>
            <Button className="press rounded-full" onClick={publishPost} disabled={posting} data-testid="composer-publish">
              {posting ? <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Posting…</> : 'Post'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ask question */}
      <Dialog open={askOpen} onOpenChange={setAskOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Ask the community</DialogTitle>
            <DialogDescription>Clear, specific questions get the best answers.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="ask-title">Question</Label>
              <Input id="ask-title" className="rounded-xl" placeholder="e.g. How do I stop my dog barking at the door?" value={ask.title} onChange={(e) => setAsk({ ...ask, title: e.target.value })} data-testid="ask-title" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ask-body">Details (optional)</Label>
              <Textarea id="ask-body" rows={4} className="rounded-2xl" placeholder="Add context: age, breed, what you have already tried…" value={ask.body} onChange={(e) => setAsk({ ...ask, body: e.target.value })} data-testid="ask-body" />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <Chip key={c} active={ask.category === c} onClick={() => setAsk({ ...ask, category: c })}>{c}</Chip>
                ))}
              </div>
            </div>
            {askError ? <p className="rounded-xl bg-lost-soft px-3 py-2 text-sm font-medium text-lost" data-testid="ask-error">{askError}</p> : null}
          </div>
          <DialogFooter>
            <Button variant="ghost" className="press rounded-full" onClick={() => setAskOpen(false)}>Cancel</Button>
            <Button className="press rounded-full" onClick={submitQuestion} disabled={asking} data-testid="ask-submit">
              {asking ? <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Posting…</> : 'Post question'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* comments sheet */}
      <Drawer open={!!commentsFor} onOpenChange={(o) => !o && setCommentsFor(null)}>
        <DrawerContent className="max-h-[85vh]">
          <div className="mx-auto flex w-full max-w-lg flex-col overflow-hidden">
            <DrawerHeader className="text-left">
              <DrawerTitle>Comments</DrawerTitle>
            </DrawerHeader>
            <div className="max-h-[45vh] space-y-3 overflow-y-auto px-4" data-testid="comment-list">
              {(commentsFor?.commentList || []).length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">No comments yet — start the conversation.</p>
              ) : (
                commentsFor.commentList.map((c) => (
                  <div key={c.id} className="flex gap-3">
                    <Avatar className="h-9 w-9 border border-border">
                      <AvatarFallback className="bg-secondary text-[10px] font-semibold">{c.author.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 rounded-2xl bg-muted px-3.5 py-2.5">
                      <p className="text-xs font-bold">{c.author} <span className="font-normal text-muted-foreground">· {ago(c.createdAt)}</span></p>
                      <p className="text-sm leading-relaxed">{c.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="flex items-center gap-2 border-t border-border px-4 py-3 pb-6">
              <Input
                className="rounded-full"
                placeholder="Add a comment…"
                value={commentDraft}
                onChange={(e) => setCommentDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendComment()}
                data-testid="comment-input"
              />
              <Button size="icon" className="press shrink-0 rounded-full" onClick={sendComment} disabled={commentDraft.trim().length < 2} data-testid="comment-send" aria-label="Send comment">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
