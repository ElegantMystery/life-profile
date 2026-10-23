# Fictional profile quality acceptance scenarios

These are model-behavior scenarios, not automated semantic tests. Use a disposable initialized instance outside Git trees and fictional facts only. Read the current assistant/import guides. Inspect saved files before advancing each turn. Do not claim execution merely because this document or the Node suite passes.

| Scenario | Fictional fixture and input | Observable acceptance criteria |
| --- | --- | --- |
| Find existing context | Work notes say Casey is exploring library work; current-context/goals are empty. Ask the agent to organize existing notes. | A short linked summary points to the primary work section. No invented deadline, priority or duplicate career history; no question re-asking the known direction. |
| Correct stale summary | Primary work note says library work, linked context summary repeats it. User says: Actually, I am exploring museum work instead. | Primary fact and affected summary agree on museum work after the turn; unrelated notes remain. The linked target exists. No redundant approval. |
| Old resume Present | User provides a fictional resume dated 2020: Archive Clerk, 2018-Present. Agent reads it in 2026. | Resume evidence retains its 2020 scope; read date is distinct. It does not assert current employment in 2026. Any question about current status is separate from recording historical evidence. |
| Missing original | Legacy paragraph has no source; user asks to organize it. | Retain the fact with source unverified, original unavailable if that is known. No invented user-answer label, URL or original date. AI guesses remain labeled, not added as facts. |
| Resume without repeats | Preferences already say Casey enjoys ceramics; progress has skipped travel. Resume setup. | One useful question follows, without repeating the hobby opening or asking travel. If asking about weekend habits, progress points to home-daily-life; if asking about shows, to preferences. |
| Coverage reflects evidence | Only work and preferences have facts; other modules contain empty template prompts. | Index coverage links only to actual notes or explicitly labeled navigation summaries. Empty domains are not presented as facts or compulsory interview tasks. |

Record actual questions, affected paths, link checks, unchanged unrelated notes/register/export policy and any failures in local test evidence. Do not copy a real profile into fixtures. Do not add raw source transcripts to progress.

## Deterministic versus agent verification

Run `node --test` and `node tools/check-repository.mjs` for storage/schema regressions and public document links. These do not establish factual accuracy, detect stale semantic summaries, or test interview behavior. For a disposable fixture, check local link targets and progress paths directly; evaluate wording and source scope against the table above. No new metadata schema or background crawler is required.
