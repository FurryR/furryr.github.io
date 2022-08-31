import { Terminal } from './dist/cli-web.js'
import boot from './dist/boot.js'
window.onload = () => {
  console.log('onload started')
  load()
}
async function load() {
  const term = new Terminal(document.getElementById('test'))
  document.getElementById('test').lastChild.focus()
  document.onclick = () => document.getElementById('test').lastChild.focus()
  await boot.start(term)
}
