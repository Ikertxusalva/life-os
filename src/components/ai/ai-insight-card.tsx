'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles, RefreshCw, Loader2 } from 'lucide-react'

export function AiInsightCard() {
  const [insight, setInsight] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const generateInsight = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/ai/insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await res.json()
      setInsight(data.insights ?? data.error ?? 'Sin insights disponibles')
    } catch {
      setInsight('Error al generar insights')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-center gap-2">
        <Sparkles className="h-4 w-4 text-indigo-400" />
        <CardTitle className="text-sm flex-1">Insights de IA</CardTitle>
        {insight && (
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={generateInsight} disabled={loading}>
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {!insight && !loading ? (
          <Button variant="outline" size="sm" onClick={generateInsight} className="w-full">
            Generar insights
          </Button>
        ) : loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="text-sm text-muted-foreground whitespace-pre-line">{insight}</div>
        )}
        <p className="text-[10px] text-muted-foreground mt-3">Powered by Gemini</p>
      </CardContent>
    </Card>
  )
}
