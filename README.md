# trpl-S

An evolving personal architectural world built around triangular structures, tension, shelter, and movement.

The production-ready identity package lives in [`brand/trpl-s-logo-package`](brand/trpl-s-logo-package/README.md). It includes four concept routes, the selected Aperture identity, vector masters, web and print exports, drawing stamps, usage guidance, and validation artifacts.

The local website is a framework-free HTML, CSS, and JavaScript experience. Open [`index.html`](index.html) directly or serve the repository root with any static file server.

## Study 002

The second original house, trpl-S (2), is presented through its first and second drawing editions near the end of the website narrative. Each original has responsive image exports and separate access through the full-screen drawing viewer.

- First edition: [`assets/study-002-edition-01.png`](assets/study-002-edition-01.png)
- Second scanned edition: [`assets/study-002-edition-02.png`](assets/study-002-edition-02.png)
- Responsive web exports use the matching `-1000.webp` and `-1800.webp` files.

## Study 001 house development

The original right-side elevation has been developed into a coordinated two-storey house concept with floor plans, four elevations, a structural section, web detail drawings, and a three-page A1 PDF set.

- Editable vector drawings: [`assets/study-001-development`](assets/study-001-development)
- Combined print set: [`output/pdf/study-001-house-development.pdf`](output/pdf/study-001-house-development.pdf)
- Source generator: [`tools/build-study-001-concept.mjs`](tools/build-study-001-concept.mjs)
- Browser verification: [`tools/verify-study-001-site.mjs`](tools/verify-study-001-site.mjs)

Run the concept generator with the bundled Node runtime or any Node installation that can resolve `sharp` and `playwright`. Serve the repository on port 4173 before running the browser verification script.
