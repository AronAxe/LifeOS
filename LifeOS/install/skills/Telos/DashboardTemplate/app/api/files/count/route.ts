import { NextResponse } from 'next/server'
import {
  getConfiguredTelosDir,
  getTelosFileCount,
  getTelosFileList,
  telosChatConfigured,
  telosWritesEnabled,
} from '@/lib/telos-data'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    return NextResponse.json({
      configured: Boolean(getConfiguredTelosDir()),
      writesEnabled: telosWritesEnabled(),
      chatConfigured: telosChatConfigured(),
      count: getTelosFileCount(),
      files: getTelosFileList(),
    })
  } catch (error) {
    console.error('Error getting TELOS dashboard status:', error)
    return NextResponse.json({ error: 'Failed to get TELOS dashboard status' }, { status: 500 })
  }
}
