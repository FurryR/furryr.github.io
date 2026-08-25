#!/usr/bin/env node

/**
 * 列出已有分类
 *
 * 用法:
 *   node scripts/list-category.js
 *
 * 扫描 res/posts 下所有文章的 <blog>，输出已有分类（去重）。
 * 供 skill 在写文章前查询已存在的 category，只在不存在时才新建。
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
  const categories = new Set()

  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      for (const c of await scan(fullPath)) categories.add(c)
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      try {
        const content = await readFile(fullPath, 'utf-8')
        const root = parse(content)
        const blog = root.querySelector('blog')
        if (!blog) continue
        const categoryNode = blog.querySelector('category')
        if (!categoryNode) continue
        const category = categoryNode.text.trim()
        if (category) categories.add(category)
      } catch {
        // 跳过单个解析失败的文件
      }
    }
  }

  return [...categories]
}

async function main() {
  const categories = (await scan(POSTS_DIR)).sort()
  if (categories.length === 0) {
    console.log('暂无分类')
    return
  }
  console.log(categories.join('\n'))
}

main().catch(error => {
  console.error('错误:', error)
  process.exit(1)
})
