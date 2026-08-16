import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import {
  getConfiguredTelosDir,
  resolveTelosFilePath,
  telosWritesEnabled,
} from '@/lib/telos-data'

const MAX_CONTENT_BYTES = 5 * 1024 * 1024

export async function POST(request: Request) {
  let temporaryPath: string | null = null
  try {
    if (!telosWritesEnabled()) {
      return NextResponse.json(
        { error: 'TELOS writes are disabled. Set TELOS_ALLOW_WRITES=true only after approving dashboard mutations.' },
        { status: 403 },
      )
    }
    const root = getConfiguredTelosDir()
    if (!root || !fs.existsSync(root) || !fs.lstatSync(root).isDirectory()) {
      return NextResponse.json({ error: 'TELOS_DIR must name an existing directory' }, { status: 503 })
    }

    const body = await request.json()
    const filename = typeof body?.filename === 'string' ? body.filename : ''
    const content = typeof body?.content === 'string' ? body.content : null
    if (!filename || content === null) {
      return NextResponse.json({ error: 'Filename and string content are required' }, { status: 400 })
    }
    if (Buffer.byteLength(content, 'utf-8') > MAX_CONTENT_BYTES) {
      return NextResponse.json({ error: 'File exceeds the 5 MiB dashboard limit' }, { status: 413 })
    }

    const filePath = resolveTelosFilePath(filename)
    if (!filePath || !fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'File is not an enumerated TELOS Markdown/CSV file' }, { status: 404 })
    }
    const targetStats = fs.lstatSync(filePath)
    if (!targetStats.isFile() || targetStats.isSymbolicLink()) {
      return NextResponse.json({ error: 'Refusing to edit a non-regular file' }, { status: 400 })
    }

    const backupPath = `${filePath}.bak`
    fs.copyFileSync(filePath, backupPath)
    temporaryPath = path.join(path.dirname(filePath), `.${path.basename(filePath)}.${process.pid}.${Date.now()}.tmp`)
    fs.writeFileSync(temporaryPath, content, { encoding: 'utf-8', flag: 'wx' })
    fs.renameSync(temporaryPath, filePath)
    temporaryPath = null

    const updatesPath = path.join(root, 'updates.md')
    if (fs.existsSync(updatesPath)) {
      const updatesStats = fs.lstatSync(updatesPath)
      if (updatesStats.isFile() && !updatesStats.isSymbolicLink()) {
        fs.appendFileSync(
          updatesPath,
          `\n## ${new Date().toISOString()}\n\n- **Action:** File edited via dashboard\n- **File:** ${filename}\n- **Backup:** ${path.basename(backupPath)}\n`,
        )
      }
    }

    return NextResponse.json({ success: true, message: `${filename} saved; previous content retained in ${path.basename(backupPath)}` })
  } catch (error) {
    if (temporaryPath && fs.existsSync(temporaryPath)) fs.rmSync(temporaryPath, { force: true })
    console.error('Error saving TELOS file:', error)
    return NextResponse.json({ error: 'Failed to save file' }, { status: 500 })
  }
}
