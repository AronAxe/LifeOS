import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { getConfiguredTelosDir, telosWritesEnabled } from '@/lib/telos-data'

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024

export async function POST(request: Request) {
  try {
    if (!telosWritesEnabled()) {
      return NextResponse.json(
        { error: 'TELOS writes are disabled. Set TELOS_ALLOW_WRITES=true only after approving dashboard mutations.' },
        { status: 403 },
      )
    }
    const root = getConfiguredTelosDir()
    if (!root || !fs.existsSync(root)) {
      return NextResponse.json({ error: 'TELOS_DIR must name an existing directory' }, { status: 503 })
    }
    const rootStats = fs.lstatSync(root)
    if (!rootStats.isDirectory() || rootStats.isSymbolicLink()) {
      return NextResponse.json({ error: 'TELOS_DIR must name a regular directory, not a symlink' }, { status: 503 })
    }

    const formData = await request.formData()
    const file = formData.get('file')
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const fileName = file.name
    if (path.basename(fileName) !== fileName || fileName.startsWith('.') || !/\.(?:md|csv)$/i.test(fileName)) {
      return NextResponse.json({ error: 'Only simple .md and .csv filenames are allowed' }, { status: 400 })
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: 'File exceeds the 5 MiB dashboard limit' }, { status: 413 })
    }

    const isCSV = fileName.toLowerCase().endsWith('.csv')
    const destinationDir = isCSV ? path.join(root, 'data') : root
    if (!fs.existsSync(destinationDir)) fs.mkdirSync(destinationDir)
    const destinationStats = fs.lstatSync(destinationDir)
    if (!destinationStats.isDirectory() || destinationStats.isSymbolicLink()) {
      return NextResponse.json({ error: 'Destination is not a regular directory' }, { status: 400 })
    }

    const savePath = path.join(destinationDir, fileName)
    if (fs.existsSync(savePath)) {
      return NextResponse.json({ error: `File ${fileName} already exists; rename it or use the editor.` }, { status: 409 })
    }
    fs.writeFileSync(savePath, Buffer.from(await file.arrayBuffer()), { flag: 'wx' })

    const relativeName = isCSV ? `data/${fileName}` : fileName
    const updatesPath = path.join(root, 'updates.md')
    if (fs.existsSync(updatesPath)) {
      const updatesStats = fs.lstatSync(updatesPath)
      if (updatesStats.isFile() && !updatesStats.isSymbolicLink()) {
        fs.appendFileSync(
          updatesPath,
          `\n## ${new Date().toISOString()}\n\n- **Action:** File uploaded via dashboard\n- **File:** ${relativeName}\n`,
        )
      }
    }

    return NextResponse.json({ success: true, message: `${relativeName} uploaded`, filename: relativeName })
  } catch (error) {
    console.error('Error in TELOS upload API:', error)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}
