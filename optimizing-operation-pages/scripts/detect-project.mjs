#!/usr/bin/env node
// 只读探测项目并建立隔离基线快照。对真实项目零写入，产物全部进 .ui-preview/analysis/。
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { hashTree } from './lib.mjs'

const root = resolve(process.argv[2] || '.')
const pkgPath = join(root, 'package.json')
if (!existsSync(pkgPath)) {
  console.error('未找到 package.json：' + root)
  console.error('如果这不是 Node 前端项目，请使用 --stack static 的静态兜底流程。')
  process.exit(1)
}

const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) }
const has = (n) => Object.prototype.hasOwnProperty.call(deps, n)

const framework = has('react')
  ? 'react'
  : has('vue')
    ? 'vue'
    : has('@angular/core')
      ? 'angular'
      : has('svelte')
        ? 'svelte'
        : 'unknown'

const buildTool = has('next')
  ? 'next'
  : has('nuxt')
    ? 'nuxt'
    : has('umi') || has('@umijs/max')
      ? 'umi'
      : has('vite')
        ? 'vite'
        : has('webpack')
          ? 'webpack'
          : 'unknown'

const componentLibs = [
  'antd',
  '@ant-design/pro-components',
  'element-plus',
  '@arco-design/web-react',
  '@arco-design/web-vue',
  'naive-ui',
  'tdesign-react',
  'tdesign-vue-next',
  '@mui/material',
  'vant',
  'view-ui-plus'
].filter(has)

const styling = ['tailwindcss', 'sass', 'less', 'styled-components', '@emotion/react', 'unocss'].filter(has)

const packageManager = existsSync(join(root, 'pnpm-lock.yaml'))
  ? 'pnpm'
  : existsSync(join(root, 'yarn.lock'))
    ? 'yarn'
    : existsSync(join(root, 'package-lock.json'))
      ? 'npm'
      : 'none'

const profile = {
  detectedAt: new Date().toISOString(),
  projectRoot: root.split('\\').join('/'),
  framework,
  buildTool,
  componentLibs,
  styling,
  language: existsSync(join(root, 'tsconfig.json')) ? 'typescript' : 'javascript',
  packageManager,
  workspace: Boolean(pkg.workspaces) || existsSync(join(root, 'pnpm-workspace.yaml')),
  previewStackSuggestion: framework === 'react' ? 'react' : framework === 'vue' ? 'vue' : 'static'
}

const analysisDir = join(root, '.ui-preview', 'analysis')
mkdirSync(analysisDir, { recursive: true })
writeFileSync(join(analysisDir, 'project-profile.json'), JSON.stringify(profile, null, 2))

console.log('正在建立隔离基线快照（node_modules/.git/.ui-preview 除外的全部文件哈希）...')
const baseline = hashTree(root)
writeFileSync(join(analysisDir, 'baseline-hashes.json'), JSON.stringify(baseline, null, 2))

console.log('探测完成：')
console.log(JSON.stringify(profile, null, 2))
console.log(`基线快照包含 ${Object.keys(baseline).length} 个文件 → .ui-preview/analysis/baseline-hashes.json`)
