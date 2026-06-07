declare module 'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/es/core.min.js' {
  const hljs: {
    getLanguage(name: string): unknown
    registerLanguage(name: string, language: unknown): void
    highlight(
      code: string | null,
      options: { language: string }
    ): { value: string }
  }
  export default hljs
}

declare module 'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/es/languages/*.min.js' {
  const language: unknown
  export default language
}
