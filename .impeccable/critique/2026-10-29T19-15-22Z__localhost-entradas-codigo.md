---
target: "http://localhost:3000/entradas/[codigo]"
total_score: 23
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
target_identity: "url:http://localhost:3000/entradas/[codigo]"
timestamp: 2026-10-29T19-15-22Z
slug: localhost-entradas-codigo
closed: true
---
## Design Health Score

| # | Heuristic | Score | Key issue |
|---|---|---:|---|
| 1 | Visibility of system status | 2 | Loading/status exists; no ready-to-scan or recovery feedback. |
| 2 | Match system / real world | 4 | Plain Spanish and natural ticket details. |
| 3 | User control and freedom | 2 | Ready/error states lack a clear exit or contact path. |
| 4 | Consistency and standards | 3 | Ticket is coherent but departs from Door List's blue/lime system. |
| 5 | Error prevention | 2 | Invalid codes are rejected; email and bearer code remain exposed. |
| 6 | Recognition rather than recall | 4 | Status, QR and attendance facts are together. |
| 7 | Flexibility and efficiency | 1 | No manual short code, wallet/calendar, resend, or help route. |
| 8 | Aesthetic and minimalist design | 3 | Strong hierarchy, but raw code and all facts have equal exposure. |
| 9 | Error recovery | 1 | Error says only to refresh. |
| 10 | Help and documentation | 1 | Warning exists, but not actionable help at failure/access issues. |
| **Total** | | **23/40** | **Acceptable** |

## Design Specificity Verdict

The ticket silhouette, perforation cuts, dashed QR tear line, dark venue surround, and status signals are credibly authored for Door List. It is nevertheless only moderately differentiated: the cream/green one-column pass could serve many ticket categories, and it diverges from the product's documented control-desk blue/lime language. The main opportunity is to make "listo en la puerta" the organizing idea rather than a styled receipt.

Deterministic scan: not run by design. The target is a URL and the critique protocol requires browser visualization instead. Browser automation and mutable DOM injection were unavailable in this session, so there is no reliable overlay, console output, or detector count. Source fallback: `app/entradas/[code]/page.tsx` has explicit loading, missing, error and ready states; `app/entradas/[code]/layout.tsx` protects indexing/referrer behavior.

## Overall Impression

The valid ticket gives staff a recognizable QR-first artifact and gives attendees a reassuring status. It loses confidence when anything goes wrong: at the door there is no recovery route, and the privacy warning conflicts with showing a full email and bearer credential.

## What's Working

1. The ticket object is a task-relevant metaphor, not ornamental chrome.
2. The QR has a generous white scanning field and its own semantic label.
3. Textual status labels and explanatory copy supplement green/red signals.

## Priority Issues

1. **[P1] Privacy and confidence contradiction.** Full `Correo` and the bearer `Código` are visible while the footer says not to share the link. Mask the email by default; place a shortened/manual code behind a deliberate reveal or copy action; explain the safety constraint beside that action. Suggested command: `$impeccable harden`.
2. **[P1] No recovery at the high-stakes moment.** Network failure only says “Actualiza la página”; used and revoked tickets have no next step. Add an event/organizer contact or staff resolution path, a safe route back, and distinct offline versus unavailable messaging. Suggested command: `$impeccable clarify`.
3. **[P2] QR can fall below the fold on mobile.** The kicker, status, long title and explanatory copy precede the large QR. Put status and QR in the initial viewport, then disclose personal details beneath them. Suggested command: `$impeccable layout`.
4. **[P2] Invalid ticket state can still invite scanning.** Used/revoked QR is only dimmed. Replace its region with a strong textual invalid state and the prescribed resolution. Suggested command: `$impeccable harden`.
5. **[P2] Details are not grouped by the door task.** Five uniform rows make email compete with date and place. Group access facts first and collapse holder details. Suggested command: `$impeccable layout`.

## Persona Red Flags

**Jordan (first-timer):** “No pudimos abrir la entrada” does not explain whether the link, connection, or status failed, nor who can help. Used/revoked states also lack recovery.

**Sam (accessibility-dependent):** The QR is the functional credential without an equivalent manual staff path. Loading/error status is not announced with `aria-live`.

**Casey (distracted mobile attendee):** A long event title can push the QR below the first viewport. Showing full email and code makes a quick shared-screen check risky.

## Minor Observations

The QR wrapper label helps but is not an equivalent access path. The raw 64-character code is noisy and impractical for manual entry. A symbol or structural state change would improve fast recognition of used/revoked tickets. The missing state has a useful escape link; the error state should match it.

## Questions to Consider

Which matters more at the door: protecting private ticket data, getting the QR immediately into view, or resolving failed/invalid tickets without queue escalation? Is the current distinct cream-and-green ticket world intentional despite the documented blue/lime control-desk system? Should a follow-up tackle the two P1 issues only, or all five priorities?
