import type { Register } from 'claude-code'

import { blocks, type Block, type Piece, widthOf, wrap } from './inline'
import { renderMarkdown, safePrefix, splitDisplay, texToUnicode } from './latex'
import { drawDisplay } from './layout'
import { cells, inlineCells, rendered, syncAppearance } from './render'

const PROMPT = {
  id: 'latex-terminal:math',
  scope: 'session',
  text:
    'Math in your replies is rendered for the user: the terminal draws LaTeX between $…$ or \\(…\\) (inline) and $$…$$ or \\[…\\] (display, on lines of their own) as typeset images. ' +
    'Write formulas in LaTeX with those delimiters whenever math helps, never inside code spans or code blocks (those stay raw). ' +
    'Use display math for anything with big fractions, sums, integrals or limits.',
} as const

type Pending = { held: string; inFence: boolean }

const INDENT = 4

export const register: Register = on => {
  // Modo claro u oscuro: al empezar y cada 30 s; si cambia, las fórmulas se vuelven a componer.
  on('session.start', async ($, e, next) => {
    const started = await next(e)
    const check = async () => {
      if (await syncAppearance($)) $.ui.invalidate('ui.render')
    }
    $.clock.after(0, () => void check())
    $.clock.every(30_000, () => void check())
    return started
  })

  // Por mensaje en curso: lo aún no mostrado (una fórmula en display sin cerrar) y si va dentro de un bloque de código.
  const messages = new Map<string, Pending>()

  // Mientras llega la respuesta: el texto se deja tal cual, pero sin partir una fórmula en display
  // entre dos trozos, para que el dibujo del mensaje la encuentre entera.
  on('classic.MessageDisplay', async ($, e, next) => {
    const result = await next(e)
    const state = messages.get(e.message_id) ?? { held: '', inFence: false }
    const text = state.held + (result.displayContent ?? e.delta)

    const cut = e.final ? text.length : safePrefix(text, state.inFence)
    const shown = text.slice(0, cut)
    const fences = shown.split('\n').filter(l => /^\s*(```|~~~)/.test(l)).length

    if (e.final) messages.delete(e.message_id)
    else messages.set(e.message_id, { held: text.slice(cut), inFence: state.inFence !== (fences % 2 === 1) })

    return { ...result, displayContent: shown }
  })

  on('ui.render', { component: 'AssistantMessage' }, async ($, e, next) => {
    const unicode = (t: string) => renderMarkdown(t).text
    if (e.surface !== 'terminal') return next({ ...e, props: { ...e.props, text: unicode(e.props.text) } })

    const segments = splitDisplay(e.props.text)
    type Part = Block | { kind: 'display'; tex: string; source: string }
    const parts = segments.flatMap((s): Part[] => (s.kind === 'text' ? blocks(s.text) : [{ kind: 'display', tex: s.tex, source: s.source }]))
    if (parts.every(p => p.kind === 'markdown')) return next(e)

    const { Box, Text, Button, Image } = $.ui.resolve(e)
    const columns = e.viewport?.columns ?? 100
    const room = columns - INDENT - 16
    const redraw = () => $.ui.invalidate('ui.render')

    const children = []
    let first = true
    const markdown = async (text: string) => {
      const drawn = await next({ ...e, props: { ...e.props, text, isFirstOfReply: e.props.isFirstOfReply && first } })
      first = false
      return drawn
    }

    // Un párrafo con fórmulas en línea: texto e imágenes repartidos en líneas a mano.
    const paragraph = (b: Extract<Block, { kind: 'math' }>, n: number) => {
      const bullet = e.props.isFirstOfReply && first ? '⏺ ' : ''
      first = false
      const prefix = bullet + b.prefix
      const lead = b.indent + widthOf(prefix)
      const math = (tex: string) => rendered($, tex, redraw, true)
      const measure = (p: Piece) => {
        if (p.kind === 'text') return widthOf(p.text)
        const r = math(p.tex)
        return r.status === 'ok' ? inlineCells(r).columns : widthOf(texToUnicode(p.tex))
      }
      const lines = wrap(b.chunks, Math.max(20, columns - lead - 2), measure)
      return (
        <Box key={`p${n}`} flexDirection="column" marginTop={b.gapBefore ? 1 : 0}>
          {lines.map((line, k) => (
            <Box key={`l${k}`} flexDirection="row" alignItems="flex-end" paddingLeft={k === 0 ? b.indent : lead}>
              {k === 0 && prefix !== '' ? (
                <Box flexShrink={0}>
                  <Text>{prefix}</Text>
                </Box>
              ) : null}
              {line.map((chunk, c) => (
                // Cada palabra (con la fórmula pegada a ella) conserva su ancho: no se parte ni se encoge.
                <Box key={`p${n}l${k}c${c}`} flexShrink={0} flexDirection="row" alignItems="flex-end" marginLeft={c > 0 ? 1 : 0}>
                  {chunk.map((p, q) => {
                    const key = `p${n}l${k}c${c}q${q}`
                    if (p.kind === 'text') {
                      return (
                        <Text key={key} bold={b.bold || p.bold} italic={p.italic} color={p.code ? 'permission' : undefined}>
                          {p.text}
                        </Text>
                      )
                    }
                    const r = math(p.tex)
                    if (r.status !== 'ok') return <Text key={key}>{texToUnicode(p.tex)}</Text>
                    const size = inlineCells(r)
                    // Al seleccionar, se copia el texto alternativo: su LaTeX.
                    return <Image key={key} source={{ file: r.file, format: 'png' }} columns={size.columns} rows={size.rows} alt={`$${p.tex}$`} />
                  })}
                </Box>
              ))}
            </Box>
          ))}
        </Box>
      )
    }

    for (const [n, s] of parts.entries()) {
      if (s.kind === 'markdown') {
        const text = unicode(s.text).replace(/^\n+|\n+$/g, '')
        if (text.trim() !== '') children.push(<Box key={`t${n}`} marginTop={s.gapBefore ? 1 : 0}>{await markdown(text)}</Box>)
        continue
      }
      if (s.kind === 'math') {
        children.push(paragraph(s, n))
        continue
      }

      const tex = s.tex
      // Lo que se copia al seleccionar la imagen: su texto alternativo, que es el propio LaTeX.
      const alt = `$$${tex.replace(/\s+/g, ' ').trim()}$$`
      // El botón solo aparece con el ratón encima, así no entra en una selección que acaba fuera.
      const copy = (
        <Box marginLeft={4} flexDirection="column" justifyContent="center" display="none" hover={{ display: 'flex' }}>
          <Button
            key={`copy${n}`}
            label="⧉ LaTeX"
            plain
            dimColor
            onPress={async press => {
              await $.ui.copy({ text: `$$${tex}$$`, surface: press.surface })
              $.ui.toast('LaTeX copiado')
            }}
          />
        </Box>
      )
      const r = rendered($, tex, redraw)
      if (r.status === 'ok') {
        const size = cells(r, room)
        children.push(
          <Box key={`m${n}`} flexDirection="row" paddingLeft={INDENT} marginY={1}>
            <Image source={{ file: r.file, format: 'png' }} columns={size.columns} rows={size.rows} alt={alt} />
            {copy}
          </Box>,
        )
        first = false
        continue
      }
      // Mientras compila, o si LaTeX falla: dibujada con texto.
      let rows: string[] | null = null
      try {
        rows = drawDisplay(tex)
      } catch {
        rows = null
      }
      const width = rows ? Math.max(...rows.map(x => [...x].length)) : Infinity
      if (!rows || width > room) {
        children.push(<Box key={`m${n}`}>{await markdown(renderMarkdown(s.source).text)}</Box>)
        continue
      }
      children.push(
        <Box key={`m${n}`} flexDirection="row" paddingLeft={INDENT} marginY={1}>
          <Box flexDirection="column">
            {rows.map((x, k) => (
              <Text key={`r${k}`} wrap="truncate">{x === '' ? ' ' : x}</Text>
            ))}
          </Box>
          {copy}
        </Box>,
      )
      first = false
    }

    return <Box flexDirection="column">{children}</Box>
  })

  on('prompt.compose', async ($, e, next) => {
    const { sections } = await next(e)
    return { sections: [...sections, PROMPT] }
  })
}
