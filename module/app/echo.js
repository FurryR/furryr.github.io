export default async ({ term, arg }) => {
  for (const n of arg) {
    if (n[0] != '"') {
      term.write(`${n} `)
    } else {
      try {
        term.write(`${JSON.parse(n)} `)
      } catch (_) {
        term.write(`\necho: Syntax error near \`${n}\`\n`)
        return 1
      }
    }
  }
  term.write('\n')
  return 0
}
