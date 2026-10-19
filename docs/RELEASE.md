# Public release review

- [x] Owner selected MIT; see [LICENSE](../LICENSE) for attribution and license terms.
- [x] Recheck upstream files and license notices at pinned commits; no upstream material was copied.
- [ ] Publish from a fresh copy of the generic template, never from a private instance or a whole working folder containing `private/`.
- [ ] Verify `/private/` is ignored and `git ls-files -- private` is empty; inspect archive contents because ignore rules do not filter ordinary zip tools. The repository checker deliberately skips root `private/`.
- [ ] Inspect all files, hidden files, Git history, examples, exported bundles and release archives.
- [ ] Run tests and local link checks; scan for secrets, identifiers and private URLs; inspect manually.
- [ ] Confirm every example is clearly fictional, with no imported real-world profile content.
- [ ] Check schema/tool agreement and fail-closed behavior on new fields and versions.
- [ ] Document supported runtime, version changes and known limits.
- [x] Owner explicitly authorized a new public GitHub repository for this generic project.

Repeat unchecked checks for every release. Publish only the generic source tree: root documentation and license, docs, templates, fictional examples, schema, tools and tests. Exclude private instances, exports, backups, local archives, credentials and machine-specific files. Verify the remote is public, its default branch and commit match the reviewed local commit, and LICENSE is recognized as MIT after publishing. No CI workflow is configured in V0.1; the documented local test and hygiene commands are the release checks.

V0.1 limits: no encryption, authentication, automatic sync, semantic conflict detection, full data-loss prevention, integrations, migration engine or guaranteed deletion. Not a medical, financial or legal record system. The optional domains are prompts for personal organization, not professional guidance.
