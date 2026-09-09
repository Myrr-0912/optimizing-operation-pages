#!/usr/bin/env node
// 校验预览阶段没有修改真实项目：对比当前文件树与基线快照。
// 唯一允许的差异：.gitignore（追加 .ui-preview/ 行）。任何其他新增/修改/删除都是违规。
import { existsSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { hashTree } from './lib.mjs'

const root = resolve(process.argv[2] || '.')
const baselinePath = join(root, '.ui-preview', 'analysis', 'baseline-hashes.json')
if (!existsSync(baselinePath)) {
  console.error('缺少基线快照 .ui-preview/analysis/baseline-hashes.json，请先运行 detect-project.mjs。')
  process.exit(1)
}

const baseline = JSON.parse(readFileSync(baselinePath, 'utf8'))
const current = hashTree(root)
const ALLOWED = new Set(['.gitignore'])

const added = []
const modified = []
const deleted = []

for (const [file, hash] of Object.entries(current)) {
  if (!(file in baseline)) {
    if (!ALLOWED.has(file)) added.push(file)
  } else if (baseline[file] !== hash && !ALLOWED.has(file)) {
    modified.push(file)
  }
}
for (const file of Object.keys(baseline)) {
  if (!(file in current)) deleted.push(file)
}

const violations = added.length + modified.length + deleted.length
if (violations > 0) {
  console.error('❌ 隔离校验失败：预览阶段修改了真实项目。')
  if (added.length) console.error('新增文件：\n  ' + added.join('\n  '))
  if (modified.length) console.error('修改文件：\n  ' + modified.join('\n  '))
  if (deleted.length) console.error('删除文件：\n  ' + deleted.join('\n  '))
  console.error('请先还原以上改动（预览产物只能位于 .ui-preview/ 内），再重新校验。')
  process.exit(1)
}

console.log('✅ 隔离校验通过：除 .gitignore 外，真实项目与基线完全一致。')
