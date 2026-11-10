import { test, expect } from 'claude-code/testing'

const flush = (index: number, delta: string, final = false) => ({
  turn_id: 't1', message_id: 'm1', index, final, delta,
})

test('una fórmula en display partida entre dos trozos se muestra entera', async ($, on) => {
  on('classic.MessageDisplay', () => ({}))
  const a = await $.classic.MessageDisplay(flush(0, 'Sea $z\\in\\mathbb{C}$.\n$$\n'))
  expect(a.displayContent).toBe('Sea $z\\in\\mathbb{C}$.\n')
  const b = await $.classic.MessageDisplay(flush(1, 'e^{i\\pi}+1=0\n$$\n', true))
  expect(b.displayContent).toBe('$$\ne^{i\\pi}+1=0\n$$\n')
})

test('el código queda intacto', async ($, on) => {
  on('classic.MessageDisplay', () => ({}))
  const r = await $.classic.MessageDisplay({ ...flush(0, '```\n$x^2$\n```\n', true), message_id: 'm2' })
  expect(r.displayContent).toBe('```\n$x^2$\n```\n')
})
