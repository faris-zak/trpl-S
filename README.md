# trpl-S

An evolving personal architectural world built around triangular structures, tension, shelter, and movement.

The production-ready identity package lives in [`brand/trpl-s-logo-package`](brand/trpl-s-logo-package/README.md). It includes four concept routes, the selected Aperture identity, vector masters, web and print exports, drawing stamps, usage guidance, and validation artifacts.

The local website is a framework-free HTML, CSS, and JavaScript experience. Open [`index.html`](index.html) directly or serve the repository root with any static file server.

## Concept visualization comparisons

Each house includes a prepared, accessible drawing-to-reality comparison that remains hidden until its realistic image is supplied. Add the optimized files as `assets/trpl-S(1)-visualization.webp`, `assets/trpl-S(2)-visualization.webp`, and `assets/trpl-S(3)-visualization.webp`; then set the matching `data-visualization-src` value and remove `hidden` from its comparison in `index.html`.

## trpl-S (3)

The third original house is presented as a long elevation study in which repeated triangular frames rise between low and vertical volumes.

- Original drawing: [`assets/trpl-S(3).jpg`](assets/trpl-S(3).jpg)
- Optimized website image: [`assets/trpl-S(3).webp`](assets/trpl-S(3).webp)

## trpl-S (2)

The second original house, trpl-S (2), is presented through its resolved second drawing edition near the end of the website narrative.

- Second scanned edition: [`assets/trpl-S(2).webp`](assets/trpl-S(2).webp)

## trpl-S (1) house development

The original right-side elevation has been developed into a coordinated two-storey house concept with floor plans, four elevations, a structural section, web detail drawings, and a three-page A1 PDF set.

- Editable vector drawings: [`assets/study-001-development`](assets/study-001-development)
- Combined print set: [`output/pdf/study-001-house-development.pdf`](output/pdf/study-001-house-development.pdf)
- Source generator: [`tools/build-study-001-concept.mjs`](tools/build-study-001-concept.mjs)
- Browser verification: [`tools/verify-study-001-site.mjs`](tools/verify-study-001-site.mjs)

Run the concept generator with the bundled Node runtime or any Node installation that can resolve `sharp` and `playwright`. Serve the repository on port 4173 before running the browser verification script.
