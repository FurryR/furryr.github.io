#!/usr/bin/env node

/**
 * 更新 archive.html 中的文章索引
 * 扫描 res/posts 目录中的所有 HTML 文件，提取元数据并更新 archive.html
 */

import { readdir, readFile, writeFile } from 'fs/promises'
import { join, relative } from 'path'
import { parse } from 'node-html-parser'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const PROJECT_ROOT = join(__dirname, '..')
const POSTS_DIR = join(PROJECT_ROOT, 'res', 'posts')
const ARCHIVE_FILE = join(PROJECT_ROOT, 'res', 'archive.html')

/**
 * 从文章 HTML 中提取元数据
 */
async function extractPostMetadata(filePath) {
  const content = await readFile(filePath, 'utf-8')
  const root = parse(content)

  const head = root.querySelector('head')
  if (!head) {
    throw new Error(`无法在 ${filePath} 中找到 <head> 标签`)
  }

  // 查找 <blog> 标签
  const blogNode = head.querySelector('blog')
  if (!blogNode) {
    throw new Error(`无法在 ${filePath} 中找到 <blog> 标签`)
  }

  // 提取标题
  const titleNode = head.querySelector('title')
  const title = titleNode ? titleNode.text.trim() : '无标题'

  // 提取 blog 元数据
  const authorNode = blogNode.querySelector('author')
  const timeNode = blogNode.querySelector('time')
  const categoryNode = blogNode.querySelector('category')
  const tagNode = blogNode.querySelector('tag')

  const author = authorNode ? authorNode.text.trim() : ''
  const time = timeNode ? timeNode.text.trim() : ''
  const category = categoryNode ? categoryNode.text.trim() : ''
  const tag = tagNode ? tagNode.text.trim() : ''

  // 计算相对 URL
  const url =
    '/' + relative(join(PROJECT_ROOT, 'res'), filePath).replace(/\\/g, '/')

  return {
    title,
    author,
    time,
    category,
    tag,
    url
  }
}

/**
 * 递归扫描目录中的所有 HTML 文件
 */
async function scanPosts(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const posts = []

  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      posts.push(...(await scanPosts(fullPath)))
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      try {
        const metadata = await extractPostMetadata(fullPath)
        posts.push(metadata)
      } catch (error) {
        console.warn(`警告: 无法解析 ${fullPath}: ${error.message}`)
      }
    }
  }

  return posts
}

/**
 * 更新 archive.html
 */
async function updateArchive() {
  const posts = await scanPosts(POSTS_DIR)

  // 按时间倒序排序
  posts.sort((a, b) => new Date(b.time) - new Date(a.time))

  // 读取并解析 archive.html
  const archiveContent = await readFile(ARCHIVE_FILE, 'utf-8')
  const root = parse(archiveContent)

  // 找到 <body> 和 <index>
  const body = root.querySelector('body')
  if (!body) {
    throw new Error('无法在 archive.html 中找到 <body> 标签')
  }

  let indexNode = body.querySelector('index')
  if (!indexNode) {
    // 如果不存在 <index>，创建一个
    indexNode = parse('<index></index>').firstChild
    body.appendChild(indexNode)
  }

  // 清空并重建 <index> 内容
  indexNode.innerHTML = ''

  // 添加所有文章
  for (const post of posts) {
    const postHtml = `
      <post>
        <name>${escapeHtml(post.title)}</name>
        <author>${escapeHtml(post.author)}</author>
        <time>${escapeHtml(post.time)}</time>
        <category>${escapeHtml(post.category)}</category>
        <tag>${escapeHtml(post.tag)}</tag>
        <url>${escapeHtml(post.url)}</url>
      </post>`
    indexNode.innerHTML += postHtml
  }

  // 写入文件
  await writeFile(ARCHIVE_FILE, root.toString(), 'utf-8')

  console.log(`✅ 成功更新 archive.html，共 ${posts.length} 篇文章`)
}

/**
 * 转义 HTML 特殊字符
 */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }
  return text.replace(/[&<>"']/g, m => map[m])
}

// 运行
updateArchive().catch(error => {
  console.error('错误:', error)
  process.exit(1)
})
