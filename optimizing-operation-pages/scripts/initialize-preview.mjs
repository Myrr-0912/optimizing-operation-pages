#!/usr/bin/env node
// 初始化 .ui-preview/ 单预览应用骨架。除向项目 .gitignore 追加一行外，不写入 .ui-preview/ 之外的任何文件。
import { appendFileSync, cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(process.argv[2] || '.')
const stackIdx = process.argv.indexOf('--stack')
const stack = stackIdx > -1 ? process.argv[stackIdx + 1] : 'static'
if (!['react', 'vue', 'static'].includes(stack)) {
  console.error('--stack 必须是 react | vue | static')
  process.exit(1)
}

const previewDir = join(root, '.ui-preview')
const analysisDir = join(previewDir, 'analysis')
if (!existsSync(join(analysisDir, 'baseline-hashes.json'))) {
  console.error('缺少隔离基线快照，请先运行 detect-project.mjs（它必须在任何写入之前执行）。')
  process.exit(1)
}

for (const d of ['mock', 'variants', 'shared']) {
  mkdirSync(join(previewDir, d), { recursive: true })
}

const shellDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'preview-shells', stack)
if (!existsSync(shellDir)) {
  console.error('未找到预览壳：' + shellDir)
  process.exit(1)
}
cpSync(shellDir, previewDir, { recursive: true, force: false, errorOnExist: false })

const manifestPath = join(previewDir, 'preview-manifest.json')
if (!existsSync(manifestPath)) {
  writeFileSync(
    manifestPath,
    JSON.stringify({ stack, page: null, variants: [], note: '由模型填写：page 为目标页面，variants 为五套方案的 id/title/stylePack/说明' }, null, 2)
  )
}

const gitignorePath = join(root, '.gitignore')
if (existsSync(gitignorePath)) {
  const content = readFileSync(gitignorePath, 'utf8')
  if (!content.split(/\r?\n/).some((l) => l.trim() === '.ui-preview/' || l.trim() === '.ui-preview')) {
    appendFileSync(gitignorePath, (content.endsWith('\n') || content === '' ? '' : '\n') + '.ui-preview/\n')
    console.log('已向 .gitignore 追加 .ui-preview/')
  }
} else {
  writeFileSync(gitignorePath, '.ui-preview/\n')
  console.log('已创建 .gitignore 并写入 .ui-preview/')
}

console.log(`预览骨架已就绪（stack=${stack}）：${previewDir}`)
console.log('下一步：')
console.log('  1. 在 .ui-preview/mock/ 写模拟数据，在 .ui-preview/variants/ 实现五套方案（5 个风格包各一套）并注册到 variants 入口。')
if (stack !== 'static') {
  console.log('  2. 依赖只能装在 .ui-preview/ 内：cd .ui-preview && npm install（需要组件库时在此处追加后再装）。')
  console.log('  3. cd .ui-preview && npm run dev 启动预览。')
} else {
  console.log('  2. 静态壳无需安装依赖，直接用浏览器打开 .ui-preview/index.html。')
}
