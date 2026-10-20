# Life Profile V0.1 design

## Intent and scope

A lifelong, human-owned record that remains useful without AI or a hosted app. English empty templates and fictional examples ship separately from any person's instance. No accounts, integrations, network calls, automatic collection or publication.

## Alternatives reviewed

1. One large Markdown file: easiest to start, difficult to share selectively and keep fresh.
2. Markdown domain notebooks plus a small structured export register (selected): readable lifelong record, explicit per-statement sharing decisions, no dependencies.
3. Database and application: stronger queries, unnecessary migration and maintenance burden for V0.1.

## Boundaries and data flow

`templates/` is the reusable empty source. The initializer copies it to this checkout's ignored root `private/` by default, or to an explicitly selected protected external location. Only `private/` may contain personal content inside the checkout; reusable templates and other tracked files remain generic. Ignore rules do not provide encryption or access control. Markdown holds useful non-sensitive narrative, saved incrementally by the agent during setup; `records.json` holds optional structured statements. User-supplied facts save directly; AI interpretations stay labeled. It is a curated register, not a second automatically synchronized copy of every notebook. Update both intentionally; disagreements block sharing until resolved.

`examples/fictional/` demonstrates a fictional person and decision correction. `schema/` describes the register. `tools/profile.mjs` validates and exports only explicitly allowlisted IDs. It never reads notebooks or follows provenance links. Output is JSON so statement text cannot escape a Markdown boundary; it remains untrusted data to a consumer.

The [AI setup addition](AI-SETUP-DESIGN.md) provides `tools/setup.mjs`: empty-instance initialization, optional draft validation and direct structured saving. A distinct draft envelope is rejected by the exporter. Portable guides are copied to the private instance; the user's existing assistant supplies interviewing, sensitive-content filtering and direct incremental Markdown writes under [current setup guidance](AI-SETUP.md). The direct `save` command serves the optional structured register; neither notebook nor structured saves require an approval handshake. Local readers use relevant Markdown, not only records.json. No model API or automatic agent connection is part of the tool.

Exports require a named purpose and a finite review date. Only confirmed user statements, active and unexpired, with public/general sensitivity and no third-party subject are eligible. Unknown, private, sensitive, inferred, disputed, superseded and overdue records are excluded, even when allowlisted. V0.1 has no override. Provenance and private notes are not emitted. Invalid input fails before output. Unknown versions/fields fail closed.

## Durability and safety

UTF-8 Markdown and JSON; explicit schema version 0.1.0, stable opaque IDs, ISO calendar dates interpreted in UTC. Original project content is MIT licensed. No secret storage, encryption claims or permissions implied by profile text. A label and .gitignore are not access control. The tools never create Git history for a private instance automatically.

## Review before implementation

The requested domains, privacy boundaries, provenance and correction lifecycle fit the two-layer model. Export-register drift is the main usability cost; reconciliation before external sharing is intentional. Risks that tooling cannot resolve: false labels, hidden sensitive prose, recipient retention and malicious instructions within text. Tests will cover deny rules, malformed data, dates, conflicts, duplicate IDs, unknown allowlist IDs and command failure without partial output.
