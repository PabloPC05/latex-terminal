// Compila una fórmula con el LaTeX de la máquina y la deja como PNG transparente en la caché.

import type { EngineInterface } from 'claude-code'

/** Colores según la apariencia del sistema (Ghostty sigue la de macOS). */
const PALETTE = {
  dark: { ink: 'E6E6E6' },
  light: { ink: '1A1A1A' },
} as const
let mode: keyof typeof PALETTE = 'dark'
let COLOR: string = PALETTE.dark.ink

/** Lee la apariencia de macOS; true si ha cambiado (hay que volver a dibujar). */
export async function syncAppearance($: EngineInterface): Promise<boolean> {
  let next: keyof typeof PALETTE = 'light'
  try {
    const r = await $.process.run(['/usr/bin/defaults', 'read', '-g', 'AppleInterfaceStyle'], { timeoutMs: 5_000 })
    if (r.exitCode === 0 && r.stdout.trim() === 'Dark') next = 'dark'
  } catch {
    return false
  }
  if (next === mode) return false
  mode = next
  COLOR = PALETTE[mode].ink
  cache.clear()
  return true
}
/** Versión del dibujo: cambiarla invalida la caché. */
const VERSION = 'v2'

const SCRIPT = `
set -e
export PATH="$HOME/Library/TinyTeX/bin/universal-darwin:/Library/TeX/texbin:/opt/homebrew/bin:/usr/local/bin:$PATH"
d="$HOME/Library/Caches/latex-terminal"; mkdir -p "$d"; cd "$d"
k="$1"
if [ ! -s "$k.png" ] || [ ! -s "$k.svg" ]; then
  printf '%s' "$2" > "$k.tex"
  if ! latex -no-shell-escape -interaction=nonstopmode -halt-on-error "$k.tex" >/dev/null 2>&1; then
    grep -m1 '^!' "$k.log" >&2 || true
    rm -f "$k".*
    exit 1
  fi
  dvisvgm --no-fonts --bbox=papersize -o "$k.svg" "$k.dvi" >/dev/null 2>&1
  rsvg-convert -z 4 -o "$k.png" "$k.svg"
  rm -f "$k.aux" "$k.log" "$k.dvi" "$k.tex"
fi
echo "$d/$k.png"
grep -o "width='[0-9.]*pt' height='[0-9.]*pt'" "$k.svg" | head -1
`

export type Rendered =
  | { status: 'pending' }
  | { status: 'error'; reason: string }
  | { status: 'ok'; file: string; widthPt: number; heightPt: number }

/** Adapta lo que suelen escribir los modelos a algo que compila dentro de $\displaystyle …$. */
function body(tex: string): string {
  let t = tex
    .replace(/\\(begin|end)\{(align|alignat|flalign)\*?\}/g, '\\$1{aligned}')
    .replace(/\\(begin|end)\{(gather|multline)\*?\}/g, '\\$1{gathered}')
    .replace(/\\(begin|end)\{(equation|displaymath)\*?\}/g, '')
    .replace(/\\(label|tag)\{[^}]*\}/g, '')
  if (!/\\begin\{/.test(t) && /\\\\/.test(t)) {
    const env = t.includes('&') ? 'aligned' : 'gathered'
    t = `\\begin{${env}}${t}\\end{${env}}`
  }
  return t
}

function document(tex: string, inline: boolean): string {
  // En línea: estilo de texto y un \strut, para que todas tengan el alto de una línea.
  const math = inline ? `$\\strut ${tex}$` : `$\\displaystyle ${body(tex)}$`
  return [
    `\\documentclass[12pt,border=${inline ? '0pt' : '1pt'}]{standalone}`,
    '\\usepackage{amsmath,amssymb,amsfonts,mathtools,xcolor}',
    '\\DeclareMathOperator{\\Res}{Res}\\DeclareMathOperator{\\Arg}{Arg}\\DeclareMathOperator{\\Log}{Log}\\DeclareMathOperator{\\Ind}{Ind}',
    `\\begin{document}\\color[HTML]{${COLOR}}${math}\\end{document}`,
  ].join('\n')
}

async function keyOf(source: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(`${VERSION}|${COLOR}|${source}`))
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('')
}

const cache = new Map<string, Rendered>()

/** Errores de compilación: van al registro de depuración (`claude --debug`). */
export function debug($: EngineInterface, text: string): void {
  $.ui.log(`latex-terminal: ${text}`, { to: 'debug' })
}

/**
 * Lo que hay de una fórmula. La primera vez la manda compilar y responde
 * `pending`; al terminar llama a `onReady` para que se vuelva a dibujar.
 */
export function rendered($: EngineInterface, tex: string, onReady: () => void, inline = false): Rendered {
  const id = `${inline ? 'i' : 'd'}:${tex}`
  const known = cache.get(id)
  if (known) return known
  cache.set(id, { status: 'pending' })
  // En un temporizador: así la compilación no muere cuando acaba el dibujo que la pidió.
  $.clock.after(0, () => void compile($, tex, id, inline, onReady))
  return { status: 'pending' }
}

async function compile($: EngineInterface, tex: string, id: string, inline: boolean, onReady: () => void): Promise<void> {
  {
    try {
      const source = document(tex, inline)
      const key = await keyOf(source)
      const r = await $.process.run(['/bin/sh', '-c', SCRIPT, 'latex-terminal', key, source], { timeoutMs: 30_000 })
      const size = /width='([\d.]+)pt' height='([\d.]+)pt'/.exec(r.stdout)
      const file = r.stdout.split('\n')[0]?.trim()
      if (r.exitCode !== 0 || !size || !file) {
        debug($, `latex falló: ${r.stderr.trim()}`)
        cache.set(id, { status: 'error', reason: r.stderr.trim() || `exit ${r.exitCode}` })
      } else {
        cache.set(id, { status: 'ok', file, widthPt: Number(size[1]), heightPt: Number(size[2]) })
      }
    } catch (err) {
      debug($, `latex no arrancó: ${String(err)}`)
      // Cancelada: se olvida para volver a intentarlo en el siguiente dibujo.
      if (/abort/i.test(String(err))) cache.delete(id)
      else cache.set(id, { status: 'error', reason: String(err) })
    }
    onReady()
  }
}

/** Alto de una fila de la terminal en puntos de LaTeX a 12pt (≈ texto del mismo tamaño). */
const PT_PER_ROW = 13
/** Alto de una celda entre su ancho. */
const CELL_ASPECT = 2.15

/** Celdas que ocupa la imagen, sin pasarse del ancho disponible. */
export function cells(r: { widthPt: number; heightPt: number }, maxColumns: number): { columns: number; rows: number } {
  let rows = Math.max(1, Math.ceil(r.heightPt / PT_PER_ROW))
  let columns = Math.round((r.widthPt * rows * CELL_ASPECT) / r.heightPt)
  const limit = Math.min(255, Math.max(10, maxColumns))
  if (columns > limit) {
    rows = Math.max(1, Math.round((rows * limit) / columns))
    columns = Math.round((r.widthPt * rows * CELL_ASPECT) / r.heightPt)
  }
  return { columns: Math.min(columns, limit), rows: Math.min(rows, 255) }
}

/** Celdas de una fórmula en línea: una fila (dos si es alta, como una fracción). */
export function inlineCells(r: { widthPt: number; heightPt: number }): { columns: number; rows: number } {
  const rows = r.heightPt > 19 ? 2 : 1
  const columns = Math.max(1, Math.round((r.widthPt * rows * CELL_ASPECT) / r.heightPt))
  return { columns: Math.min(columns, 255), rows }
}
