# Maintenance and correction

For storage selection, separate template/data updates, and explicit migration/rollback, follow [the storage guide](STORAGE.md). Pulling template updates never migrates the data schema or rewrites personal notes.

## Ordinary notebook updates

During setup or profile maintenance, save useful non-sensitive answers and preferences incrementally without item-by-item approval. Use short Markdown sections, verify each write and briefly report changes. Apply explicit corrections directly; preserve unrelated text. Exclude sensitive/security details under [privacy rules](PRIVACY.md), including from progress and logs. An AI inference stays labeled as an inference. No ID or metadata form is required for an ordinary note.

When an import conflicts with an established user fact, keep the fact and ask a concrete clarification while saving unrelated safe items. A direct user correction is sufficient to update the note. Do not repeat known or skipped interview questions. Outside an active interview, update at natural pauses without distracting from the user's task.

## Keep facts findable and sources clear

Keep each fact in one primary notebook section. Current context and goals may contain a short derived summary with a relative link to that section; do not duplicate whole histories or add unstated priorities, deadlines or motivations. When correcting the primary fact, update or remove affected summaries in the same turn. If a fact already exists elsewhere, link to it instead of asking again.

Use one short source line for a paragraph or group of facts from the same source: user answer, external record, AI inference, or source unverified. Include an existing source locator when known and safe. Distinguish the date recorded/read from the date the facts describe; leave unknown dates unknown. A resume read today with an older "Present" entry does not establish current employment. If the original is unavailable, say so; never invent a citation or relabel unmarked legacy notes as direct user answers. Keep interpretations labeled even when accepted. No per-bullet form or source questionnaire is required.

At a natural pause or topic change, refresh the index's brief coverage links from actual notes, not template headings. Empty means not recorded, not absent from the person's life. Choose the next question from the current conversation, a useful simple follow-up, or an unanswered everyday topic. Read relevant notes and skips first; never repeat known/refused topics just to fill the index. Keep the progress question and notebook paths aligned. Update only affected notes and minimal progress per answer; do not scan/rewrite the whole profile each turn.

## Optional structured register and exports

The remainder concerns the separately curated `records.json`, not a prerequisite for saving notebook answers. Do not automatically synchronize notes into it. When structured records are useful, use the direct-save contract; the answer itself is sufficient, not an approval token. Preserve schema, supersession and concurrent-write validation. Local saving never grants sharing permission; leave export policy unchanged unless separately instructed.

Review the content before reuse or export, validate the register, and select explicit IDs for a named purpose. Renew dates only after checking the claim. Retire outdated context; preserve only useful non-sensitive history. Private notebooks are never automatically imported or exported.

## Contradictions and supersession

Do not choose the newest statement automatically. Mark conflicting entries disputed (or keep new drafts pending), remove them from export policies and ask the person to resolve the difference. Scope differences explicitly, such as work versus leisure.

An explicit user correction resolves the difference without another approval. Create a new entry whose `supersedes` contains the old ID; mark the old entry `superseded`. Keep original creation/provenance, update its modified date, and explain the correction in a private notebook. The validator checks reference integrity; it cannot detect semantic contradictions. A superseded entry cannot be exported. An inference remains an inference even if confirmed: restate as a new user statement when appropriate.

## Notebook record block

Only if maintaining a structured claim alongside notes, this optional reference block may help (not parsed by the tool). It is not needed for ordinary notebook saves:

- Record ID:
- Statement or event:
- Source kind (user statement / AI inference / third-party report / unknown):
- Source reference (minimal, private):
- Confirmation (pending / confirmed / disputed):
- Sensitivity (unknown / public / general / private / sensitive):
- Created / updated (YYYY-MM-DD):
- Review due / expires (YYYY-MM-DD or none):
- Supersedes / conflicting IDs:
- Correction rationale:

Use the JSON register as the authoritative sharing decision. If it differs from the notebook, pause sharing and reconcile; there is no automatic synchronization.
