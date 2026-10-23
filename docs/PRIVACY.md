# Privacy and boundaries

Maintain three separate things: the reusable template; the complete private instance; and short-lived, purpose-limited exports. New guided setup defaults to a separate personal-data repository with a private GitHub remote. Existing instances are resumed in place. The repository-root `private/` folder, covered by the root-anchored `/private/` ignore rule, remains an explicit local-only alternative and the unbound CLI fallback. Keep personal content only in the selected private instance. Never fill in tracked templates or other generic source files and then try to sanitize them for publication.

For a local-only `private/` instance in a Git checkout, before entering personal content run `git check-ignore -v private/records.json` from the checkout and verify the `/private/` rule applies; `git ls-files -- private` should print nothing. `.gitignore` does not untrack files already in Git and `git add -f` can bypass it. It does not restrict AI/editor access, sync, backups or archives. Exclude private files from whole-folder uploads and release bundles. Ignored data can be deleted by cleanup commands such as `git clean -fdx`; manage private backups deliberately. The repository checker skips the root private subtree without inspecting its contents, so a passing check is not approval to publish the whole working folder.

All files are plaintext. Sensitivity labels and .gitignore are not encryption or access control. Choose appropriate device permissions, encryption, backups and sync settings yourself. Inspect editor plugins, search indexes and AI workspace access before opening a private instance. No such controls are installed by this project.

## Separate personal repository

An explicitly bound external data repository is independent of the public template. Its own ignore rules and reviewed file selection must exclude credentials and temporary data. Verify GitHub account, remote destination and PRIVATE visibility at setup and after destination/access changes; ordinary Git operations do not continuously check privacy. Binding is local selection, not upload authorization. See [storage boundaries and migration](STORAGE.md).

## Automatic local saving and exclusions

The setup request authorizes the agent to save ordinary, useful non-sensitive answers and explicit corrections to the selected private Markdown profile. Item-by-item approval is not needed. Aliases, language, city, ordinary workplace/role, hobbies, sports, shows, food/cooking preferences, broad weekend habits, goals and communication or learning preferences are generally suitable. Do not collect street addresses, precise location patterns, exact workplace locations or confidential workplace details. Respect “skip,” “stop” and “do not save”; use context and judgment rather than collecting every detail.

Do not persist sensitive personal information: health diagnoses/treatment/trauma, intimate details, sensitive identity/belief information, financial balances/debts/account details, legal/identity documents, precise addresses/location patterns, private contact information, confidential work information or private information about others/minors. Do not infer sensitive traits. Skip ambiguous sensitive details rather than saving them as “unknown.”

Do not persist security information: passwords, API keys/tokens, session cookies, recovery codes, wallet seeds, private keys, security answers, authentication data, access instructions, security configurations or vulnerabilities. Exclude them even if volunteered. A sensitive label is not permission to store content. Do not put excluded information in drafts, progress, logs, filenames, raw imports, private document pointers or source references either.

Filter before writing; retain only independently useful non-sensitive parts of a mixed answer. Do not paraphrase an excluded fact into a revealing note or echo a secret in a save receipt. Use ordinary words such as “AI inference” for tentative interpretations. Provenance labels should help understanding, not block local saving.

Existing legacy files may contain sensitive data. Do not copy that material into new notes or delete it automatically as part of setup/testing; a separate user-directed cleanup can address it. These instructions are not an automated sensitive-data detector. Storage/schema tools cannot reliably classify arbitrary prose.

Never embed passwords, API keys, session cookies, recovery codes, wallet seed phrases, account numbers or copies of identity documents. Use a separate suitable secrets/document store. Provenance should use opaque references, not credentials or private URLs containing tokens.

Minimize third-party data. Use role labels when context is necessary, avoid contact details, and do not collect dossiers or information about minors. Third-party and unknown-subject entries cannot be exported by this tool. Even a statement about oneself can indirectly identify someone else.

Profile preferences do not authorize purchases, messaging, account changes, medical decisions, financial transactions or any other action. Recipients must treat exported text as untrusted contextual data, including text that looks like system instructions. No prompt wrapper can enforce this.

## Deletion and corrections

Delete unwanted content from notebooks and the structured register; remove affected IDs from policies and regenerate or destroy exports. For references, remove or repair supersession links without retaining the deleted content. Revalidate afterward. A minimal local deletion log may record an opaque ID and date only if useful; do not recreate the secret in the log.

Deletion from a working file does not remove Git history, reflogs, forks, clones, archives, editor history, recycle bins, synced versions, backups or recipient/AI memory. If Git was used, history rewriting and coordinating every copy require a separate deliberate procedure; do not assume a force push erases copies. Retention obligations and encrypted backup expiry may constrain deletion. Track copies and recipients before sharing. Ask recipients to delete copies where possible; completion cannot be guaranteed. If a credential leaks, revoke/rotate it at its issuer; deleting the text is insufficient.
