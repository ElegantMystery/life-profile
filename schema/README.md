# Register schema

[profile.schema.json](profile.schema.json) and [policy.schema.json](policy.schema.json) use JSON Schema 2020-12. The dependency-free local validator enforces these fields plus calendar validity, date ordering, unique IDs and supersession integrity; no remote schema is fetched. External schema validators may require date-format assertion enabled and cannot replace the semantic checks.

Every entry requires every listed field; use null only for review_due and expires. Unknown keys and versions are rejected.

| Field | Meaning |
| --- | --- |
| id | Stable lowercase opaque ID, letters/digits/hyphens, starts with a letter, at most 64 characters |
| domain | One of the 13 notebook filename stems listed in the schema |
| statement | One nonempty claim in the person's wording; not a command grant |
| source.kind | user_statement, ai_inference, third_party_report or unknown |
| source.reference | Minimal nonempty private provenance description or opaque reference; never followed or exported |
| confirmation | pending, confirmed or disputed |
| sensitivity | unknown, public, general, private or sensitive; a label, not protection |
| subject | self, third_party or unknown |
| status | active, superseded or archived |
| created / updated | Real YYYY-MM-DD dates; updated must not precede created |
| review_due / expires | Real YYYY-MM-DD dates no earlier than created, or null; due/expired on that date |
| supersedes | Unique IDs of existing superseded entries; no self-reference or cycles; target cannot be newer |

Confirmed means the person reviewed the wording, not that an inference is transformed into a user statement or that a claim is objectively verified. Records lacking a review date remain valid for private storage but cannot be exported.

Policy: schema_version = 0.1.0, a nonempty purpose, and allow_ids (unique known record IDs). No wildcard or domain-wide selection. Empty profiles and empty allowlists are valid.

Use [the fictional register](../examples/fictional/records.json) as a shape example, not as content for your profile. Blank [records](../templates/records.json) contain no claims. See [export eligibility](../docs/EXPORTS.md).
