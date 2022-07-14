export default async ({ term }) => {
  term.write('logout\n')
  return -2
}
