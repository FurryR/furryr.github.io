#!/usr/bin/env node

/**
 * 更新 @furryr/typescript-runtime 版本号
 * 将 <tsconfig> 元素合并到 <script> 的 attribute 中
 */

import { readFile, writeFile, readdir } from 'fs/promises'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const PROJECT_ROOT = join(__dirname, '..')
const RES_DIR = join(PROJECT_ROOT, 'res')
const POSTS_DIR = join(RES_DIR, 'posts')
const CREATE_POST_FILE = join(__dirname, 'create-post.js')

const CDN_BASE = 'https://cdn.jsdelivr.net/npm/@furryr/typescript-runtime'

function buildScriptTag(version) {
  const src = `${CDN_BASE}@${version}`
  return { src }
}

function buildReplacement(indent, src) {
  return [
    `${indent}<script`,
    `${indent}  src="${src}"`,
    `${indent}  tsconfig="/tsconfig.browser.json"`,
    `${indent}></script>`
  ].join('\n')
}

function makeRegex() {
  // 匹配 runtime script 标签
  return /( *)<script\n\1  src="https:\/\/cdn\.jsdelivr\.net\/npm\/@furryr\/typescript-runtime@[^"]*"\n\1  (?:raw|tsconfig="[^"]*")\n\1><\/script>/g
}

async function findHtmlFiles() {
  const files = []

  const rootEntries = await readdir(RES_DIR, { withFileTypes: true })
  for (const entry of rootEntries) {
    if (entry.isFile() && entry.name.endsWith('.html')) {
      files.push(join(RES_DIR, entry.name))
    }
  }

  try {
    const postEntries = await readdir(POSTS_DIR, { withFileTypes: true })
    for (const entry of postEntries) {
      if (entry.isFile() && entry.name.endsWith('.html')) {
        files.push(join(POSTS_DIR, entry.name))
      }
    }
  } catch {
    // posts 目录可能不存在
  }

  return files
}

async function updateFile(filePath, version) {
  let content = await readFile(filePath, 'utf-8')
  let modified = false

  const { src } = buildScriptTag(version)

  // 替换 runtime script 标签
  const scriptRegex = makeRegex()
  content = content.replace(scriptRegex, (match, indent) => {
    modified = true
    return buildReplacement(indent, src)
  })

  // 移除 <tsconfig> 行
  if (content.includes('<tsconfig')) {
    content = content.replace(
      / *<tsconfig src="\/tsconfig\.browser\.json"><\/tsconfig>\n?/g,
      ''
    )
    modified = true
  }

  if (modified) {
    await writeFile(filePath, content, 'utf-8')
    console.log(`  已更新: ${filePath}`)
    return true
  }
  return false
}

async function main() {
  const version = process.argv[2]
  if (!version) {
    console.error('用法: node scripts/update-runtime.js <版本号>')
    console.error('示例: node scripts/update-runtime.js 1.2.3')
    process.exit(1)
  }

  console.log(`\n正在更新 @furryr/typescript-runtime 到版本 ${version}...\n`)

  const htmlFiles = await findHtmlFiles()
  console.log(`  找到 ${htmlFiles.length} 个 HTML 文件\n`)

  let count = 0
  for (const file of htmlFiles) {
    const updated = await updateFile(file, version)
    if (updated) count++
  }

  const updated = await updateFile(CREATE_POST_FILE, version)
  if (updated) count++

  console.log(`\n✅ 完成，共更新 ${count} 个文件`)
}

main()
