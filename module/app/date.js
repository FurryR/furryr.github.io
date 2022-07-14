export default async ({ term }) => {
  const d = new Date()
  term.write(`Now date: ${d.toUTCString()}(${d.getTime()})\n`)
  return 0
}
