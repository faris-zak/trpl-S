# Design QA — trpl-S Edition 02-only update

## Comparison target

- Source visual truth: the previously approved trpl-S (2) section plus the user directive to remove Edition 01 and retain Edition 02 consistently.
- Source capture: `tmp/claude-implementation-study-002.png`, 1280 × 720 px.
- Implementation capture: `tmp/study-002-edition-02-only-desktop.png`, 1280 × 720 px.
- Direct comparison: `tmp/study-002-edition-02-comparison.png`, 2560 × 720 px, source on the left and implementation on the right.
- Responsive capture: `tmp/study-002-edition-02-only-mobile.png`, 390 × 844 px.
- CSS viewport and density: desktop 1280 × 720 at 1×; mobile 390 × 844 at 1×.
- State: trpl-S (2) revealed and navigation fixed at the top.

## Findings

### Pass 1

- [P2] Removing the first card without recomposing the grid would leave the retained Edition 02 artwork stranded at half width.
- Fix: replaced the two-column edition grid with a centered, width-constrained single feature that preserves the scan's 3:4 presentation.
- Post-fix evidence: `tmp/study-002-edition-02-only-desktop.png` and `tmp/study-002-edition-02-only-mobile.png`.

- [P2] The old headline and body described two drawing editions and became inconsistent with the retained content.
- Fix: changed the headline to “One structure, drawn with weight.” and rewrote the supporting sentence around the resolved second edition.
- Post-fix evidence: the direct comparison shows the revised hierarchy and copy in the same 1280 × 720 state.

### Pass 2

- No actionable P0, P1, P2, or P3 visual issue remains.

## Required fidelity surfaces

- Fonts and typography: passed. Cormorant Garamond, DM Mono, and Inter remain unchanged; the new headline keeps the established size, weight, wrapping, and italic emphasis.
- Spacing and layout rhythm: passed. The intro grid is unchanged and the single artwork panel is centered at a deliberate 760 px maximum width.
- Colors and visual tokens: passed. The charcoal, graphite, vellum, and paper palette is unchanged.
- Image quality and asset fidelity: passed. Only the original high-resolution Edition 02 scan is rendered, with the existing contrast and brightness treatment.
- Copy and content: passed. The visible section contains one resolved-edition narrative and no first-edition language.

## Interaction and technical checks

- trpl-S (2) navigation lands correctly.
- Desktop renders exactly one edition card using `assets/trpl-S(2).webp`.
- Mobile renders exactly one edition card at 338 px wide with no horizontal overflow.
- The Edition 02 image loads at its natural 1711 × 2723 px resolution.
- Browser console contains no errors at desktop or mobile sizes.
- Three first-edition asset files were removed from the repository.
- Focused comparison was not needed beyond the full section because the retained artwork, label, and copy are clearly legible at the captured sizes.

final result: passed
