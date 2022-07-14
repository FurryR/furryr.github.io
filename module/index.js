import { Terminal, RichTerminal } from './cli-web.js'
import app_core from './core.js'
window.onload = () => {
  console.log('onload started')
  load()
}
async function load() {
  let term = new RichTerminal(new Terminal(document.getElementById('test')))
  document.getElementById('test').lastChild.focus()
  document.onclick = () => document.getElementById('test').lastChild.focus()
  app_core(term)
}
