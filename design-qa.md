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
- Spacing and layout rhythm: passed. The intro grid is unchanged and the landscape artwork panel is centered at a deliberate 1180 px maximum width.
- Colors and visual tokens: passed. The charcoal, graphite, vellum, and paper palette is unchanged.
- Image quality and asset fidelity: passed. Only the original high-resolution Edition 02 scan is rendered, with the existing contrast and brightness treatment.
- Copy and content: passed. The visible section contains one resolved-edition narrative and no first-edition language.

## Interaction and technical checks

- trpl-S (2) navigation lands correctly.
- Desktop renders exactly one edition card using `assets/trpl-S(2).webp`.
- Mobile renders exactly one edition card with no horizontal overflow.
- The Edition 02 image loads in its natural landscape orientation at 2723 × 1711 px.
- Browser console contains no errors at desktop or mobile sizes.
- Three first-edition asset files were removed from the repository.
- Focused comparison was not needed beyond the full section because the retained artwork, label, and copy are clearly legible at the captured sizes.

## Artwork fit correction

- Reference evidence: the supplied screenshots showed both drawings clipped by fixed-height `cover` treatments.
- Implementation evidence: `tmp/trpl-s-1-fit-desktop.png` and `tmp/trpl-s-2-fit-desktop.png` at 1412 × 900 px.
- trpl-S (1) now renders at the source ratio of 1.412 with `object-fit: contain`; the complete 1800 × 1275 drawing remains available without cropping.
- trpl-S (2) now renders as a 1.591 landscape feature at its complete 2723 × 1711 source ratio.
- The previous trpl-S (2) portrait constraint and image zoom were removed.
- Desktop horizontal overflow: 0 px. Browser warnings and errors: none.

## Responsive navigation correction

- Reference evidence: the supplied 304 px screenshot showed the logo and four navigation links wrapping into fragmented two-line labels.
- Implementation evidence: `tmp/mobile-nav-open.png` at 304 × 280 px.
- Mobile now uses a fixed 64 px brand bar with one explicit Menu/Close control and a full-width navigation sheet.
- Each destination is a 52 px touch row; labels stay intact and the current section receives an accessible `aria-current` state.
- Selecting a destination closes the sheet; Escape closes it and returns focus to the menu control; outside tap and desktop resize also dismiss it.
- At 304 px and 1280 px, horizontal overflow is 0 px and the browser console contains no warnings or errors.
- Desktop retains the original inline navigation and hides the mobile control.

final result: passed
