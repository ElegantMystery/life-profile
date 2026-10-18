# AI-guided setup design and implementation plan

Approved scope: a developer uses their existing coding assistant to build a useful basic profile, then enriches optional modules over time. No embedded model, automatic imports, integrations, sharing, CI or UI. Local storage does not imply local AI processing.

## Design

Keep the existing schema and exporter unchanged. Add a dependency-free Node CLI with `init`, `check-draft` and `confirm` operations. Initialization requires an explicit new absolute private destination, outside Git working trees and this project, with an existing parent. Refuse existing destinations, links/junctions and network paths. Copy only an explicit template manifest, never examples or repository history. Create a versioned instance marker last; an interrupted initialization remains incomplete and is never silently reused or deleted.

Copy a portable assistant guide and a session-start prompt into the private instance. Users explicitly open that folder or attach the guide in their existing assistant. No global agent configuration is edited. Start with alias/language, current focus, and the first desired help; alternatively draft from exact context sources the user authorizes. Unknowns stay unknown; all modules are optional. Save minimal progress in Markdown for skip/resume, without storing transcripts by default.

Human notes remain Markdown. Draft register candidates live only in `drafts/<name>.json`, with a distinct envelope, pending confirmation, private/unknown/sensitive classification and complete source metadata. `check-draft` validates candidates against the current register and returns a digest without printing personal text. An assistant presents the exact statements and metadata to the person. `confirm` requires selected IDs and the reviewed draft digest; it promotes only those records, preserves inference/source labels, and updates only explicitly superseded records. It never adds export permissions. The flag records an explicit caller instruction, not proof of human consent; assistant instructions and filesystem access are not a security boundary.

Confirmation validates before any register write, refuses duplicates or ambiguous replacements, uses an exclusive lock, compares original register bytes before replacement, and atomically replaces the register via a same-directory temporary file. Reject symlink/hardlink register targets and existing temporary/lock files. Cooperating CLI writers are serialized; uncooperative filesystem writers and hostile directory races are out of scope. Interrupted locks require deliberate inspection, not automatic stealing. Original notes and drafts remain unchanged.

## Implementation steps

1. Write failing tests for empty initialization, existing-file preservation, destination restrictions, private guide copy and draft exclusion.
2. Implement `tools/setup.mjs` routing and `tools/setup-storage.mjs` safe filesystem operations using Node built-ins only.
3. Write failing tests for draft validation, selection/digest approval, inference preservation, supersession, duplicate rejection, stale inputs, locks and unchanged allowlists; implement `tools/setup-records.mjs` using existing `validate()`.
4. Write original assistant guide, connection prompt, progress and draft-format guidance; update README and documentation. Credit the three setup references without copying their instructions.
5. Run the full suite, local links, hygiene checks and staged diff review. Obtain a fresh independent review and fix concrete issues. Commit on the feature branch only; do not push or merge.

## Review focus

No fictional/profile data in initialization; no implicit model or source access; no draft accepted by the exporter; no confirmation without exact version and IDs; no source relabeling; no export allowlist mutation; no replacing existing unrelated files. Test linked paths, interruption markers, malformed metadata, changed inputs and replacement conflicts. Documentation must distinguish actual CLI enforcement from recommendations for assistants.

## Execution ledger

- Design reviewed against the approved brief; implementation uses the clean `feature/ai-guided-setup` branch. Main remains unchanged.
- Ruling: provide a portable assistant interview rather than a terminal questionnaire; the existing assistant handles language and drafting, the CLI handles deterministic writes.
- Ruling: the CLI does not write interview progress or draft text; assistants save those only within authorized private scope. This keeps the new write surface to initialization and explicit register confirmation.
- Completed: test-first setup suite initially failed because setup-storage.mjs was absent. Added deterministic initializer, draft checker and confirmation writer plus portable connection/interview/maintenance guidance.
- Verification: 86 tests passed (62 existing and 24 setup), 0 failed/skipped; repository check passed 53 files and 54 local Markdown links. An independent reviewer found no blocking defect and separately passed 23 in-process setup tests; its CLI subprocess check was restricted by the local execution sandbox, while the full suite passed with process permissions in the implementation session.
- Review limitations retained explicitly: no authenticated proof of human consent, no defense against hostile filesystem races, no semantic deduplication engine, no automatic module checkpointing and no automatic draft deletion. Commit locally only; no push or merge.
