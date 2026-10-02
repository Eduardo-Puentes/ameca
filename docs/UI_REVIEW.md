# UI evaluation and per-view results

## Method

Automated: Playwright + axe-core WCAG 2 A/AA and 2.1 AA rules, browser exceptions, authenticated redirect checks, and horizontal page overflow. Initial and follow-up passes rendered all 56 page routes at 390 × 844 (mobile) and 1440 × 844 (desktop) using isolated synthetic API data, with superadmin, member, and staff sessions. Dynamic URLs used one test event/member/request; public director biographies used one representative slug. This is a repeatable accessibility/layout check, not a claim that automation proves intuitive use or complete WCAG conformance.

Human usability rubric (score each 0–2 in a short user test): clear purpose/next action; visible loading/error/success; consistent Spanish labels; keyboard and touch operation; safe reversible/destructive flows; readable layout at 390/768/1440px. Target 10/12 or better, no zero in keyboard or destructive flows. Test real workflows with an admin and a member before release.

## Improvements completed

- Shared colors: darkened green actions/links, success and warning text, and secondary text to pass contrast checks.
- Shared dialogs: native focus containment, accessible title, Escape handling, focus restoration, long-content scrolling, background scroll lock.
- Tables and public carousel: keyboard-focusable horizontal scrolling.
- Forms: associated upload labels, valid ref forwarding, true file-input reset, mobile font size to avoid input zoom.
- Event dashboard/membership filters: accessible names.
- Desktop header: removed a nonfunctional notification button and made the page title a semantic heading.
- Diploma editor: accessible field/resize labels, reset behavior corrected, numeric edits preserve incomplete input; generation minimum-day field can be cleared.
- New workflows: per-presentation edit/unlink/delete, separate metrics, announcements with explicit confirmation, camera/manual scanner, downloadable member ticket.

## Per-view tracking

“Pass” below refers to the tested rendered state only. Empty/error/modal states and different data lengths need scenario-specific testing. Alias routes are included as separate views.

| Route | Initial findings / changes | Mobile | Desktop |
| --- | --- | --- | --- |
| `/admin/administradores` | color-contrast | Pass | Pass |
| `/admin/comunicados` | color-contrast | Pass | Pass |
| `/admin/configuracion` | color-contrast | Pass | Pass |
| `/admin/dashboard` | color-contrast, select-name | Pass | Pass |
| `/admin/escaner` | No automated issue; reviewed shared layout | Pass | Pass |
| `/admin/eventos/[eventId]/asistencia` | No automated issue; reviewed shared layout | Pass | Pass |
| `/admin/eventos/[eventId]/diplomas` | No automated issue; reviewed shared layout | Pass | Pass |
| `/admin/eventos/[eventId]/diplomas/plantilla` | button-name, color-contrast, label, select-name | Pass | Pass |
| `/admin/eventos/[eventId]/metricas` | color-contrast | Pass | Pass |
| `/admin/eventos/[eventId]/miembros/[eventMemberId]` | color-contrast | Pass | Pass |
| `/admin/eventos/[eventId]` | color-contrast, select-name | Pass | Pass |
| `/admin/eventos/[eventId]/presentaciones/[presentationId]` | color-contrast | Pass | Pass |
| `/admin/eventos/[eventId]/secciones/[sectionId]` | color-contrast | Pass | Pass |
| `/admin/eventos/[eventId]/solicitudes/[requestId]` | color-contrast | Pass | Pass |
| `/admin/eventos/[eventId]/solicitudes` | color-contrast | Pass | Pass |
| `/admin/eventos` | color-contrast | Pass | Pass |
| `/admin/miembros/[memberId]` | color-contrast | Pass | Pass |
| `/admin/miembros` | color-contrast | Pass | Pass |
| `/admin/miembros/solicitudes/[requestId]` | color-contrast | Pass | Pass |
| `/admin/miembros/solicitudes` | color-contrast | Pass | Pass |
| `/admin/organizaciones` | No automated issue; reviewed shared layout | Pass | Pass |
| `/admin/secciones` | color-contrast, scrollable-region-focusable | Pass | Pass |
| `/admin/socios/[memberId]` | color-contrast | Pass | Pass |
| `/admin/socios/importar` | label | Pass | Pass |
| `/admin/socios` | color-contrast | Pass | Pass |
| `/admin/socios/solicitudes/[requestId]` | color-contrast | Pass | Pass |
| `/admin/socios/solicitudes` | color-contrast | Pass | Pass |
| `/member/dashboard` | color-contrast | Pass | Pass |
| `/member/diplomas` | color-contrast | Pass | Pass |
| `/member/eventos/[eventId]/boleto` | color-contrast | Pass | Pass |
| `/member/eventos/[eventId]` | color-contrast | Pass | Pass |
| `/member/eventos/[eventId]/registro` | color-contrast | Pass | Pass |
| `/member/eventos` | color-contrast | Pass | Pass |
| `/member/membresia` | color-contrast, select-name | Pass | Pass |
| `/member/organizacion` | No automated issue; reviewed shared layout | Pass | Pass |
| `/member/perfil` | color-contrast | Pass | Pass |
| `/member/secciones` | color-contrast, scrollable-region-focusable | Pass | Pass |
| `/member/solicitudes/eventos/[requestId]` | color-contrast | Pass | Pass |
| `/member/solicitudes/membresia/[requestId]` | color-contrast | Pass | Pass |
| `/member/solicitudes` | color-contrast | Pass | Pass |
| `/staff/configuracion` | color-contrast | Pass | Pass |
| `/staff/escaner` | No automated issue; reviewed shared layout | Pass | Pass |
| `/staff/validaciones` | No automated issue; reviewed shared layout | Pass | Pass |
| `/check-email` | color-contrast | Pass | Pass |
| `/consejo/[slug]` | No automated issue; reviewed shared layout | Pass | Pass |
| `/eventos/[eventId]` | color-contrast | Pass | Pass |
| `/eventos/[eventId]/ponentes` | color-contrast | Pass | Pass |
| `/eventos` | color-contrast | Pass | Pass |
| `/forgot-password` | color-contrast | Pass | Pass |
| `/latin-food-2026` | color-contrast | Pass | Pass |
| `/login` | color-contrast | Pass | Pass |
| `/organizacion/aceptar` | color-contrast | Pass | Pass |
| `/` | scrollable-region-focusable | Pass | Pass |
| `/register` | color-contrast | Pass | Pass |
| `/reset-password` | color-contrast | Pass | Pass |
| `/verify` | color-contrast | Pass | Pass |

## Repeat the audit

Run `npm ci`, install Chromium with `npx playwright install chromium`, start the frontend and an isolated/staging API, then run `npm run audit:ui`. Set `UI_AUDIT_BASE_URL`, test access tokens `UI_AUDIT_TOKEN_SUPERUSER`, `UI_AUDIT_TOKEN_MEMBER`, `UI_AUDIT_TOKEN_STAFF`, and fixture IDs (`UI_AUDIT_EVENT_ID`, `UI_AUDIT_MEMBER_ID`, `UI_AUDIT_PRESENTATION_ID`, `UI_AUDIT_EVENT_MEMBER_ID`, `UI_AUDIT_SECTION_ID`, `UI_AUDIT_EVENT_REQUEST_ID`, `UI_AUDIT_MEMBERSHIP_REQUEST_ID`). Without tokens, protected routes are explicitly skipped. Tokens are not printed.

Use `UI_AUDIT_WIDTH=1440` for desktop. `UI_AUDIT_API_URL` optionally redirects API requests to a test API origin (without `/api/v1` suffix). `UI_AUDIT_CHROMIUM` optionally selects an existing executable. The command writes `ui-audit-results.json` (or `UI_AUDIT_OUTPUT`) and exits nonzero on detected violations, redirects to login, page errors, or overflow. Never use ordinary production accounts for destructive scenario tests.

## Remaining acceptance work

AMECA human usability and email-content sign-off; real-device camera permission/scan tests; production-length data and unusual empty/error states. Automated scans do not establish how quickly a first-time attendee understands the workflow. No real provider delivery or production database was exercised.
