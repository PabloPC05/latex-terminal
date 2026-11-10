// Dibujo en 2D de una fórmula LaTeX con texto: fracciones apiladas, límites encima y
// debajo de los sumatorios, paréntesis que crecen, raíces, tablas (cases, matrices, aligned).

import { ACCENTS, ALPHABETS, readArg, SKIP, SUB, SUP, SYMBOLS, TEXT_COMMANDS, texToUnicode } from './latex'

/** Un bloque de texto: filas del mismo ancho y la fila donde va la línea base. */
export type Block = { rows: string[]; base: number; width: number }

const COMBINING = /[̀-ͯ⃐-⃿]/g
const widthOf = (s: string) => [...s.replace(COMBINING, '')].length
const padTo = (s: string, w: number) => s + ' '.repeat(Math.max(0, w - widthOf(s)))

function text(s: string): Block {
  return { rows: [s], base: 0, width: widthOf(s) }
}
const SPACE = text(' ')
const isSpace = (b: Block) => b.rows.length === 1 && b.rows[0] !== '' && b.rows[0]!.trim() === ''

/** Pone bloques uno al lado de otro alineando sus líneas base. */
function hcat(blocks: Block[]): Block {
  const items = blocks.filter(b => b.width > 0)
  if (items.length === 0) return text('')
  const ascent = Math.max(...items.map(b => b.base))
  const descent = Math.max(...items.map(b => b.rows.length - 1 - b.base))
  const rows: string[] = Array.from({ length: ascent + descent + 1 }, () => '')
  for (const b of items) {
    const offset = ascent - b.base
    rows.forEach((_, r) => (rows[r] += padTo(b.rows[r - offset] ?? '', b.width)))
  }
  return { rows, base: ascent, width: items.reduce((w, b) => w + b.width, 0) }
}

type Align = 'left' | 'center' | 'right'
function place(s: string, w: number, align: Align): string {
  const gap = Math.max(0, w - widthOf(s))
  const left = align === 'left' ? 0 : align === 'right' ? gap : Math.floor(gap / 2)
  return ' '.repeat(left) + s + ' '.repeat(gap - left)
}

/** Apila bloques; la línea base es la del bloque `at`. */
function vstack(blocks: Block[], at: number, align: Align = 'center'): Block {
  const width = Math.max(0, ...blocks.map(b => b.width))
  const rows: string[] = []
  let base = 0
  blocks.forEach((b, n) => {
    if (n === at) base = rows.length + b.base
    for (const r of b.rows) rows.push(place(r, width, align))
  })
  return { rows, base, width }
}

function blank(height: number, width: number): Block {
  return { rows: Array.from({ length: height }, () => ' '.repeat(width)), base: 0, width }
}

// ── Delimitadores que crecen ──────────────────────────────────────────────

const TALL: Record<string, [string, string, string, string?]> = {
  '(': ['⎛', '⎜', '⎝'],
  ')': ['⎞', '⎟', '⎠'],
  '[': ['⎡', '⎢', '⎣'],
  ']': ['⎤', '⎥', '⎦'],
  '{': ['⎧', '⎪', '⎩', '⎨'],
  '}': ['⎫', '⎪', '⎭', '⎬'],
  '⌈': ['⎡', '⎢', '⎢'],
  '⌉': ['⎤', '⎥', '⎥'],
  '⌊': ['⎢', '⎢', '⎣'],
  '⌋': ['⎥', '⎥', '⎦'],
}

function delimiter(ch: string, height: number, base: number): Block {
  if (ch === '' || ch === '.') return { rows: Array.from({ length: height }, () => ''), base, width: 0 }
  if (height <= 1) return { ...text(ch), base: 0 }
  let rows: string[]
  const tall = TALL[ch]
  if (tall) {
    const [top, fill, bottom, middle] = tall
    rows = Array.from({ length: height }, (_, r) => (r === 0 ? top : r === height - 1 ? bottom : fill))
    if (middle) {
      if (height === 2) rows = ch === '{' ? ['⎰', '⎱'] : ['⎱', '⎰']
      else rows[Math.floor((height - 1) / 2)] = middle
    }
  } else if (ch === '⟨' || ch === '⟩') {
    const half = Math.ceil(height / 2)
    rows = Array.from({ length: height }, (_, r) => ((r < half) === (ch === '⟨') ? '╱' : '╲'))
  } else if (ch === '‖') rows = Array.from({ length: height }, () => '‖')
  else rows = Array.from({ length: height }, () => (ch === '|' ? '│' : ch))
  return { rows, base, width: widthOf(rows[0]!) }
}

function delimited(left: string, inner: Block, right: string): Block {
  const h = inner.rows.length
  return hcat([delimiter(left, h, inner.base), inner, delimiter(right, h, inner.base)])
}

// ── Operadores grandes ─────────────────────────────────────────────────────

const BIG: Record<string, Block> = {
  sum: { rows: ['___', '╲  ', '╱  ', '‾‾‾'], base: 2, width: 3 },
  prod: { rows: ['┬──┬', '│  │', '│  │'], base: 2, width: 4 },
  coprod: { rows: ['│  │', '│  │', '┴──┴'], base: 1, width: 4 },
  int: { rows: ['⌠', '⎮', '⌡'], base: 1, width: 1 },
  iint: { rows: ['⌠⌠', '⎮⎮', '⌡⌡'], base: 1, width: 2 },
  iiint: { rows: ['⌠⌠⌠', '⎮⎮⎮', '⌡⌡⌡'], base: 1, width: 3 },
  oint: { rows: ['⌠', '∮', '⌡'], base: 1, width: 1 },
  bigcup: text('⋃'),
  bigcap: text('⋂'),
  bigoplus: text('⨁'),
  bigotimes: text('⨂'),
}
const LIMIT_WORDS = new Set(['lim', 'limsup', 'liminf', 'max', 'min', 'sup', 'inf', 'det', 'gcd', 'Pr'])

// ── Átomos ─────────────────────────────────────────────────────────────────

type Kind = 'ord' | 'op' | 'bigop' | 'rel' | 'bin' | 'punct' | 'open' | 'close' | 'space'
type Item = { kind: Kind; block: Block; delim?: string; sub?: string; sup?: string }

const RELATIONS = new Set([
  '=', '<', '>', '≤', '≥', '≠', '≈', '≡', '∼', '≃', '≅', '∝', '≪', '≫', '≺', '≻', '⊥', '∥', '∣', '∤',
  '∈', '∉', '∋', '⊂', '⊃', '⊆', '⊇', '⊊', '⊋', '⊨', '⊢', '≔', '≐', '→', '←', '↔', '⇒', '⇐', '⇔', '⟹',
  '⟸', '⟺', '↦', '⟶', '⟵', '⟼', '↑', '↓', '↗', '↘', '↪', '⇉', '⇀', ':',
])
const BINARY = new Set(['+', '−', '±', '∓', '×', '÷', '·', '∗', '⋆', '∘', '•', '⊕', '⊗', '∪', '∩', '∖', '∧', '∨'])
const OPENERS: Record<string, string> = { '(': '(', '[': '[', '\\{': '{', '\\lbrace': '{', '\\langle': '⟨', '\\lceil': '⌈', '\\lfloor': '⌊', '\\lvert': '|', '\\lVert': '‖' }
const CLOSERS: Record<string, string> = { ')': ')', ']': ']', '\\}': '}', '\\rbrace': '}', '\\rangle': '⟩', '\\rceil': '⌉', '\\rfloor': '⌋', '\\rvert': '|', '\\rVert': '‖' }

function classify(sym: string): Kind {
  if (RELATIONS.has(sym)) return 'rel'
  if (BINARY.has(sym)) return 'bin'
  return 'ord'
}

/** El delimitador que va tras \left o \right. */
function readDelimiter(s: string, i: number): [string, number] {
  while (s[i] === ' ') i++
  if (s[i] === '\\') {
    const m = /^\\([A-Za-z]+|.)/.exec(s.slice(i))!
    const tok = m[0]
    const ch = OPENERS[tok] ?? CLOSERS[tok] ?? (tok === '\\|' || tok === '\\Vert' ? '‖' : tok === '\\vert' ? '|' : SYMBOLS[m[1]!] ?? '')
    return [ch, i + tok.length]
  }
  return [s[i] === '.' ? '' : (s[i] ?? ''), i + 1]
}

/** Parte por un separador de nivel superior (fuera de llaves y entornos). */
function splitTop(s: string, sep: '\\\\' | '&'): string[] {
  const parts: string[] = []
  let depth = 0
  let env = 0
  let from = 0
  for (let i = 0; i < s.length; i++) {
    const c = s[i]
    if (c === '\\') {
      if (s.startsWith('\\begin{', i)) env++
      else if (s.startsWith('\\end{', i)) env--
      else if (sep === '\\\\' && s[i + 1] === '\\' && depth === 0 && env === 0) {
        parts.push(s.slice(from, i))
        from = i + 2
      }
      i++
      continue
    }
    if (c === '{') depth++
    else if (c === '}') depth--
    else if (sep === '&' && c === '&' && depth === 0 && env === 0) {
      parts.push(s.slice(from, i))
      from = i + 1
    }
  }
  parts.push(s.slice(from))
  return parts
}

/** Busca el \end{env} que cierra un \begin{env} cuyo contenido empieza en `i`. */
function findEnd(s: string, i: number, env: string): [string, number] {
  const open = `\\begin{${env}}`
  const close = `\\end{${env}}`
  let depth = 1
  let j = i
  while (j < s.length) {
    if (s.startsWith(open, j)) { depth++; j += open.length; continue }
    if (s.startsWith(close, j)) {
      if (--depth === 0) return [s.slice(i, j), j + close.length]
      j += close.length
      continue
    }
    j++
  }
  return [s.slice(i), s.length]
}

function table(content: string, aligns: (col: number) => Align, gap: string): Block {
  const lines = splitTop(content, '\\\\').filter((l, n, all) => l.trim() !== '' || n < all.length - 1)
  const cells = lines.map(l => splitTop(l, '&').map(c => layout(c.trim())))
  const columns = Math.max(...cells.map(r => r.length))
  const widths = Array.from({ length: columns }, (_, c) => Math.max(0, ...cells.map(r => r[c]?.width ?? 0)))
  const rows = cells.map(r =>
    hcat(
      widths.flatMap((w, c) => {
        const b = r[c] ?? text('')
        const padded: Block = { ...b, rows: b.rows.map(x => place(x, w, aligns(c))), width: w }
        return c === 0 ? [padded] : [text(gap), padded]
      }),
    ),
  )
  const stacked = vstack(rows, 0, 'left')
  return { ...stacked, base: Math.floor((stacked.rows.length - 1) / 2) }
}

function environment(env: string, content: string): Block {
  const name = env.replace(/\*$/, '')
  if (name === 'cases' || name === 'dcases') {
    const t = table(content, () => 'left', '   ')
    return hcat([delimiter('{', t.rows.length, t.base), SPACE, t])
  }
  const matrix = /^([pbBvV]?)matrix$/.exec(name)
  if (matrix || name === 'array') {
    const t = table(content, () => 'center', '  ')
    const [l, r] = { p: ['(', ')'], b: ['[', ']'], B: ['{', '}'], v: ['|', '|'], V: ['‖', '‖'], '': ['', ''] }[matrix?.[1] ?? ''] ?? ['', '']
    return delimited(l!, t, r!)
  }
  if (name === 'gathered' || name === 'gather' || name === 'multline') return table(content, () => 'center', '')
  // aligned, align, split, eqnarray…: columnas alternas a derecha e izquierda.
  return table(content, c => (c % 2 === 0 ? 'right' : 'left'), '')
}

// ── Análisis ───────────────────────────────────────────────────────────────

function scripted(item: Item): Block {
  const { block, sub, sup } = item
  if (sub === undefined && sup === undefined) return block
  const subB = sub !== undefined ? layout(sub) : undefined
  const supB = sup !== undefined ? layout(sup) : undefined
  if (item.kind === 'bigop') {
    const parts = [supB, block, subB].filter((b): b is Block => b !== undefined)
    return vstack(parts, supB ? 1 : 0)
  }
  // Índices sencillos: con los caracteres de superíndice y subíndice de Unicode.
  if (block.rows.length === 1) {
    const small = (tex: string | undefined, table: Record<string, string>) => {
      if (tex === undefined) return ''
      const chars = [...texToUnicode(tex).replace(/\s+/g, '')]
      return chars.length > 0 && chars.every(c => table[c] !== undefined) ? chars.map(c => table[c]).join('') : null
    }
    const a = small(sub, SUB)
    const b = small(sup, SUP)
    if (a !== null && b !== null) return text(block.rows[0] + a + b)
  }
  // Si no: el superíndice encima a la derecha y el subíndice debajo.
  const w = Math.max(subB?.width ?? 0, supB?.width ?? 0)
  const left = vstack([blank(supB?.rows.length ?? 0, block.width), block, blank(subB?.rows.length ?? 0, block.width)], 1, 'left')
  const right = vstack([supB ?? blank(0, w), blank(block.rows.length, w), subB ?? blank(0, w)], 0, 'left')
  return hcat([left, { ...right, base: left.base }])
}

/** Junta los átomos de una fila con el espaciado de una fórmula. */
function join(items: Item[]): Block {
  const out: Block[] = []
  const push = (b: Block) => {
    if (isSpace(b) && (out.length === 0 || isSpace(out[out.length - 1]!))) return
    out.push(b)
  }
  items.forEach((it, k) => {
    const prev = items[k - 1]
    const next = items[k + 1]
    const b = scripted(it)
    if (it.kind === 'rel') {
      // Al principio de una fila (tras un & de aligned) el espacio también cuenta.
      if (out.length === 0) out.push(SPACE)
      else push(SPACE)
      push(b)
      push(SPACE)
    }
    else if (it.kind === 'bin') {
      const unary = !prev || ['rel', 'bin', 'open', 'punct', 'bigop'].includes(prev.kind)
      if (unary) push(b)
      else { push(SPACE); push(b); push(SPACE) }
    } else if (it.kind === 'punct') { push(b); push(SPACE) }
    else if (it.kind === 'op' || it.kind === 'bigop') {
      if (prev && (prev.kind === 'ord' || prev.kind === 'bigop' || prev.kind === 'op')) push(SPACE)
      push(b)
      if (next && next.kind !== 'open' && !(next.kind === 'ord' && next.block.rows[next.block.base]?.startsWith('('))) push(SPACE)
    } else push(b)
  })
  while (out.length > 0 && isSpace(out[out.length - 1]!)) out.pop()
  return hcat(out)
}

function parse(s: string, start: number, untilRight: boolean): [Item[], number] {
  const items: Item[] = []
  let i = start
  const add = (item: Item) => {
    if (item.kind === 'close') {
      // Cierra el último delimitador abierto: el grupo crece hasta la altura de su contenido.
      for (let j = items.length - 1; j >= 0; j--) {
        if (items[j]!.kind === 'open' && items[j]!.sub === undefined && items[j]!.sup === undefined) {
          const inner = join(items.slice(j + 1))
          const left = items[j]!.delim ?? ''
          items.splice(j, items.length - j, { kind: 'ord', block: delimited(left, inner, item.delim ?? '') })
          return
        }
      }
    }
    items.push(item)
  }

  while (i < s.length) {
    const c = s[i]!
    if (/\s/.test(c)) { i++; continue }
    if (c === '^' || c === '_') {
      const [arg, j] = readArg(s, i + 1)
      i = j
      let last = items[items.length - 1]
      if (!last) { last = { kind: 'ord', block: text('') }; items.push(last) }
      if (c === '^') last.sup = arg
      else last.sub = arg
      continue
    }
    if (c === '{') {
      const [arg, j] = readArg(s, i)
      i = j
      add({ kind: 'ord', block: layout(arg) })
      continue
    }
    if (c === '}') { i++; continue }
    if (c === '(' || c === '[') { add({ kind: 'open', block: text(c), delim: c }); i++; continue }
    if (c === ')' || c === ']') { add({ kind: 'close', block: text(c), delim: c }); i++; continue }
    if (c === '\\') {
      const m = /^\\([A-Za-z]+|.)/.exec(s.slice(i))
      if (!m) { i++; continue }
      const tok = m[0]
      const name = m[1]!
      i += tok.length
      if (name === 'right') {
        if (untilRight) return [items, i]
        continue
      }
      if (name === 'left') {
        const [l, j] = readDelimiter(s, i)
        const [inner, k] = parse(s, j, true)
        const [r, n] = readDelimiter(s, k)
        i = n
        add({ kind: 'ord', block: delimited(l, join(inner), r) })
        continue
      }
      if (OPENERS[tok]) { add({ kind: 'open', block: text(OPENERS[tok]!), delim: OPENERS[tok] }); continue }
      if (CLOSERS[tok]) { add({ kind: 'close', block: text(CLOSERS[tok]!), delim: CLOSERS[tok] }); continue }
      if (name === 'frac' || name === 'dfrac' || name === 'tfrac' || name === 'cfrac') {
        const [a, j] = readArg(s, i)
        const [b, k] = readArg(s, j)
        i = k
        const num = layout(a)
        const den = layout(b)
        const w = Math.max(num.width, den.width) + 2
        add({ kind: 'ord', block: vstack([num, text('─'.repeat(w)), den], 1) })
        continue
      }
      if (name === 'binom') {
        const [a, j] = readArg(s, i)
        const [b, k] = readArg(s, j)
        i = k
        const t = vstack([layout(a), text(''), layout(b)], 1)
        add({ kind: 'ord', block: delimited('(', t, ')') })
        continue
      }
      if (name === 'sqrt') {
        while (s[i] === ' ') i++
        let index = ''
        if (s[i] === '[') {
          const close = s.indexOf(']', i)
          index = texToUnicode(s.slice(i + 1, close)).trim()
          i = close + 1
        }
        const [a, j] = readArg(s, i)
        i = j
        const body = layout(a)
        const h = body.rows.length
        const head = index === '' ? '' : [...index].every(ch => SUP[ch]) ? [...index].map(ch => SUP[ch]).join('') : index
        const prefix = (r: number) => (r === h - 1 ? head + (h === 1 ? '√' : '╲╱') : ' '.repeat(widthOf(head) + (h === 1 ? 0 : 1)) + (h === 1 ? ' ' : '│'))
        const rows = [' '.repeat(widthOf(prefix(0))) + '_'.repeat(body.width), ...body.rows.map((r, n) => prefix(n) + padTo(r, body.width))]
        add({ kind: 'ord', block: { rows, base: body.base + 1, width: widthOf(rows[0]!) } })
        continue
      }
      if (name === 'begin') {
        const [env, j] = readArg(s, i)
        let k = j
        if (env === 'array') k = readArg(s, k)[1]
        const [content, n] = findEnd(s, k, env)
        i = n
        add({ kind: 'ord', block: environment(env, content) })
        continue
      }
      if (name === 'end') { i = readArg(s, i)[1]; continue }
      if (BIG[name]) { add({ kind: 'bigop', block: BIG[name]! }); continue }
      if (LIMIT_WORDS.has(name)) { add({ kind: 'bigop', block: text(SYMBOLS[name] ?? name) }); continue }
      if (ALPHABETS[name] || TEXT_COMMANDS.has(name)) {
        const [a, j] = readArg(s, i)
        i = j
        const shown = TEXT_COMMANDS.has(name) && !name.startsWith('math') && name !== 'operatorname' ? a : texToUnicode(`\\${name}{${a}}`)
        add({ kind: name === 'operatorname' ? 'op' : 'ord', block: text(shown) })
        continue
      }
      if (ACCENTS[name]) {
        const [a, j] = readArg(s, i)
        i = j
        const body = layout(a)
        if (body.rows.length === 1 && body.width <= 1) add({ kind: 'ord', block: text(texToUnicode(`\\${name}{${a}}`)) })
        else if (name === 'underline') add({ kind: 'ord', block: vstack([body, text('‾'.repeat(body.width))], 0) })
        else {
          const mark = ({ hat: '^', widehat: '^', tilde: '~', widetilde: '~', vec: '→', dot: '·', ddot: '¨' } as Record<string, string>)[name] ?? '_'
          const top = mark === '_' ? '_'.repeat(body.width) : mark === '→' ? place('→', body.width, 'right') : mark
          add({ kind: 'ord', block: vstack([text(top), body], 1) })
        }
        continue
      }
      if (name === 'mathrm' || name === 'text') continue
      if (SKIP.has(name)) {
        if ((name === 'label' || name === 'tag')) i = readArg(s, i)[1]
        continue
      }
      if (name === '\\') { add({ kind: 'space', block: SPACE }); continue }
      if (name === 'quad' || name === 'qquad' || name === ',' || name === ';' || name === ':' || name === ' ' || name === '!') {
        const w = ({ quad: 2, qquad: 4, '!': 0 } as Record<string, number>)[name] ?? 1
        if (w > 0) add({ kind: 'space', block: text(' '.repeat(w)) })
        continue
      }
      if (name in SYMBOLS) {
        const sym = SYMBOLS[name]!
        add({ kind: /^[A-Za-z]{2,}/.test(sym) ? 'op' : classify(sym), block: text(sym) })
        continue
      }
      add({ kind: 'ord', block: text(name) })
      continue
    }
    if (c === '&') { i++; continue }
    if (c === '~') { add({ kind: 'space', block: SPACE }); i++; continue }
    if (c === ',' || c === ';') { add({ kind: 'punct', block: text(c) }); i++; continue }
    if (c === "'") { add({ kind: 'ord', block: text('′') }); i++; continue }
    const ch = c === '-' ? '−' : c === '*' ? '∗' : c
    add({ kind: classify(ch), block: text(ch) })
    i++
  }
  return [items, i]
}

/** Dibuja una fórmula: filas de texto y su línea base. */
export function layout(tex: string): Block {
  if (splitTop(tex, '\\\\').length > 1 || splitTop(tex, '&').length > 1) return environment('aligned', tex)
  return join(parse(tex, 0, false)[0])
}

/** Las filas de una fórmula en display, sin espacios sobrantes a la derecha. */
export function drawDisplay(tex: string): string[] {
  return layout(tex).rows.map(r => r.replace(/\s+$/, ''))
}
