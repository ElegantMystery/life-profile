# Register schema

[profile.schema.json](profile.schema.json) and [policy.schema.json](policy.schema.json) use JSON Schema 2020-12. The dependency-free local validator enforces these fields plus calendar validity, date ordering, unique IDs and supersession integrity; no remote schema is fetched. External schema validators may require date-format assertion enabled and cannot replace the semantic checks.

Every entry requires every listed field; use null only for review_due and expires. Unknown keys and versions are rejected.

| Field | Meaning |
| --- | --- |
| id | Stable lowercase opaque ID, letters/digits/hyphens, starts with a letter, at most 64 characters |
| domain | One of the 13 schema domains; basic.md uses stable-profile |
| statement | One nonempty claim in the person's wording; not a command grant |
| source.kind | user_statement, ai_inference, third_party_report or unknown |
| source.reference | Minimal nonempty private provenance description or opaque reference; never followed or exported |
| confirmation | pending, confirmed or disputed; evidence state, not a permission gate |
| sensitivity | unknown, public, general, private or sensitive; a label, not protection |
| subject | self, third_party or unknown |
| status | active, superseded or archived |
| created / updated | Real YYYY-MM-DD dates; updated must not precede created |
| review_due / expires | Real YYYY-MM-DD dates no earlier than created, or null; due/expired on that date |
| supersedes | Unique IDs of existing superseded entries; no self-reference or cycles; target cannot be newer |

For direct saves, confirmed means the person supplied the statement; no extra wording approval is required. Legacy records may use confirmed for previously reviewed inferences, but source kind still controls interpretation and export eligibility. Confirmation never turns an inference into a user statement or establishes objective truth. Records lacking a review date remain valid for private storage but cannot be exported.

Policy: schema_version = 0.1.0, a nonempty purpose, and allow_ids (unique known record IDs). No wildcard or domain-wide selection. Empty profiles and empty allowlists are valid.

Use [the fictional register](../examples/fictional/records.json) as a shape example, not as content for your profile. Blank [records](../templates/records.json) contain no claims. See [export eligibility](../docs/EXPORTS.md).

## Local saving

Markdown notebooks are the primary usable profile for local assistance. The optional register is saved directly with `tools/setup.mjs save`; no human approval token is required. Supplied user statements become `confirmed`, while AI/third-party/unknown-source claims remain `pending` with their original source kind. Pending inference does not prevent local storage as an inference. These labels do not grant external sharing permission. The schema retains legacy sensitivity values for compatibility; new saves reject sensitive/unknown classifications and the agent must exclude sensitive/security prose before writing inputs.
