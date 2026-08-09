# Design QA — trpl-S cinematic threshold

## Evidence

- Source visual truth: `C:\Users\aalza\.codex\generated_images\019fe5f1-8d87-7c21-af62-8d2c8eeedc4b\exec-73bcf5df-c989-4f2a-9367-6e1b47dd089a.png`
- Browser-rendered implementation: `D:\Cloned GitHub repo\trpl-S\tmp\implementation-qa-pass-3.png`
- Final side-by-side comparison: `D:\Cloned GitHub repo\trpl-S\tmp\design-qa-comparison-final.png`
- Mobile implementation: `D:\Cloned GitHub repo\trpl-S\tmp\implementation-mobile-final-3.png`
- Mobile chapter index: `D:\Cloned GitHub repo\trpl-S\tmp\implementation-mobile-nav-final-4.png`
- State: desktop threshold hero, chapter drawer closed; mobile threshold and chapter drawer open were checked separately.
- CSS viewport requested: 1551 × 1048; measured document client viewport: 1536 × 1048; device density: 1.
- Source pixels: 1487 × 1058. Browser screenshot pixels: 1473 × 1038.
- Density normalization: both desktop images were resized to 1487 × 1058 for the side-by-side comparison. The small IAB capture-edge difference was normalized before judging layout.

## Full-view comparison

The final implementation preserves the selected visual's core composition: charcoal paper field, concentrated warm triangular aperture, existing trpl-S identity, quiet upper navigation, left-aligned two-line statement, restrained explanatory copy, outlined entry action, and full-viewport architectural framing. The generated background asset uses the original Study 001 drawing and contains no embedded UI or text.

A separate focused-region comparison was not required because the source and implementation are single-screen hero compositions and the normalized full-view comparison keeps the logo, typography, CTA, drawing texture, and lighting boundary clearly legible.

## Required fidelity surfaces

- Fonts and typography: passed. System Helvetica/Arial provides the source's neutral grotesk character; display weight, line height, letter spacing, hierarchy, and wrapping remain visually aligned. Mobile uses a deliberate three-line wrap to avoid truncation.
- Spacing and layout rhythm: passed. Header, left content rail, headline, copy, CTA, and negative space align with the source's proportions. Responsive layouts have no horizontal overflow.
- Colors and visual tokens: passed. Near-black charcoal, warm ivory, subdued beige emphasis, and low-contrast secondary copy match the source direction with adequate visible contrast.
- Image quality and asset fidelity: passed. The real Study 001 geometry remains recognizable. Responsive WebP assets are sharp and lightweight; the PNG fallback is present. No broken images were found.
- Copy and content: passed. The selected headline, architectural sketchbook label, supporting statement, study identifier, CTA, and chapter labels are present and accurate.

## Comparison history

### Pass 1

- [P2] The first background exposed too much of the right half, weakening the selected concept's concentrated aperture and reducing the dark cinematic enclosure.
- Fix: regenerated the background from both the selected concept and original Study 001 drawing, narrowed the warm light shaft, darkened the perimeter, and rebuilt 1536 px and 900 px WebP exports.
- Post-fix evidence: `D:\Cloned GitHub repo\trpl-S\tmp\design-qa-comparison-pass-2.png`.

### Pass 2

- [P2] The hero copy sat too low and the display scale pushed the supporting copy and CTA below the source's vertical rhythm.
- Fix: moved the hero rail upward, tightened the display scale, and raised the desktop scroll cue. The chapter transition logic was also made deterministic so the header immediately switches tone on navigation.
- Post-fix evidence: `D:\Cloned GitHub repo\trpl-S\tmp\design-qa-comparison-final.png`.

### Pass 3

- No actionable P0, P1, or P2 differences remain.
- The mobile crop was tuned independently so the title stays on charcoal while a controlled sliver of the aperture remains visible.
- The mobile chapter index was changed to a fully opaque charcoal surface to remove content bleed-through.

## Interaction and browser checks

- Primary CTA scrolls to Study 001, updates the URL fragment, and switches the header to the light-section tone.
- Chapter drawer opens, closes, updates `aria-expanded` / `aria-hidden`, closes after selection, and navigates to the requested chapter.
- Existing full-screen drawing viewer still opens and closes.
- Existing study content and 3D model files were not changed.
- No browser console warnings or errors were emitted.
- No loaded image reported a zero natural width.
- JavaScript syntax and `git diff --check` passed.

## Follow-up polish

- [P3] The mockup includes tiny directional icons beside Chapters, Enter the study, and Scroll. The implementation keeps these labels text-only so it does not introduce approximate handcrafted icon art into the existing dependency-free site.

final result: passed
