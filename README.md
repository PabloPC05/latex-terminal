# latex-terminal

Un mod para [Claude Code](https://claude.com/claude-code) que dibuja en la terminal las fórmulas matemáticas de las respuestas de Claude ya compuestas con LaTeX, sin `$$` ni código a la vista.

- **Fórmulas en display** (`$$…$$` o `\[…\]` en su propia línea): se compilan con el LaTeX de tu ordenador y se muestran como imagen, con sumatorios, integrales y fracciones a tamaño completo. Al pasar el ratón por encima aparece un botón **⧉ LaTeX** que copia su código al portapapeles.
- **Fórmulas en línea** (`$…$` o `\(…\)`): imágenes pequeñas, de la altura de una línea, dentro de la frase.
- **Modo claro u oscuro**: los colores siguen la apariencia de macOS.
- Además, el mod le indica a Claude que escriba las fórmulas en LaTeX con esos delimitadores.

Mientras una fórmula compila (la primera vez tarda menos de un segundo; después queda en caché en `~/Library/Caches/latex-terminal`), se ve una versión en texto.

## Requisitos

- macOS y una terminal con el protocolo gráfico de kitty: [Ghostty](https://ghostty.org) o kitty. En otras terminales se ve el código LaTeX en lugar de la imagen.
- Una distribución de LaTeX con `latex` y `dvisvgm` (MacTeX, BasicTeX o TinyTeX), con los paquetes `amsmath`, `amssymb`, `mathtools`, `xcolor` y `standalone`.
- `rsvg-convert`: `brew install librsvg`.

## Instalación

En el prompt de una sesión de Claude Code en la terminal:

```
/plugin install latex-terminal --marketplace PabloPC05/latex-terminal
```

Responde `y` para añadir el marketplace y elige el ámbito (el de usuario lo activa en todas tus sesiones).

Desde una shell:

```
claude plugin install latex-terminal --marketplace PabloPC05/latex-terminal
```

En la app de escritorio: pulsa + junto al cuadro del prompt, luego Plugins, Add marketplace con `PabloPC05/latex-terminal`, y después Add plugin.

## Limitaciones

- Al seleccionar texto con el ratón, Claude Code no copia el contenido de las imágenes: para copiar el LaTeX de una fórmula en display, usa el botón **⧉ LaTeX**.
- Las fórmulas en línea no tienen botón de copiar.

## Licencia

MIT
