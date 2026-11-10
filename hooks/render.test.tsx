import { test, expect } from 'claude-code/testing'

test('una fórmula en display se dibuja en 2D con su botón de copiar', async ($, on) => {
  on('ui.render', { component: 'AssistantMessage' }, ($, e) => {
    const { Text } = $.ui.resolve(e)
    return <Text>{e.props.text}</Text>
  })
  const tree = await $.ui.render({
    surface: 'terminal',
    component: 'AssistantMessage',
    requestId: 'm1',
    viewport: { columns: 120, rows: 40 },
    props: { text: 'La serie:\n\n$$\n\\sum_{n=0}^{\\infty} a_n (z - z_0)^n\n$$\n\nY ya.', isFirstOfReply: true },
  } as never)
  const dump = JSON.stringify(tree)
  expect(dump).toContain('___')
  expect(dump).toContain('n = 0')
  expect(dump).toContain('⧉ LaTeX')
})
