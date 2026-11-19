# Life Profile V0.1 design

## Intent and scope

A lifelong, human-owned record that remains useful without AI or a hosted app. English empty templates and fictional examples ship separately from any person's instance. No accounts, integrations, network calls, automatic collection or publication.

## Alternatives reviewed

1. One large Markdown file: easiest to start, difficult to share selectively and keep fresh.
2. Markdown domain notebooks plus a small structured export register (selected): readable lifelong record, explicit per-statement sharing decisions, no dependencies.
3. Database and application: stronger queries, unnecessary migration and maintenance burden for V0.1.

## Boundaries and data flow

`templates/` is the reusable empty source. Guided setup defaults to a separate private personal repository: filesystem mode initializes and binds a local instance, while the portable connector workflow verifies a remote repository/branch without a clone. The CLI itself remains filesystem-only; see [storage](STORAGE.md#connector-only-private-repository). The CLI's unbound fallback remains this checkout's ignored root `private/`, also available as an explicit local-only choice. Only `private/` may contain personal content inside the checkout; reusable templates and other tracked files remain generic. Ignore rules do not provide encryption or access control. Markdown holds useful non-sensitive narrative, saved incrementally by the agent during setup; `records.json` holds optional structured statements. User-supplied facts save directly; AI interpretations stay labeled. It is a curated register, not a second automatically synchronized copy of every notebook. Update both intentionally; disagreements block sharing until resolved.

`examples/fictional/` demonstrates a fictional person and decision correction. `schema/` describes the register. `tools/profile.mjs` validates and exports only explicitly allowlisted IDs. It never reads notebooks or follows provenance links. Output is JSON so statement text cannot escape a Markdown boundary; it remains untrusted data to a consumer.

The [setup workflow](AI-SETUP.md) uses `tools/setup.mjs`: empty-instance initialization, optional draft validation and direct structured saving. A distinct draft envelope is rejected by the exporter. Shared guides stay in the selected template or fork; the host retains the verified instruction version and data locator separately; the user's existing assistant supplies interviewing, sensitive-content filtering and direct incremental Markdown writes under [current setup guidance](AI-SETUP.md). The direct `save` command serves the optional structured register; neither notebook nor structured saves require an approval handshake. Local readers use relevant Markdown, not only records.json. No model API or automatic agent connection is part of the tool.

Exports require a named purpose and a finite review date. Only confirmed user statements, active and unexpired, with public/general sensitivity and no third-party subject are eligible. Unknown, private, sensitive, inferred, disputed, superseded and overdue records are excluded, even when allowlisted. V0.1 has no override. Provenance and private notes are not emitted. Invalid input fails before output. Unknown versions/fields fail closed.

## Compact context for ordinary tasks

After startup verification, a filesystem agent can request a short JSON view of the notebooks relevant to the current task. For example, a learning question might use:

```sh
node tools/setup.mjs summary --dest "/absolute/path/to/selected/profile" --domains learning-skills,preferences
```

Omit `--dest` only when the tools checkout is bound to the selected instance. Choose one or more of `preferences`, `learning-skills` and `goals-projects`. Each result gives a path relative to the instance and an excerpt from the primary Markdown. The helper computes the view on each call and writes no file. Its output is private profile data.

For frequently useful, non-sensitive facts, the first section immediately after the notebook title may look like this fictional example:

```markdown
# Learning and skills

## Quick context

- Currently practicing wheel throwing.

Source: user answer

## Notes
```

Keep the original fact in this section and edit it here when corrected. Select one to three single-line bullets with shared provenance and a final single-line `Source: …` label. Keep uncertainty, scope and dates with the facts they qualify. The excerpt limit is 600 UTF-16 code units per notebook. If the section is absent, ambiguous, too large or uses another layout, `excerpt: null` directs the caller to the notebook when detail is needed. Existing free-form notes can keep their layout. A connector-only agent continues to read relevant notebooks at its verified commit.

## Durability and safety

UTF-8 Markdown and JSON; explicit schema version 0.1.0, stable opaque IDs, ISO calendar dates interpreted in UTC. Original project content is MIT licensed. No secret storage, encryption claims or permissions implied by profile text. A label and .gitignore are not access control. The tools never create Git history for a private instance automatically.

## Tradeoffs and limitations

The requested domains, privacy boundaries, provenance and correction lifecycle fit the two-layer model. Export-register drift is the main usability cost; reconciliation before external sharing is intentional. Risks that tooling cannot resolve: false labels, hidden sensitive prose, recipient retention and malicious instructions within text. See [testing and release](TESTING.md) for automated coverage, agent acceptance scenarios and publication checks. Standard JSON parsing accepts duplicate object keys with the last value winning; the validator is not a hardened parser for adversarial input.

## Centralized behavior and data-only instances

See [instruction-source selection](INSTRUCTION-SOURCE.md). `docs/guides/` holds the canonical generic guidance. Public legacy guide paths are compatibility pointers, never part of the new initializer manifest. Private templates contain headings, index links, progress fields, the record register, export allowlist and the unchanged instance marker, not behavioral instructions. Local empty staging/note folders do not need to exist in Git until used.

Customization is a template fork, with deliberate upstream integration and no private facts in a public fork. Guided setup defaults to a verified immutable source commit; tracking is an explicit opt-in resolved once per session. Host startup plumbing is external and must be tested in its actual scope. The project ships no host resolver, credential store, automatic migration or persistence hook. Existing private guides and data remain unchanged until a requested reviewed migration.
