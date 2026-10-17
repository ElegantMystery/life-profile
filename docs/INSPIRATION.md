# Inspiration and upstream license observations

Reviewed and rechecked 2026-10-17 through public GitHub pages and raw files at the pinned commits below. All five reference files were accessible; four standalone MIT license files were accessible. No upstream code or text was copied; this scaffold's wording and implementation are original. Recheck notices before any future reuse.

| Reference and inspected file | Idea considered | License observation |
| --- | --- | --- |
| [Personal Context Portfolio README](https://github.com/nlwhittemore/personal-context-portfolio/blob/12d4f1fc6de9ea5dc88b2d35bbda6d89af2e85fb/README.md) | Separate context by subject; keep it portable | README states MIT. A raw LICENSE request at the pinned commit returned 404; standalone notice not verified. Avoid reuse until clarified. |
| [Consulting OS README](https://raw.githubusercontent.com/cofoid/consulting-os-template/3c29e25a34a5773588f529d41bbde50e74352b23/README.md) | Start empty and disclose only relevant modules | [LICENSE](https://raw.githubusercontent.com/cofoid/consulting-os-template/3c29e25a34a5773588f529d41bbde50e74352b23/LICENSE) says MIT, copyright 2026 Sean Cofoid. |
| [you.md README](https://raw.githubusercontent.com/brainsparker/you.md/18b31a37fdf92b583d5e5fe23894aefe27d07e6a/README.md) | User-owned portable context | [LICENSE](https://raw.githubusercontent.com/brainsparker/you.md/18b31a37fdf92b583d5e5fe23894aefe27d07e6a/LICENSE) says MIT, copyright 2026 sparker. |
| [OpenClaw USER template](https://github.com/openclaw/openclaw/blob/513e6bffc3ddf0412ebe5e1be5aba9a2d4df7f32/docs/reference/templates/USER.md) | Dated preferences and explicit supersession | [repository LICENSE](https://raw.githubusercontent.com/openclaw/openclaw/513e6bffc3ddf0412ebe5e1be5aba9a2d4df7f32/LICENSE) says MIT, copyright 2026 OpenClaw Foundation. |
| [Telos personal template](https://github.com/danielmiessler/Telos/blob/e5cc4d6eb93d2471cc7e4f52277dfe393ddf5d33/personal_telos.md) | Connect values, goals, projects and reflection | [LICENSE](https://raw.githubusercontent.com/danielmiessler/Telos/e5cc4d6eb93d2471cc7e4f52277dfe393ddf5d33/LICENSE) says MIT, copyright 2025 Daniel Miessler. Personal anecdotes were not reused. |

The selected design adds strict per-statement provenance, default-deny exports, optional life domains and separation from action authority. It intentionally has no vendor-specific agent instruction files or automatic integrations. Upstream license observations are not a license grant for this project; see [decision note](../LICENSE-DECISION.md).
