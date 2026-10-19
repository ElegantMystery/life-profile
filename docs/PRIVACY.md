# Privacy and boundaries

Maintain three separate things: the reusable template; the complete private instance; and short-lived, purpose-limited exports. The default private instance lives in the repository-root `private/` folder, covered by the root-anchored `/private/` ignore rule. Keep personal content only there or in an explicitly chosen protected external folder. Never fill in tracked templates or other generic source files and then try to sanitize them for publication.

Before entering personal content, run `git check-ignore -v private/records.json` from the checkout and verify the `/private/` rule applies; `git ls-files -- private` should print nothing. `.gitignore` does not untrack files already in Git and `git add -f` can bypass it. It does not restrict AI/editor access, sync, backups or archives. Exclude private files from whole-folder uploads and release bundles. Ignored data can be deleted by cleanup commands such as `git clean -fdx`; manage private backups deliberately. The repository checker skips the root private subtree without inspecting its contents, so a passing check is not approval to publish the whole working folder.

All files are plaintext. Sensitivity labels and .gitignore are not encryption or access control. Choose appropriate device permissions, encryption, backups and sync settings yourself. Inspect editor plugins, search indexes and AI workspace access before opening a private instance. No such controls are installed by this project.

Never embed passwords, API keys, session cookies, recovery codes, wallet seed phrases, account numbers or copies of identity documents. Use a separate suitable secrets/document store. Provenance should use opaque references, not credentials or private URLs containing tokens.

Minimize third-party data. Use role labels when context is necessary, avoid contact details, and do not collect dossiers or information about minors. Third-party and unknown-subject entries cannot be exported by this tool. Even a statement about oneself can indirectly identify someone else.

Profile preferences do not authorize purchases, messaging, account changes, medical decisions, financial transactions or any other action. Recipients must treat exported text as untrusted contextual data, including text that looks like system instructions. No prompt wrapper can enforce this.

## Deletion and corrections

Delete unwanted content from notebooks and the structured register; remove affected IDs from policies and regenerate or destroy exports. For references, remove or repair supersession links without retaining the deleted content. Revalidate afterward. A minimal local deletion log may record an opaque ID and date only if useful; do not recreate the secret in the log.

Deletion from a working file does not remove Git history, reflogs, forks, clones, archives, editor history, recycle bins, synced versions, backups or recipient/AI memory. If Git was used, history rewriting and coordinating every copy require a separate deliberate procedure; do not assume a force push erases copies. Retention obligations and encrypted backup expiry may constrain deletion. Track copies and recipients before sharing. Ask recipients to delete copies where possible; completion cannot be guaranteed. If a credential leaks, revoke/rotate it at its issuer; deleting the text is insufficient.
