import fs from 'fs'
import path from 'path'

export interface TelosFile {
  name: string
  filename: string
  content: string
  type: 'markdown' | 'csv'
}

const CORE_FILES = ['TELOS', 'MISSION', 'BELIEFS', 'WISDOM', 'GOALS', 'PROJECTS']

/** Resolve the principal-supplied source. No personal/default path is inferred. */
export function getConfiguredTelosDir(): string | null {
  const configured = process.env.TELOS_DIR?.trim()
  if (!configured || !path.isAbsolute(configured)) return null
  return path.resolve(configured)
}

export function telosWritesEnabled(): boolean {
  return process.env.TELOS_ALLOW_WRITES?.trim().toLowerCase() === 'true'
}

export function telosChatConfigured(): boolean {
  return Boolean(process.env.TELOS_CHAT_ENDPOINT?.trim()) &&
    process.env.TELOS_CHAT_INCLUDE_CONTEXT?.trim().toLowerCase() === 'true'
}

/** Resolve only the canonical filenames the dashboard itself enumerates. */
export function resolveTelosFilePath(filename: string): string | null {
  const root = getConfiguredTelosDir()
  if (!root || filename.includes('\\')) return null

  if (/^[^/.][^/]*\.md$/i.test(filename)) return path.join(root, filename)
  if (/^data\/[^/.][^/]*\.csv$/i.test(filename)) {
    return path.join(root, 'data', filename.slice('data/'.length))
  }
  return null
}

function readRegularFile(filePath: string): string | null {
  try {
    const stats = fs.lstatSync(filePath)
    if (!stats.isFile() || stats.isSymbolicLink()) return null
    return fs.readFileSync(filePath, 'utf-8')
  } catch {
    return null
  }
}

export function getAllTelosData(): TelosFile[] {
  const root = getConfiguredTelosDir()
  if (!root) return []

  const files: TelosFile[] = []
  try {
    const rootStats = fs.lstatSync(root)
    if (!rootStats.isDirectory() || rootStats.isSymbolicLink()) return []

    for (const filename of fs.readdirSync(root)) {
      if (!/^[^/.][^/]*\.md$/i.test(filename)) continue
      const content = readRegularFile(path.join(root, filename))
      if (content === null) continue
      files.push({
        name: filename.replace(/\.md$/i, ''),
        filename,
        content,
        type: 'markdown',
      })
    }

    const dataDir = path.join(root, 'data')
    if (fs.existsSync(dataDir)) {
      const dataStats = fs.lstatSync(dataDir)
      if (dataStats.isDirectory() && !dataStats.isSymbolicLink()) {
        for (const filename of fs.readdirSync(dataDir)) {
          if (!/^[^/.][^/]*\.csv$/i.test(filename)) continue
          const content = readRegularFile(path.join(dataDir, filename))
          if (content === null) continue
          files.push({
            name: filename.replace(/\.csv$/i, ''),
            filename: `data/${filename}`,
            content,
            type: 'csv',
          })
        }
      }
    }
  } catch (error) {
    console.error('Error scanning configured TELOS directory:', error)
    return []
  }

  files.sort((a, b) => {
    const aCore = CORE_FILES.indexOf(a.name.toUpperCase())
    const bCore = CORE_FILES.indexOf(b.name.toUpperCase())
    if (aCore >= 0 && bCore < 0) return -1
    if (aCore < 0 && bCore >= 0) return 1
    if (aCore >= 0 && bCore >= 0) return aCore - bCore
    return a.name.localeCompare(b.name)
  })
  return files
}

export function getTelosContext(): string {
  const files = getAllTelosData()
  let context = '# Configured TELOS context\n\n'
  context += 'Use only the supplied files. If the answer is absent, say so.\n\n'
  for (const file of files) {
    context += `## ${file.name}\n\n${file.content}\n\n---\n\n`
  }
  return context
}

export function getTelosFileList(): string[] {
  return getAllTelosData().map((file) => file.filename)
}

export function getTelosFileCount(): number {
  return getAllTelosData().length
}
