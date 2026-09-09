import { createHash } from 'node:crypto'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const EXCLUDED_DIRS = new Set(['node_modules', '.git', '.ui-preview'])
const LARGE_FILE_BYTES = 5 * 1024 * 1024

export function walkFiles(root) {
  const out = []
  const stack = [root]
  while (stack.length) {
    const dir = stack.pop()
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (!EXCLUDED_DIRS.has(entry.name)) stack.push(join(dir, entry.name))
      } else if (entry.isFile()) {
        out.push(join(dir, entry.name))
      }
    }
  }
  return out
}

export function hashTree(root) {
  const map = {}
  for (const file of walkFiles(root)) {
    const rel = relative(root, file).split('\\').join('/')
    const size = statSync(file).size
    map[rel] =
      size > LARGE_FILE_BYTES
        ? 'size:' + size
        : 'sha256:' + createHash('sha256').update(readFileSync(file)).digest('hex')
  }
  return map
}
