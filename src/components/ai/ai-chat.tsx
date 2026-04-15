'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageCircle, Send, X, Loader2, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export function AiChat() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.response ?? data.error ?? 'Error desconocido' }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error de conexión' }])
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <Button size="lg" className="fixed bottom-24 right-6 h-12 w-12 rounded-full shadow-lg p-0 bg-indigo-600 hover:bg-indigo-700" onClick={() => setOpen(true)}>
        <MessageCircle className="h-5 w-5" />
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-6 right-6 w-[380px] h-[500px] flex flex-col shadow-2xl z-50">
      <CardHeader className="py-3 px-4 flex flex-row items-center gap-2 border-b bg-indigo-600/10">
        <Sparkles className="h-4 w-4 text-indigo-400" />
        <CardTitle className="text-sm flex-1">Chat con tus datos</CardTitle>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setOpen(false)}><X className="h-4 w-4" /></Button>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {messages.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">Pregúntame sobre tus hábitos</p>
          )}
          <div className="space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                <div className={cn('max-w-[80%] rounded-lg px-3 py-2 text-sm', msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-3 py-2"><Loader2 className="h-4 w-4 animate-spin" /></div>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="border-t p-3 flex gap-2">
          <Input value={input} onChange={e => setInput(e.target.value)} placeholder="¿Cómo van mis hábitos?" className="flex-1" onKeyDown={e => e.key === 'Enter' && sendMessage()} disabled={loading} />
          <Button size="sm" className="h-9 w-9 p-0" onClick={sendMessage} disabled={loading}><Send className="h-4 w-4" /></Button>
        </div>
        <p className="text-[10px] text-muted-foreground text-center pb-2">Powered by Gemini</p>
      </CardContent>
    </Card>
  )
}
