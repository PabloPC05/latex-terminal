// LaTeX → Unicode: what a terminal can draw of a formula.

export const SYMBOLS: Record<string, string> = {
  // griego
  alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', epsilon: 'ϵ', varepsilon: 'ε', zeta: 'ζ', eta: 'η',
  theta: 'θ', vartheta: 'ϑ', iota: 'ι', kappa: 'κ', lambda: 'λ', mu: 'μ', nu: 'ν', xi: 'ξ', pi: 'π',
  varpi: 'ϖ', rho: 'ρ', varrho: 'ϱ', sigma: 'σ', varsigma: 'ς', tau: 'τ', upsilon: 'υ', phi: 'ϕ',
  varphi: 'φ', chi: 'χ', psi: 'ψ', omega: 'ω',
  Gamma: 'Γ', Delta: 'Δ', Theta: 'Θ', Lambda: 'Λ', Xi: 'Ξ', Pi: 'Π', Sigma: 'Σ', Upsilon: 'Υ',
  Phi: 'Φ', Psi: 'Ψ', Omega: 'Ω',
  // operadores
  sum: '∑', prod: '∏', coprod: '∐', int: '∫', iint: '∬', iiint: '∭', oint: '∮', bigcup: '⋃', bigcap: '⋂',
  pm: '±', mp: '∓', times: '×', div: '÷', cdot: '·', ast: '∗', star: '⋆', circ: '∘', bullet: '•',
  oplus: '⊕', otimes: '⊗', cup: '∪', cap: '∩', setminus: '∖', wedge: '∧', land: '∧', vee: '∨', lor: '∨',
  neg: '¬', lnot: '¬', nabla: '∇', partial: '∂', infty: '∞', emptyset: '∅', varnothing: '∅',
  forall: '∀', exists: '∃', nexists: '∄', aleph: 'ℵ', hbar: 'ℏ', ell: 'ℓ', wp: '℘', Re: 'Re', Im: 'Im',
  angle: '∠', triangle: '△', square: '□', degree: '°', prime: '′', dagger: '†',
  // relaciones
  leq: '≤', le: '≤', geq: '≥', ge: '≥', neq: '≠', ne: '≠', approx: '≈', equiv: '≡', sim: '∼', simeq: '≃',
  cong: '≅', propto: '∝', ll: '≪', gg: '≫', prec: '≺', succ: '≻', perp: '⊥', parallel: '∥', mid: '∣',
  nmid: '∤', in: '∈', notin: '∉', ni: '∋', subset: '⊂', supset: '⊃', subseteq: '⊆', supseteq: '⊇',
  subsetneq: '⊊', supsetneq: '⊋', models: '⊨', vdash: '⊢', coloneqq: '≔', doteq: '≐',
  // flechas
  to: '→', rightarrow: '→', leftarrow: '←', gets: '←', leftrightarrow: '↔', Rightarrow: '⇒',
  Leftarrow: '⇐', Leftrightarrow: '⇔', implies: '⟹', impliedby: '⟸', iff: '⟺', mapsto: '↦',
  longrightarrow: '⟶', longleftarrow: '⟵', longmapsto: '⟼', uparrow: '↑', downarrow: '↓',
  nearrow: '↗', searrow: '↘', hookrightarrow: '↪', rightrightarrows: '⇉', rightharpoonup: '⇀',
  // puntos y delimitadores
  ldots: '…', dots: '…', cdots: '⋯', vdots: '⋮', ddots: '⋱', langle: '⟨', rangle: '⟩',
  lceil: '⌈', rceil: '⌉', lfloor: '⌊', rfloor: '⌋', vert: '|', Vert: '‖', lvert: '|', rvert: '|',
  lVert: '‖', rVert: '‖', backslash: '∖', colon: ':', therefore: '∴', because: '∵', qed: '∎', blacksquare: '∎',
  // funciones (se escriben en redonda)
  sin: 'sin', cos: 'cos', tan: 'tan', cot: 'cot', sec: 'sec', csc: 'csc', arcsin: 'arcsin',
  arccos: 'arccos', arctan: 'arctan', sinh: 'sinh', cosh: 'cosh', tanh: 'tanh', coth: 'coth',
  log: 'log', ln: 'ln', lg: 'lg', exp: 'exp', lim: 'lim', limsup: 'lim sup', liminf: 'lim inf',
  sup: 'sup', inf: 'inf', max: 'max', min: 'min', arg: 'arg', Arg: 'Arg', Log: 'Log', det: 'det',
  dim: 'dim', ker: 'ker', deg: 'deg', gcd: 'gcd', Res: 'Res', mod: 'mod', bmod: 'mod',
  pmod: 'mod', Ind: 'Ind', sgn: 'sgn',
  // espacios
  quad: '  ', qquad: '    ', ',': ' ', ';': ' ', ':': ' ', '!': '', ' ': ' ',
  '{': '{', '}': '}', '|': '‖', '%': '%', '&': '&', '#': '#', _: '_', $: '$',
}

export const SKIP = new Set([
  'left', 'right', 'big', 'Big', 'bigg', 'Bigg', 'bigl', 'bigr', 'Bigl', 'Bigr', 'biggl', 'biggr',
  'displaystyle', 'textstyle', 'scriptstyle', 'limits', 'nolimits', 'middle', 'nonumber', 'notag',
  'label', 'tag',
])

export const SUP: Record<string, string> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
  '+': '⁺', '-': '⁻', '−': '⁻', '=': '⁼', '(': '⁽', ')': '⁾', ' ': ' ',
  a: 'ᵃ', b: 'ᵇ', c: 'ᶜ', d: 'ᵈ', e: 'ᵉ', f: 'ᶠ', g: 'ᵍ', h: 'ʰ', i: 'ⁱ', j: 'ʲ', k: 'ᵏ', l: 'ˡ', m: 'ᵐ',
  n: 'ⁿ', o: 'ᵒ', p: 'ᵖ', r: 'ʳ', s: 'ˢ', t: 'ᵗ', u: 'ᵘ', v: 'ᵛ', w: 'ʷ', x: 'ˣ', y: 'ʸ', z: 'ᶻ',
  A: 'ᴬ', B: 'ᴮ', D: 'ᴰ', E: 'ᴱ', G: 'ᴳ', H: 'ᴴ', I: 'ᴵ', J: 'ᴶ', K: 'ᴷ', L: 'ᴸ', M: 'ᴹ', N: 'ᴺ',
  O: 'ᴼ', P: 'ᴾ', R: 'ᴿ', T: 'ᵀ', U: 'ᵁ', V: 'ⱽ', W: 'ᵂ',
  α: 'ᵅ', β: 'ᵝ', γ: 'ᵞ', δ: 'ᵟ', θ: 'ᶿ', φ: 'ᵠ', ϕ: 'ᵠ', χ: 'ᵡ', '′': '′', '∗': '*',
}

export const SUB: Record<string, string> = {
  '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
  '+': '₊', '-': '₋', '−': '₋', '=': '₌', '(': '₍', ')': '₎',
  a: 'ₐ', e: 'ₑ', h: 'ₕ', i: 'ᵢ', j: 'ⱼ', k: 'ₖ', l: 'ₗ', m: 'ₘ', n: 'ₙ', o: 'ₒ', p: 'ₚ', r: 'ᵣ',
  s: 'ₛ', t: 'ₜ', u: 'ᵤ', v: 'ᵥ', x: 'ₓ', β: 'ᵦ', γ: 'ᵧ', ρ: 'ᵨ', φ: 'ᵩ', ϕ: 'ᵩ', χ: 'ᵪ',
}

const FRACTIONS: Record<string, string> = {
  '1/2': '½', '1/3': '⅓', '2/3': '⅔', '1/4': '¼', '3/4': '¾', '1/5': '⅕', '1/6': '⅙', '1/8': '⅛',
}

export const ACCENTS: Record<string, string> = {
  overline: '̅', bar: '̄', hat: '̂', widehat: '̂', tilde: '̃',
  widetilde: '̃', vec: '⃗', dot: '̇', ddot: '̈', check: '̌',
  underline: '̲', acute: '́', grave: '̀', breve: '̆',
}

// Alfabetos matemáticos: base del bloque y huecos que Unicode cubre en otro sitio.
type Alphabet = { upper: number; lower?: number; digits?: number; holes: Record<string, string> }
export const ALPHABETS: Record<string, Alphabet> = {
  mathbb: {
    upper: 0x1d538, lower: 0x1d552, digits: 0x1d7d8,
    holes: { C: 'ℂ', H: 'ℍ', N: 'ℕ', P: 'ℙ', Q: 'ℚ', R: 'ℝ', Z: 'ℤ' },
  },
  mathcal: {
    upper: 0x1d49c,
    holes: { B: 'ℬ', E: 'ℰ', F: 'ℱ', H: 'ℋ', I: 'ℐ', L: 'ℒ', M: 'ℳ', R: 'ℛ' },
  },
  mathfrak: {
    upper: 0x1d504, lower: 0x1d51e,
    holes: { C: 'ℭ', H: 'ℌ', I: 'ℑ', R: 'ℜ', Z: 'ℨ' },
  },
  mathbf: { upper: 0x1d400, lower: 0x1d41a, digits: 0x1d7ce, holes: {} },
}
ALPHABETS.mathscr = ALPHABETS.mathcal!
ALPHABETS.boldsymbol = ALPHABETS.mathbf!
ALPHABETS.bm = ALPHABETS.mathbf!

export const TEXT_COMMANDS = new Set(['text', 'textrm', 'textup', 'mathrm', 'operatorname', 'mbox', 'textnormal', 'mathit', 'textit', 'mathsf', 'mathtt', 'texttt', 'textbf', 'emph'])
const FRAC_COMMANDS = new Set(['frac', 'dfrac', 'tfrac', 'cfrac'])

export function letterIn(alphabet: Alphabet, ch: string): string {
  if (alphabet.holes[ch]) return alphabet.holes[ch]
  const c = ch.charCodeAt(0)
  if (c >= 65 && c <= 90) return String.fromCodePoint(alphabet.upper + c - 65)
  if (c >= 97 && c <= 122 && alphabet.lower !== undefined) return String.fromCodePoint(alphabet.lower + c - 97)
  if (c >= 48 && c <= 57 && alphabet.digits !== undefined) return String.fromCodePoint(alphabet.digits + c - 48)
  return ch
}

/** Lee un argumento en `i`: un grupo {…}, un comando \x o un carácter. */
export function readArg(s: string, i: number): [string, number] {
  while (i < s.length && s[i] === ' ') i++
  if (i >= s.length) return ['', i]
  if (s[i] === '{') {
    let depth = 1
    let j = i + 1
    while (j < s.length && depth > 0) {
      if (s[j] === '\\') { j += 2; continue }
      if (s[j] === '{') depth++
      else if (s[j] === '}') depth--
      j++
    }
    return [s.slice(i + 1, j - 1), j]
  }
  if (s[i] === '\\') {
    const m = /^\\([A-Za-z]+|.)/.exec(s.slice(i))
    if (m) return [m[0], i + m[0].length]
  }
  const ch = String.fromCodePoint(s.codePointAt(i)!)
  return [ch, i + ch.length]
}

const isAtomic = (s: string) =>
  [...s].length === 1 ||
  /^[\p{L}\p{N}′.\u0300-\u036f]+$/u.test(s) ||
  (/^[\p{L}\p{N}′]*\(.*\)$/u.test(s) && balanced(s.slice(s.indexOf('(') + 1, -1)))

function balanced(s: string): boolean {
  let d = 0
  for (const c of s) {
    if (c === '(') d++
    else if (c === ')' && --d < 0) return false
  }
  return d === 0
}

const wrap = (s: string) => (isAtomic(s) ? s : `(${s})`)

function script(body: string, table: Record<string, string>, mark: string): string {
  const chars = [...body]
  if (chars.length > 0 && chars.every(c => table[c] !== undefined)) return chars.map(c => table[c]).join('')
  return mark + (chars.length === 1 || (body.startsWith('(') && body.endsWith(')') && balanced(body.slice(1, -1))) ? body : `(${body})`)
}

/** Convierte el cuerpo de una fórmula LaTeX a texto Unicode. */
export function texToUnicode(tex: string, display = false): string {
  let out = ''
  let i = 0
  const s = tex
  while (i < s.length) {
    const c = s[i]!
    if (c === '\\') {
      const m = /^\\([A-Za-z]+|.)/.exec(s.slice(i))
      if (!m) { i++; continue }
      const name = m[1]!
      i += m[0].length
      if (name === '\\') { out += display ? '\n' : '; '; continue }
      if (FRAC_COMMANDS.has(name)) {
        const [a, j] = readArg(s, i)
        const [b, k] = readArg(s, j)
        i = k
        const num = texToUnicode(a, display).trim()
        const den = texToUnicode(b, display).trim()
        out += FRACTIONS[`${num}/${den}`] ?? `${wrap(num)}/${wrap(den)}`
        continue
      }
      if (name === 'binom') {
        const [a, j] = readArg(s, i)
        const [b, k] = readArg(s, j)
        i = k
        out += `C(${texToUnicode(a, display)}, ${texToUnicode(b, display)})`
        continue
      }
      if (name === 'sqrt') {
        let index = ''
        while (s[i] === ' ') i++
        if (s[i] === '[') {
          const close = s.indexOf(']', i)
          index = texToUnicode(s.slice(i + 1, close))
          i = close + 1
        }
        const [a, j] = readArg(s, i)
        i = j
        const root = index === '' || index === '2' ? '√' : index === '3' ? '∛' : index === '4' ? '∜' : script(index, SUP, '') + '√'
        out += root + wrap(texToUnicode(a, display).trim())
        continue
      }
      if (ALPHABETS[name]) {
        const [a, j] = readArg(s, i)
        i = j
        const alphabet = ALPHABETS[name]
        out += [...texToUnicode(a, display)].map(ch => letterIn(alphabet, ch)).join('')
        continue
      }
      if (ACCENTS[name]) {
        const [a, j] = readArg(s, i)
        i = j
        const mark = ACCENTS[name]
        out += [...texToUnicode(a, display)].map(ch => (ch === ' ' ? ch : ch + mark)).join('')
        continue
      }
      if (TEXT_COMMANDS.has(name)) {
        const [a, j] = readArg(s, i)
        i = j
        out += name === 'operatorname' || name.startsWith('math') ? texToUnicode(a, display) : a
        continue
      }
      if (name === 'begin' || name === 'end') {
        const [env, j] = readArg(s, i)
        i = j
        if (/^(array|tabular)$/.test(env) && name === 'begin') i = readArg(s, i)[1]
        if (env === 'cases' && name === 'begin') out += display ? '{ ' : '{ '
        else if (/^pmatrix/.test(env)) out += name === 'begin' ? '(' : ')'
        else if (/^bmatrix/.test(env)) out += name === 'begin' ? '[' : ']'
        else if (/^vmatrix/.test(env)) out += '|'
        continue
      }
      if (SKIP.has(name)) {
        if ((name === 'left' || name === 'right' || name === 'middle') && s[i] === '.') i++
        if (name === 'label' || name === 'tag') i = readArg(s, i)[1]
        continue
      }
      if (name in SYMBOLS) {
        const sym = SYMBOLS[name]!
        if (/^[A-Za-z]{2,}/.test(sym)) {
          // Nombre de función: separado de lo que lo rodea (i sin θ, no isinθ).
          if (/[\p{L}\p{N})]$/u.test(out)) out += ' '
          out += sym
          const rest = s.slice(i).trimStart()
          if (rest !== '' && !/^[(^_{[]|^\\left/.test(rest)) out += ' '
        } else out += sym
        continue
      }
      out += name
      continue
    }
    if (c === '^' || c === '_') {
      const [a, j] = readArg(s, i + 1)
      i = j
      const body = texToUnicode(a, display).replace(/\s+/g, ' ').trim()
      out += c === '^' ? script(body, SUP, '^') : script(body, SUB, '_')
      continue
    }
    if (c === '{' || c === '}') { i++; continue }
    if (c === '&') { out += display ? ' ' : ''; i++; continue }
    if (c === '~') { out += ' '; i++; continue }
    if (c === '*') { out += '∗'; i++; continue }
    if (c === "'") { out += '′'; i++; continue }
    if (c === '-' ) { out += '−'; i++; continue }
    out += c
    i++
  }
  return out.replace(/[ \t]+/g, ' ').replace(/ *\n */g, '\n')
}

const INDENT = '    '

function renderDisplay(tex: string): string {
  const lines = texToUnicode(tex, true).split('\n').map(l => l.trim()).filter(l => l !== '')
  return lines.map(l => INDENT + l).join('  \n')
}

/** Una fórmula en display: en su propio párrafo si ocupa su línea; si va dentro de una frase, en línea. */
function display(match: string, tex: string, at: number, all: string, keep: boolean): string {
  const before = all.slice(0, at)
  if (/(^|\n)[ \t]*$/.test(before)) return keep ? match : `\n${renderDisplay(tex)}\n`
  return texToUnicode(tex)
}

/** Sustituye las fórmulas de un trozo de prosa (sin bloques de código). */
function renderProse(text: string, keep: boolean): string {
  // Los `code spans` se dejan tal cual.
  const parts = text.split(/(`+[^`]*?`+)/)
  return parts
    .map((part, n) => {
      if (n % 2 === 1) return part
      return part
        .replace(/\$\$([\s\S]+?)\$\$/g, (m, tex, at, all) => display(m, tex, at, all, keep))
        .replace(/\\\[([\s\S]+?)\\\]/g, (m, tex, at, all) => display(m, tex, at, all, keep))
        .replace(/\\\(([\s\S]+?)\\\)/g, (_, tex) => texToUnicode(tex))
        .replace(/(?<![\\$\w])\$(?![\s$])([^$\n]+?)(?<![\s\\])\$(?![\d$])/g, (_, tex) => texToUnicode(tex))
        .replace(/\n{3,}/g, '\n\n')
    })
    .join('')
}

const FENCE = /^\s*(```|~~~)/

/** Convierte un texto markdown entero, respetando los bloques de código. */
export function renderMarkdown(
  text: string,
  inFence = false,
  keepDisplay = false,
): { text: string; inFence: boolean } {
  const lines = text.split('\n')
  const out: string[] = []
  let prose: string[] = []
  const flush = () => {
    if (prose.length > 0) out.push(renderProse(prose.join('\n'), keepDisplay))
    prose = []
  }
  for (const line of lines) {
    if (FENCE.test(line)) {
      flush()
      out.push(line)
      inFence = !inFence
    } else if (inFence) out.push(line)
    else prose.push(line)
  }
  flush()
  return { text: out.join('\n'), inFence }
}

/**
 * Hasta dónde se puede mostrar ya un texto que llega a trozos: el final de la
 * última línea completa tras la cual no queda abierta una fórmula en display.
 */
export function safePrefix(text: string, inFence: boolean): number {
  let open: '$$' | '\\[' | null = null
  let safe = 0
  let pos = 0
  const lines = text.split('\n')
  for (let n = 0; n < lines.length; n++) {
    const line = lines[n]!
    const isLast = n === lines.length - 1
    if (FENCE.test(line) && open === null) inFence = !inFence
    else if (!inFence) {
      const bare = line.replace(/`+[^`]*?`+/g, '')
      const re = /\$\$|\\\[|\\\]/g
      let m: RegExpExecArray | null
      while ((m = re.exec(bare))) {
        if (m[0] === '$$') open = open === '$$' ? null : open ?? '$$'
        else if (m[0] === '\\[') open = open ?? '\\['
        else if (open === '\\[') open = null
      }
    }
    pos += line.length + (isLast ? 0 : 1)
    if (!isLast && open === null) safe = pos
  }
  return safe
}

export type Segment = { kind: 'text'; text: string } | { kind: 'math'; tex: string; source: string }

/**
 * Parte un markdown en texto y fórmulas en display que ocupan sus propias
 * líneas ($$…$$ o \[…\]), fuera de los bloques de código.
 */
export function splitDisplay(text: string): Segment[] {
  const out: Segment[] = []
  const pushText = (t: string) => {
    const last = out[out.length - 1]
    if (last?.kind === 'text') last.text += t
    else if (t !== '') out.push({ kind: 'text', text: t })
  }
  const lines = text.split('\n')
  let inFence = false
  let prose: string[] = []
  const flush = (trailing: boolean) => {
    if (prose.length === 0) return
    const chunk = prose.join('\n') + (trailing ? '\n' : '')
    prose = []
    const re = /\$\$([\s\S]+?)\$\$|\\\[([\s\S]+?)\\\]/g
    let from = 0
    let m: RegExpExecArray | null
    while ((m = re.exec(chunk))) {
      const startsLine = /(^|\n)[ \t]*$/.test(chunk.slice(0, m.index))
      const endsLine = /^[ \t]*(\n|$)/.test(chunk.slice(m.index + m[0].length))
      if (!startsLine || !endsLine) continue
      const lineStart = chunk.lastIndexOf('\n', m.index - 1) + 1
      pushText(chunk.slice(from, lineStart))
      out.push({ kind: 'math', tex: (m[1] ?? m[2] ?? '').trim(), source: m[0] })
      const after = /^[ \t]*\n?/.exec(chunk.slice(m.index + m[0].length))![0]
      from = m.index + m[0].length + after.length
    }
    pushText(chunk.slice(from))
  }
  lines.forEach((line, n) => {
    const nl = n < lines.length - 1
    if (FENCE.test(line)) {
      flush(true)
      pushText(line + (nl ? '\n' : ''))
      inFence = !inFence
    } else if (inFence) pushText(line + (nl ? '\n' : ''))
    else prose.push(line)
  })
  flush(false)
  return out
}
