export default async ({ util, term }) => {
  term.write(
    "Welcome to FurryR's blog v1.0.0 (cli-web 1.0.0-ghpages typescript)\n"
  )
  term.write(
    '  * Documentation: ',
    util.Link(
      'https://github.com/FurryR/FurryR.github.io',
      'https://github.com/FurryR/FurryR.github.io'
    ),
    '\n'
  )
  term.write(`  Now time ${new Date().toUTCString()}\n`)
  term.write('To show help run: help\n\n\n')
  // let ret = 0;
  for (;;) {
    term.write(
      util.ColorText('Browser', { color: 'limegreen' }),
      ':',
      util.ColorText('~', { color: 'blue' }),
      '$ '
    )
    const r = await util.system(await term.getline())
    if (r == -2) return 0
    // if (r != -1) ret = r;
  }
}
