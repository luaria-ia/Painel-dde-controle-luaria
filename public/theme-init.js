// Lido antes do React: aplica o tema salvo para evitar o "piscar" de tema errado.
try {
  var t = localStorage.getItem('bos:theme') || 'system'
  var dark = t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  if (dark) document.documentElement.classList.add('dark')
} catch (e) {}
