import { NextResponse } from 'next/server'
import { getConfiguredTelosDir, getTelosContext, telosChatConfigured } from '@/lib/telos-data'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const message = typeof body?.message === 'string' ? body.message.trim() : ''
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }
    if (!getConfiguredTelosDir()) {
      return NextResponse.json({ error: 'TELOS_DIR must be configured as an absolute path' }, { status: 503 })
    }
    if (!telosChatConfigured()) {
      return NextResponse.json(
        { error: 'Chat is disabled. Configure TELOS_CHAT_ENDPOINT and explicitly set TELOS_CHAT_INCLUDE_CONTEXT=true.' },
        { status: 503 },
      )
    }

    const endpoint = process.env.TELOS_CHAT_ENDPOINT!.trim()
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    const token = process.env.TELOS_CHAT_BEARER_TOKEN?.trim()
    if (token) headers.Authorization = `Bearer ${token}`

    const upstream = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        message,
        context: getTelosContext(),
        instructions: 'Answer from the supplied TELOS context. Cite the relevant filename or section and state when evidence is absent.',
      }),
      signal: AbortSignal.timeout(60_000),
    })

    const payload = await upstream.json().catch(() => null)
    if (!upstream.ok) {
      console.error('TELOS chat adapter rejected the request:', upstream.status)
      return NextResponse.json({ error: 'Configured chat adapter rejected the request' }, { status: 502 })
    }
    if (!payload || typeof payload.response !== 'string' || !payload.response.trim()) {
      return NextResponse.json(
        { error: 'Configured chat adapter must return JSON with a non-empty response string' },
        { status: 502 },
      )
    }
    return NextResponse.json({ response: payload.response.trim() })
  } catch (error) {
    console.error('Error in TELOS chat API:', error)
    return NextResponse.json({ error: 'Failed to process request through the configured chat adapter' }, { status: 500 })
  }
}
