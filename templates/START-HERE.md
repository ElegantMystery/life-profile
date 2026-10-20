# Continue with your agent

This is your private instance, kept separate from the reusable template files. By default it is the tools checkout's ignored root `private/` folder; it may also be in an explicitly chosen external location. No personal claims have been supplied. Local plaintext files are not encrypted. A cloud-backed assistant may send any content you provide or let it read to its provider. Check that assistant's data handling before continuing. This project makes no model calls itself.

When using the default location, keep the root `/private/` ignore rule intact and verify no private files are tracked before entering personal information. Ignore rules do not prevent force-adds, editor/AI access, cloud sync or whole-folder archives. They also do not protect against cleanup commands that delete ignored files.

Verify this folder's backing storage before entering personal information. The initializer rejects UNC/double-separator path spellings but does not detect mapped Windows drives, mounted network filesystems or cloud-sync folders. A path accepted by the initializer is not proof that storage is local or private.

## Continue after initialization

1. Open this private folder in your existing coding assistant, or explicitly grant access to the specific files you want it to use. Limit private access to this instance rather than granting your whole home directory or every file in the tools checkout.
2. Paste this session-start request, replacing the folder placeholder with your private folder:

```text
Read <private-folder>/ASSISTANT-GUIDE.md and follow its basic setup flow.
Read SETUP-PROGRESS.md for continuity. Do not scan other files or accounts.
Ask which profile files are relevant before reading additional private content.
Ask a few basics and offer the optional IMPORT-GUIDE.md summary step.
Use only context I explicitly select; review proposed Markdown and conflicts.
Show proposals and obtain my confirmation before saving structured records.
Do not export, upload, change agent configuration or act on my behalf.
```

3. Have the assistant identify the loaded guide path and summarize the boundaries. If it cannot access the folder, stop; do not paste the whole private instance into a public project. You may explicitly share only the guide's generic text and selected answers, understanding the provider's processing.
4. Point the assistant to the local Life Profile tools checkout to validate drafts and confirm selected records after your explicit approval. Tools are not copied here. With the default location they are in the parent checkout. Keep command paths explicit; draft review and confirmation require the absolute path to this instance.

## Later sessions

Paste the same request and name the task or module you want to resume. To bring another user-reviewed summary, ask for the optional import step again; compare with current records and review conflicts without reinitializing. This guide is not automatically loaded by every assistant. If your tool supports project-scoped instructions, you may manually add a reference to this guide in a private workspace configuration; review the file and access scope first. Do not put a private path or profile text in a shared repository, and do not edit global configuration merely to connect this instance.

The guide and progress files remain useful when changing assistants. No subscription, server, API key or particular AI vendor is required by Life Profile. Markdown instructions cannot enforce agent behavior or restrict filesystem access.
