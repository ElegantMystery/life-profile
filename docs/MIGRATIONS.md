# Versioning and portability

Project and register version: 0.1.0. Each register and export policy explicitly declares `schema_version`. Unknown versions fail validation; there is no silent coercion or automatic migration.

Keep Markdown as UTF-8 and JSON as UTF-8 without comments. IDs are stable, lowercase opaque identifiers; do not encode names or dates of birth. All date-only values use YYYY-MM-DD and UTC boundaries. Null review/expiry values mean unspecified, not permanently safe to share.

For a future migration: record source/target versions; create a protected backup with a deletion schedule; convert a copy; preserve IDs, provenance, uncertainty, confirmation and supersession; validate and compare entry counts and exclusions; inspect diffs; test exports; then replace the active instance. Retain the original until verified and deliberately expire its backup. A migration must never promote inference to fact or private to shareable.

No migration command is shipped because this is the first version. JSON Schema describes shape; the local validator additionally checks dates, ordering and references. New domains or fields require a versioned schema/tool update. Human notebooks remain usable independently of these tools.
