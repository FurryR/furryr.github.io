export default async ({ util, term }) => {
  term.write("FurryR's blog, version 1.0.0 (javascript-browser)\n")
  term.write('Available commands:\n')
  term.write(`${util.applist().join(' ')}\n\n`)
  term.write(
    'This page is based on ',
    util.Link('Cli-Web', 'https://github.com/FurryR/cli-web'),
    ' Project.\n'
  )
  return 0
}
