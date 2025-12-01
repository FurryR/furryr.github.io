#!/usr/bin/env node

/**
 * 创建新文章
 * 交互式向导帮助创建新文章
 */

import { writeFile, mkdir, readdir } from 'fs/promises'
import { join, dirname, basename } from 'path'
import { fileURLToPath } from 'url'
import enquirer from 'enquirer'
const { Input, Confirm } = enquirer

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const PROJECT_ROOT = join(__dirname, '..')
const POSTS_DIR = join(PROJECT_ROOT, 'res', 'posts')

/**
 * 获取下一个可用的文章 ID
 */
async function getNextPostId() {
  try {
    const files = await readdir(POSTS_DIR)
    const ids = files
      .filter(file => file.endsWith('.html'))
      .map(file => {
        const name = basename(file, '.html')
        const id = parseInt(name, 10)
        return isNaN(id) ? 0 : id
      })
      .filter(id => id > 0)

    if (ids.length === 0) {
      return 1
    }

    return Math.max(...ids) + 1
  } catch (error) {
    // 如果目录不存在，返回 1
    return 1
  }
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

/**
 * 生成文章 HTML 内容
 */
function generatePostHtml(metadata, content = '') {
  const {
    title,
    description = '',
    author = '',
    time = new Date().toISOString(),
    category = '',
    tags = []
  } = metadata

  const tagString = Array.isArray(tags) ? tags.join(' ') : tags

  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <blog>
      <author>${escapeHtml(author)}</author>
      <time>${escapeHtml(time)}</time>
      <category>${escapeHtml(category)}</category>
      <tag>${escapeHtml(tagString)}</tag>
    </blog>
    <script src="/static/js/index.js" type="module" async defer></script>
    <link rel="stylesheet" href="/static/css/preload.css" blog-preload />
    <noscript
      ><link rel="stylesheet" href="/static/css/noscript/blog.css"
    /></noscript>
  </head>
  <body>
    <article>
      <h1>${escapeHtml(title)}</h1>
${content || '      <p>在此编写您的文章内容...</p>'}
    </article>
  </body>
</html>
`
}

/**
 * 交互式收集文章信息
 */
async function collectPostInfo() {
  console.log('📝 创建新文章\n')

  const titlePrompt = new Input({
    name: 'title',
    message: '文章标题',
    required: true,
    validate(value) {
      return value.trim().length > 0 || '标题不能为空'
    }
  })
  const title = await titlePrompt.run()

  const descriptionPrompt = new Input({
    name: 'description',
    message: '文章描述',
    initial: ''
  })
  const description = await descriptionPrompt.run()

  const authorPrompt = new Input({
    name: 'author',
    message: '作者',
    initial: '熊谷 凌'
  })
  const author = await authorPrompt.run()

  const categoryPrompt = new Input({
    name: 'category',
    message: '分类',
    initial: ''
  })
  const category = await categoryPrompt.run()

  const tagsPrompt = new Input({
    name: 'tags',
    message: '标签 (用空格或逗号分隔)',
    initial: ''
  })
  const tagsInput = await tagsPrompt.run()
  const tags = tagsInput
    .split(/[,\s]+/)
    .map(t => t.trim())
    .filter(t => t.length > 0)

  return {
    metadata: {
      title,
      description,
      author,
      time: new Date().toISOString(),
      category,
      tags
    }
  }
}

/**
 * 创建文章
 */
async function createPost() {
  // 收集文章信息
  const { metadata } = await collectPostInfo()

  // 获取下一个文章 ID
  const postId = await getNextPostId()
  const filePath = join(POSTS_DIR, `${postId}.html`)

  // 显示预览
  console.log('\n📋 文章信息预览:\n')
  console.log(`  ID: ${postId}`)
  console.log(`  标题: ${metadata.title}`)
  console.log(`  描述: ${metadata.description || '(无)'}`)
  console.log(`  作者: ${metadata.author || '(未指定)'}`)
  console.log(`  分类: ${metadata.category || '(未指定)'}`)
  console.log(
    `  标签: ${Array.isArray(metadata.tags) && metadata.tags.length > 0 ? metadata.tags.join(', ') : '(无)'}`
  )
  console.log(`  时间: ${new Date(metadata.time).toLocaleString('zh-CN')}`)
  console.log(`  文件: ${filePath}\n`)

  // 确认创建
  const confirmPrompt = new Confirm({
    name: 'confirm',
    message: '确认创建这篇文章吗？',
    initial: true
  })

  const shouldCreate = await confirmPrompt.run()

  if (!shouldCreate) {
    console.log('\n❌ 已取消创建')
    return
  }

  // 生成 HTML 内容
  const html = generatePostHtml(metadata, '')

  // 确保目录存在
  await mkdir(dirname(filePath), { recursive: true })

  // 写入文件
  await writeFile(filePath, html, 'utf-8')

  console.log(`\n✅ 文章创建成功: ${filePath}`)

  // 询问是否更新归档
  const updateArchivePrompt = new Confirm({
    name: 'updateArchive',
    message: '是否立即更新归档页面？',
    initial: true
  })

  const shouldUpdateArchive = await updateArchivePrompt.run()

  if (shouldUpdateArchive) {
    console.log('\n🔄 正在更新归档页面...')
    // 动态导入 update-archive 模块
    try {
      const { execSync } = await import('child_process')
      execSync('node scripts/update-archive.js', {
        cwd: PROJECT_ROOT,
        stdio: 'inherit'
      })
    } catch (error) {
      console.error('\n❌ 更新归档页面失败:', error.message)
      console.log('💡 请手动运行: npm run update-archive')
    }
  } else {
    console.log('\n💡 提示: 记得运行 npm run update-archive 来更新归档页面')
  }
}

// 运行
createPost().catch(error => {
  console.error('错误:', error)
  process.exit(1)
})
