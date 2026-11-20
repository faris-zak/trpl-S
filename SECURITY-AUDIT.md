# Repository security audit — 2026-11-20

Scope: repository files and locally reachable Git history only. No external systems were scanned or contacted. Initial worktree was clean; audited starting commit: `1c25dd3`. Findings below use original line numbers. This is a source review, not certification of the deployed site.

## Architecture

- Framework-free static site entered through `index.html`.
- Local `styles.css` and `script.js` provide layout, navigation, reveals, and comparison sliders.
- Images and SVG icons are served from repository assets; no user-generated content was found.
- Three range inputs update numeric presentation values; contact is a `mailto:` link, not a submission form.
- No backend, APIs, database rules, authentication, sessions, cookies, or browser token storage are implemented.
- Google Fonts supplies external CSS and fonts; no third-party JavaScript is included.
- Node artwork generators use Sharp and Playwright from an external runtime directory; a Playwright verifier checks desktop and mobile behavior. No package manifest, lockfile, site build command, or deployment configuration exists.

## Findings reported before changes

| ID | Severity | File:line | Issue | Exploit scenario | Proposed fix |
| --- | --- | --- | --- | --- | --- |
| SEC-01 | Low | `index.html:4` | Confirmed: no document CSP; any hosting CSP is unknown. | A future HTML injection would have no document-level script/resource restriction. No current injection path was identified. | Add an early restrictive CSP compatible with existing resources. |
| SEC-02 | Low | `index.html:25–27` | Confirmed: external fonts have no explicit referrer policy. | Browser defaults may disclose the site origin to the font provider; sensitive URL leakage was not demonstrated. | Add `no-referrer` before resource links. |
| SEC-03 | Low | `index.html:4`; deployment configuration absent | Suspected: host may lack framing protection and other security headers. | If framing is permitted, another site could embed the page; there are no sensitive actions to clickjack. | Verify/configure response headers at the actual host. |

Totals: Critical 0, High 0, Medium 0; Low 2 confirmed hardening gaps fixed and 1 suspected hosting gap requiring verification. Missing hardening is not evidence of an exploitable XSS flaw.

## Coverage and limits

| Area | Result |
| --- | --- |
| XSS / injection / input | No dynamic HTML sinks, eval, command execution from visitor input, or URL-parameter rendering found. Text updates use `textContent`; image URLs come from authored data attributes. Slider values are numeric. SVGs were checked for active scripts, event handlers, JavaScript URLs, and external hrefs. Generator markup uses developer-controlled values; no untrusted input path found. |
| Auth / access control / tokens | No implementation in this repository. All site content is public. No client-only authorization or token storage found. |
| Secrets / Git history | Pattern scan of 108 text blobs across 17 locally reachable commits found no credential candidates or sensitive environment/key filenames. Patterns covered private-key headers, common provider token formats, and quoted secret assignments. Binary media, unreachable Git objects, and unknown secret formats are not exhaustively covered. No key rotation is indicated by this review. |
| Headers | Document CSP and referrer policy added. Response headers, redirects, TLS, and host defaults cannot be determined from these files. |
| CORS / cookies | No API or cookie-setting code; deployed server behavior remains unverified. No reason to add permissive CORS. |
| Dependencies | No shipped npm application dependencies or repository package/lock files. Development scripts resolve Sharp/Playwright outside the repo; their dependency trees were not audited under repository-only scope. Offline npm audit before and after returned `ENOLOCK`, not a clean vulnerability result. |
| Third-party resources / SRI | No external JavaScript. Google Fonts CSS lacks SRI and is provider/agent-dependent; an unverified fixed hash was not added. CSS/font origins are explicitly allowed by CSP. Self-hosting fonts remains an optional owner decision, preserving the current typefaces. |
| Forms / CSRF / rate limits | No submission form or state-changing endpoint. The section named `form` is architectural content, not an HTML form. These server protections are not applicable to current source. |
| Error handling | No server error responses or public stack-trace rendering. Local developer scripts may emit diagnostic errors to the terminal. Host error pages were not examined. |

## Fixes, with separate diffs

SEC-01 — Added immediately after the charset declaration in `index.html`. Local scripts remain permitted; inline scripts, eval, connections, objects, frames, base URL changes, and form submissions are restricted. Existing inline styles and Google Fonts remain allowed to preserve presentation. CSP does not prevent compromise of an allowed same-origin script; it is defense in depth.

```diff
   <meta charset="UTF-8">
+  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'">
```

SEC-02 — Added before external resource links. Prevents referrer disclosure while retaining the existing font provider; the provider still receives ordinary connection metadata such as IP address.

```diff
+  <meta name="referrer" content="no-referrer">
```

Verification repair — `tools/verify-study-001-site.mjs`: both failures were reproduced with original `HEAD:index.html` before correcting the assertions. All artwork is still checked, including hidden fallback assets. Runtime site behavior is unchanged.

```diff
+  // Hidden fallbacks may remain lazy until explicitly requested by this check.
+  await desktop.locator("img[src]").evaluateAll((images) => Promise.all(images.map((image) => {
+    image.loading = "eager";
+    return image.decode();
+  })));
   const desktopBrokenImages = await desktop.locator("img[src]").evaluateAll((images) => images.filter((image) => !image.complete || image.naturalWidth === 0).map((image) => image.getAttribute("src")));
-  assert(await desktop.locator("#trpl-s-3 .reveal.visible").count() === 4, "trpl-S (3) reveal sequence completes");
+  assert(await desktop.locator("#trpl-s-3 .reveal.visible:visible").count() === await desktop.locator("#trpl-s-3 .reveal:visible").count(), "trpl-S (3) reveal sequence completes for displayed content");
```

## Verification results

- `node --check` passed for `script.js` and all three `tools/*.mjs` files.
- Existing browser verifier passed all 42 assertions after the two test repairs, with zero collected page/console errors.
- Local harness `tmp/security-offline-check.cjs` intercepts browser requests and serves repository bytes through Playwright. External CSS is fulfilled locally with an empty stylesheet, other external requests are aborted, and a dead loopback proxy prevents external network fallback. No actual HTTP server or third-party service was contacted.
- Targeted browser checks confirmed blocking of injected inline script, an injected base URL, and a fetch connection. Three intercepted Google Fonts CSS requests had no Referer header. Comparison initialization and interaction remained functional.
- Font-provider availability and exact downloaded-font layout were not tested; offline tests use existing fallback fonts. No production header assertions are implied by these tests.
- `npm audit --offline --ignore-scripts --json` attempted before and after: `ENOLOCK`. A current advisory audit is unavailable without a dependency inventory and permission for external advisory requests.
- `git diff --check` passed. There is no application build step; artwork generators were syntax-checked, not executed to overwrite unrelated generated assets.

## Manual actions required

1. At the actual hosting layer, inspect existing headers and reconcile a response CSP matching the document policy plus `frame-ancestors 'none'` (if embedding is not intended). Meta CSP cannot enforce `frame-ancestors`. Set `X-Frame-Options: DENY` for compatible older clients under the same embedding decision.
2. Configure `X-Content-Type-Options: nosniff`, correct MIME types, `Referrer-Policy: no-referrer`, and an appropriate Permissions-Policy, for example `camera=(), microphone=(), geolocation=()`. These must be HTTP response headers; adding ineffective meta equivalents is not a fix.
3. Confirm HTTPS coverage, then choose an HSTS duration and configure `Strict-Transport-Security`. Do not add `includeSubDomains` or preload until every affected subdomain is ready. No domain/TLS assumptions were made here.
4. If the artwork toolchain is maintained as part of this project, select supported Sharp/Playwright versions and commit a reproducible development dependency manifest and lockfile. Run an authorized online advisory audit of that tree. No versions were guessed or packages installed during this audit.

## Ongoing practices

- Keep script sources local and use safe DOM text/property APIs for future inputs.
- Scan commits for secrets and review new external resources before inclusion.
- Maintain locked development dependencies and run advisory checks when network access is authorized.
- Re-run browser checks after changes; verify headers at the deployment layer when permitted.
