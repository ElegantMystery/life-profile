# Connect a project to Life Profile

Codex CLI and Claude Code can discover a small project instruction file on every fresh launch. Both examples below use a pinned local instruction checkout and an existing filesystem profile. Install the binding only after the user chooses the project, source, destination and grant. Settings persist on that machine in that project. A hosted model may process the notes its CLI reads. Follow [setup](AI-SETUP.md) to create a new profile.

## Prepare the binding once

1. Choose a dedicated, private project directory outside both the template checkout and the data instance. Use a local Git project with no publishing remote for the examples below. Keep real paths, grants and private repository names out of shared files.
2. Verify the selected template or fork and its full reviewed commit against trusted source metadata. Keep an operator-controlled local clone containing that commit. Capture its canonical absolute root and exact credential-free origin URL. A matching local origin string alone cannot authenticate a newly acquired clone. See [source selection and versioning](INSTRUCTION-SOURCE.md).
3. Review the [document reader](../examples/hosts/read-pinned-guide.sh) and install a stable ordinary-file copy outside editable project and data directories. It requires a POSIX shell and Git with `ls-tree --format` (tested with Git 2.43). The reader checks the declared checkout root, origin, full commit and ordinary documentation blob. It works offline from the verified clone and reads committed bytes. It does not fetch, install permissions, validate private data, or run setup tools from the working tree.
4. Copy the [binding template](../examples/hosts/binding.md) into the host file below. Replace all five placeholders. Preserve shell argument boundaries and escape any literal single quote in a value. Use the selected existing data directory, separate from the source. Confirm the grant with the user. The example grants project-scoped read-only assistance. For a different scope, use the table below and the [storage checks](STORAGE.md).
5. From the intended project, run the filled-in reader command for each of the three startup documents. Confirm it exits successfully and the host can read the intended instance, marker and relevant ordinary files. Resolve mismatched tool bindings, missing permissions or unexpected file types before activation. Review any helper used on private data against the selected source commit.

| Host | What to install | Start a fresh session |
| --- | --- | --- |
| Codex CLI | In the dedicated project root, put the filled binding in `AGENTS.md`. Preserve existing instructions if present. A same-directory `AGENTS.override.md` takes precedence, and the instruction-size budget can truncate a binding. | From that root, run `codex`. Confirm that the host can invoke the reader and access the selected data under its actual tool permissions. [Codex project instructions](https://developers.openai.com/codex/guides/agents-md) |
| Claude Code | Put the filled binding in project-root `CLAUDE.local.md`. Preserve existing local instructions and exclude this file from Git. Use a dedicated project to avoid changing discovery of other project instructions. | From that root, run `claude` with local project instructions enabled. Review requests for shell/file access to the specific reader, source and data paths. [Claude Code project instructions](https://code.claude.com/docs/en/memory) |

These files supply locators and the user's grant. The selected guide owns behavior. Host tool restrictions still apply. The examples cover only the named CLI, project and filesystem backend. Persisting the file neither installs a global hook nor activates a different client or device.

## Choose the scope

| Choice | What the host needs and may do |
| --- | --- |
| Read-only | Read only relevant notes after source and destination checks. Preserve notebooks, progress and settings during use. |
| Local read/write | Obtain the user's grant to make and verify eligible changes in the selected filesystem instance. Replace the read-only sentence with that grant. Keep uploads and sync off for local-only use. |
| Filesystem with private Git sync | Name the separate verified PRIVATE repository and authorized sync actions explicitly. Follow the guide's concurrency, review, bounded retry and read-back rules. Report local saves separately from verified sync. |
| Connector-only | These shell examples require local files. Use the [connector binding and guarded storage procedure](STORAGE.md#connector-only-private-repository) with the selected source, verified account, private owner/name, branch, actual read or guarded-write grant, and a supported persistent host instruction mechanism. A connected account alone supplies no startup instruction. |
| Explicit branch tracking | The supplied reader takes only immutable commits. When the user explicitly selects tracking, the host must resolve the selected branch against the verified repository once at startup and pass that one full commit for every read in the session. Keep the selected source, backend and existing grants. |

## Verify the user's installation

Use a fictional instance first. Put a distinctive harmless preference in its relevant notebook. Close the setup conversation. Launch the host from the configured project and ask an ordinary question where the preference matters, without naming Life Profile or repeating any location. Check the actual tool activity for the selected pin, marker and relevant notebook, and confirm the answer uses the preference. Only then report that host and project scope as verified. Record any authorized activation observation under the [shared guide](guides/ASSISTANT-GUIDE.md#activate-ongoing-use-during-setup).

Repeat from a separate empty project with its own Git root and no inherited binding. No fixture reads should occur. An absent startup file cannot report its own absence. If a fresh configured launch shows no binding or reads, report **activation pending** from the setup or verification session. If the file loads but a pin, data path or tool permission fails, the agent should report the specific blocker, continue the ordinary task and leave profile use pending. Recheck after changing the host, paths, version or scope.

## Reproduce the CLI integration checks

On Linux with Python 3, Node 20+, Git and both CLIs installed, run this command from a committed checkout. Choose a temporary directory outside Git trees that both CLI environments can read.

```sh
TMPDIR=/var/tmp python3 tests/manual/host-discovery.py
```

The [integration check](../tests/manual/host-discovery.py) starts real CLI processes with isolated homes, distinct project files and a scripted model on loopback. Each fresh process gets only an ordinary pottery question. No provider credential is needed. The script verifies initial binding discovery and tool results for the three selected documents, the instance marker, and a randomized fictional notebook value. Separate runs check absence in an empty project and an unavailable source pin before any notebook read. The Claude Code permission control also withholds shell approval and checks for a tool denial.

Tested with Codex CLI 0.154.0 and Claude Code 2.1.241. These checks exercise the host's discovery and tool transport. Use the ordinary-task check above to assess an actual model's decisions and the user's installation. The [reader regression](../tests/host-binding.test.mjs) also checks dirty worktrees, Git replacements, wrong origins, missing objects, symlinks and unexpected document paths.
