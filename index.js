import { Terminal } from './dist/cli-web.js'
import boot from './dist/init.js'
import { Directory } from './dist/util.js'
window.onload = () => {
  console.log('onload started')
  load()
}
async function load() {
  if (window.location.search == '?reset') {
    console.log('localStorage cleared')
    window.localStorage.setItem(
      'file',
      JSON.stringify(new Directory().toJSON())
    )
    window.location.search = ''
    return
  }
  const term = new Terminal(document.getElementById('test'))
  const s = window.localStorage.getItem('file')
  const fs = s ? Directory.from(JSON.parse(s)) : new Directory()
  document.getElementById('test').lastChild.focus()
  document.onclick = () => document.getElementById('test').lastChild.focus()
  window.onbeforeunload = () => {
    window.localStorage.setItem('file', JSON.stringify(fs.toJSON()))
  }
  await boot.start(term, fs)
  window.localStorage.setItem('file', JSON.stringify(fs.toJSON()))
}
