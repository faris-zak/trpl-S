# Design QA — Claude redesign implementation

## Comparison target

- Source visual truth: `C:\Users\aalza\Downloads\trpl-s-redesign.html`.
- Source capture: `tmp/claude-reference-full.png`, 1280 × 6482 px.
- Direct hero comparison: `tmp/claude-hero-comparison.png`, 2560 × 720 px, source on the left and implementation on the right.
- Implemented hero: `tmp/claude-implementation-hero.png`, 1280 × 720 px.
- Implemented Study 001: `tmp/claude-implementation-study-001.png`, 1280 × 720 px.
- Implemented analysis: `tmp/claude-implementation-analysis.png`, 1280 × 720 px.
- Implemented Study 002: `tmp/claude-implementation-study-002.png`, 1280 × 720 px.
- Implemented contact: `tmp/claude-implementation-contact.png`, 1280 × 720 px.
- Implemented mobile hero: `tmp/claude-implementation-mobile-hero.png`, 390 × 844 px.
- Implemented mobile Study 002: `tmp/claude-implementation-mobile-study-002.png`, 390 × 844 px.
- Excluded by request: Direction reset / structural massing and the interactive model chamber.

## Fidelity review

- Typography: passed. Cormorant Garamond, DM Mono, and Inter use the supplied weights, sizing, line height, and tracking.
- Color and atmosphere: passed. The black, dark brown, graphite, vellum, and paper palette is unchanged.
- Layout: passed. Hero composition, Study 001 hierarchy, full-width drawing strip, three-column reading, Study 002 editions, and contact composition follow the supplied HTML.
- Direct comparison: passed. The 1280 × 720 hero matches in image crop, brightness, title wrapping, typography, copy placement, and CTA treatment; the intentional difference is removal of the Model navigation item.
- Assets: passed. Supplied remote image references were mapped to their identical local originals for reliable loading.
- Motion: passed. Hero entrance and one-time intersection reveals preserve the supplied timing and easing.
- Scope: passed. Every 3D/model/massing section, link, asset set, route, stylesheet, script, and supporting capture file is removed.

## Interaction and technical checks

- Navigation contains Study 001, Study 002, and Contact only.
- Each navigation link lands on the correct retained section.
- All artwork reports a valid natural width; no broken images are present.
- The rendered DOM contains no interactive-model, structural-massing, or direction-reset content.
- Desktop browser console contains no errors.
- Desktop layout has no horizontal overflow.
- Responsive verification covers a 390 × 844 viewport, including the single-column Study 002 stack.
- `tools/verify-study-001-site.mjs` provides repeatable desktop and mobile checks.

## Findings and comparison history

### Pass 1

- [P1] Claude's source included two model-led blocks despite the explicit model exclusion.
- Fix: removed the Direction reset and Interactive model sections and their navigation entry, then removed all corresponding implementation files and generated assets.

- [P2] The reference used production-hosted image URLs even though identical originals exist locally.
- Fix: mapped each retained image to the matching local asset without changing crop, filtering, or presentation.

### Pass 2

- [P2] The original navigation spacing could crowd narrow screens after the retained links were applied.
- Fix: added a narrow-screen spacing adjustment while preserving the exact desktop composition.

- No actionable P0, P1, P2, or P3 issue remains.

final result: passed
