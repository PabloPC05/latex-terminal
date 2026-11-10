// Párrafos con fórmulas en línea: se parten en trozos de texto y fórmulas y se reparten en líneas.

export type Piece =
  | { kind: 'text'; text: string; bold?: boolean; italic?: boolean; code?: boolean }
  | { kind: 'math'; tex: string }

/** Lo que no se puede partir al cambiar de línea: una palabra con la fórmula pegada a ella. */
export type Chunk = Piece[]

export type Block =
  | { kind: 'markdown'; text: string; gapBefore: boolean }
  | { kind: 'math'; chunks: Chunk[]; prefix: string; indent: number; bold: boolean; gapBefore: boolean }

const COMBINING = /[̀-ͯ⃐-⃿]/g
export const widthOf = (s: string) => [...s.replace(COMBINING, '')].length

const INLINE = /(`+)([^`]*?)\1|\$(?![\s$])([^$\n]+?)(?<![\s\\])\$(?![\d$])|\\\((.+?)\\\)|\*\*(.+?)\*\*|(?<![\w*])\*(?![\s*])(.+?)(?<![\s*])\*(?![\w*])/g

export const hasInlineMath = (text: string) =>
  /(?<![\\$\w])\$(?![\s$])[^$\n]+?(?<![\s\\])\$(?![\d$])|\\\(.+?\\\)/.test(text.replace(/(`+)[^`]*?\1/g, ''))

/** Trozos de un texto con markdown en línea: código, fórmulas, negrita y cursiva. */
export function pieces(text: string, style: { bold?: boolean; italic?: boolean } = {}): Piece[] {
  const out: Piece[] = []
  let from = 0
  for (const m of text.matchAll(INLINE)) {
    if (m.index! > from) out.push({ kind: 'text', text: text.slice(from, m.index), ...style })
    if (m[1] !== undefined) out.push({ kind: 'text', text: m[2]!, code: true })
    else if (m[3] !== undefined) out.push({ kind: 'math', tex: m[3] })
    else if (m[4] !== undefined) out.push({ kind: 'math', tex: m[4] })
    else if (m[5] !== undefined) out.push(...pieces(m[5], { ...style, bold: true }))
    else if (m[6] !== undefined) out.push(...pieces(m[6], { ...style, italic: true }))
    from = m.index! + m[0].length
  }
  if (from < text.length) out.push({ kind: 'text', text: text.slice(from), ...style })
  return out
}

/** Agrupa los trozos en lo que no se parte: se corta solo en los espacios del texto. */
export function chunks(list: Piece[]): Chunk[] {
  const out: Chunk[] = [[]]
  for (const p of list) {
    if (p.kind === 'math' || p.code) { out[out.length - 1]!.push(p); continue }
    const parts = p.text.split(/(\s+)/)
    parts.forEach(part => {
      if (part === '') return
      if (/^\s+$/.test(part)) { if (out[out.length - 1]!.length > 0) out.push([]); return }
      out[out.length - 1]!.push({ ...p, text: part })
    })
  }
  return out.filter(c => c.length > 0)
}

/** Reparte los trozos en líneas de como mucho `width` columnas. */
export function wrap(list: Chunk[], width: number, measure: (p: Piece) => number): Chunk[][] {
  const lines: Chunk[][] = [[]]
  let used = 0
  for (const c of list) {
    const w = c.reduce((s, p) => s + measure(p), 0)
    const line = lines[lines.length - 1]!
    if (line.length > 0 && used + 1 + w > width) {
      lines.push([c])
      used = w
    } else {
      used += (line.length > 0 ? 1 : 0) + w
      line.push(c)
    }
  }
  return lines
}

const FENCE = /^\s*(```|~~~)/
const ITEM = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/
const HEADING = /^(#{1,6})\s+(.*)$/

/**
 * Parte un trozo de markdown en bloques: los que llevan fórmulas en línea, ya
 * troceados para dibujarlos aparte, y el resto tal cual para el markdown normal.
 */
export function blocks(text: string): Block[] {
  if (!hasInlineMath(text) || text.split('\n').some(l => FENCE.test(l))) return [{ kind: 'markdown', text, gapBefore: false }]
  const out: Block[] = []
  let gap = false
  let para: string[] = []
  const pushMarkdown = (t: string) => {
    const last = out[out.length - 1]
    if (last?.kind === 'markdown' && !gap) last.text += '\n' + t
    else out.push({ kind: 'markdown', text: t, gapBefore: gap })
    gap = false
  }
  const pushMath = (body: string, prefix = '', indent = 0, bold = false) => {
    out.push({ kind: 'math', chunks: chunks(pieces(body)), prefix, indent, bold, gapBefore: gap })
    gap = false
  }
  const flushPara = () => {
    if (para.length === 0) return
    const body = para.join(' ')
    if (hasInlineMath(body)) pushMath(body)
    else pushMarkdown(para.join('\n'))
    para = []
  }
  for (const line of text.split('\n')) {
    if (line.trim() === '') { flushPara(); if (out.length > 0) gap = true; continue }
    const item = ITEM.exec(line)
    const heading = HEADING.exec(line)
    if (item || heading || line.trimStart().startsWith('|')) {
      flushPara()
      if (!hasInlineMath(line) || line.trimStart().startsWith('|')) pushMarkdown(line)
      else if (item) {
        const marker = /\d/.test(item[2]!) ? `${item[2]} ` : '• '
        pushMath(item[3]!, marker, item[1]!.length)
      } else pushMath(heading![2]!, '', 0, true)
      continue
    }
    para.push(line.trim())
  }
  flushPara()
  return out
}
