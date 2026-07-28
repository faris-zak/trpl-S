# trpl-S Logo Package

Version 1.1 selects the **Aperture** direction: three interlocked structural forms turning around a triangular opening.

## Package map

- `master/`: editable path-based SVG masters with no font dependency
- `web/`: transparent PNG lockups and favicon exports
- `print/`: vector PDF artwork for portfolio and one-ink use
- `drawing-stamp/`: graphite and white marks for sketches
- `concepts/`: identical comparison sheets for Truss, Span, Aperture, and Continuous Frame
- `guide/`: concise usage guidance in Markdown and PDF
- `validation/`: context and small-size checks
- `manifest.json`: sizes and SHA-256 checksums for every deliverable

The approved palette is warm graphite `#292725`, white `#FFFFFF`, and black only for single-ink printing.

Rebuild from the repository root with:

```powershell
$env:NODE_PATH='C:\Users\aalza\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules'
node tools/build-logo-package.mjs
```
