#!/usr/bin/env node

/**
 * 查询已有标签
 *
 * 用法:
 *   node scripts/list-tag.js
 *
 * 扫描 res/posts 下所有文章的 <blog><tag>，列出全部已有标签（空格分隔去重）。
 * 供 skill 在写新文章前查询已存在的 tag，避免新建同名/近义标签。
 */

import { readdir, readFile } from 'fs/promises'
import { join } from 'path'
import { parse } from 'node-html-parser'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const PROJECT_ROOT = join(__dirname, '..')
const POSTS_DIR = join(PROJECT_ROOT, 'res', 'posts')

async function scan(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const tags = new Set()

  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      for (const t of await scan(fullPath)) tags.add(t)
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      try {
        const content = await readFile(fullPath, 'utf-8')
        const root = parse(content)
        const blog = root.querySelector('blog')
        if (!blog) continue
        const tagNode = blog.querySelector('tag')
        if (!tagNode) continue
        for (const t of tagNode.text.trim().split(/\s+/)) {
          if (t) tags.add(t)
        }
      } catch {
        // 跳过无法解析的文件
      }
    }
  }

  return [...tags]
}

async function main() {
  const tags = (await scan(POSTS_DIR)).sort()
  if (tags.length === 0) {
    console.log('暂无标签')
    return
  }
  console.log(tags.join('\n'))
}

main().catch(error => {
  console.error('错误:', error)
  process.exit(1)
})
