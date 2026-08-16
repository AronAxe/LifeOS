import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import {
  getAllTelosData,
  getConfiguredTelosDir,
  getTelosContext,
  resolveTelosFilePath,
  telosChatConfigured,
  telosWritesEnabled,
} from '../LifeOS/install/skills/Telos/DashboardTemplate/lib/telos-data'

let root = ''
const saved = {
  TELOS_DIR: process.env.TELOS_DIR,
  TELOS_ALLOW_WRITES: process.env.TELOS_ALLOW_WRITES,
  TELOS_CHAT_ENDPOINT: process.env.TELOS_CHAT_ENDPOINT,
  TELOS_CHAT_INCLUDE_CONTEXT: process.env.TELOS_CHAT_INCLUDE_CONTEXT,
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'halos-telos-dashboard-'))
  delete process.env.TELOS_DIR
  delete process.env.TELOS_ALLOW_WRITES
  delete process.env.TELOS_CHAT_ENDPOINT
  delete process.env.TELOS_CHAT_INCLUDE_CONTEXT
})

afterEach(() => {
  rmSync(root, { recursive: true, force: true })
  for (const [key, value] of Object.entries(saved)) {
    if (value === undefined) delete process.env[key]
    else process.env[key] = value
  }
})

describe('portable TELOS dashboard data boundary', () => {
  test('has no inferred personal source and remains read-only by default', () => {
    expect(getConfiguredTelosDir()).toBeNull()
    expect(getAllTelosData()).toEqual([])
    expect(telosWritesEnabled()).toBe(false)
    expect(telosChatConfigured()).toBe(false)
  })

  test('inventories configured Markdown and data CSV files', () => {
    process.env.TELOS_DIR = root
    writeFileSync(join(root, 'GOALS.md'), '# Goals\nBuild carefully.')
    writeFileSync(join(root, '.private.md'), 'ignored')
    mkdirSync(join(root, 'data'))
    writeFileSync(join(root, 'data', 'metrics.csv'), 'name,value\nquality,1')

    expect(getConfiguredTelosDir()).toBe(root)
    expect(getAllTelosData().map((file) => file.filename)).toEqual(['GOALS.md', 'data/metrics.csv'])
    expect(getTelosContext()).toContain('Build carefully.')
  })

  test('resolves only enumerated filename shapes inside the configured root', () => {
    process.env.TELOS_DIR = root
    expect(resolveTelosFilePath('MISSION.md')).toBe(join(root, 'MISSION.md'))
    expect(resolveTelosFilePath('data/metrics.csv')).toBe(join(root, 'data', 'metrics.csv'))
    expect(resolveTelosFilePath('../secret.md')).toBeNull()
    expect(resolveTelosFilePath('data/../secret.csv')).toBeNull()
    expect(resolveTelosFilePath('nested/file.md')).toBeNull()
    expect(resolveTelosFilePath('script.ts')).toBeNull()
  })

  test('requires separate explicit gates for writes and context-bearing chat', () => {
    process.env.TELOS_DIR = root
    process.env.TELOS_ALLOW_WRITES = 'true'
    process.env.TELOS_CHAT_ENDPOINT = 'http://127.0.0.1:9999/chat'
    expect(telosWritesEnabled()).toBe(true)
    expect(telosChatConfigured()).toBe(false)
    process.env.TELOS_CHAT_INCLUDE_CONTEXT = 'true'
    expect(telosChatConfigured()).toBe(true)
  })
})
