# AGENTS.md

## Before Changing Code
- Search for similar existing implementations before writing new code; follow repo patterns over generic best practices.
- Make the smallest change that solves the problem; no unrelated refactors.
- If an architectural/security/data-model decision isn't clearly supported by repo evidence, stop and ask.

## Code Style
- Prefer simple, explicit code over unnecessary OOP, abstractions, or design patterns.
- Organize by feature/domain, not file-size quotas — split only when a module has genuinely mixed responsibilities.
- Keep dependencies explicit and modules independently readable.
- Use `pathlib.Path` and list-form `subprocess` calls — must run on Linux and Windows.
- No new heavy dependencies (torch, docker, redis) without approval.

## Maintainability
- Keep `REPO_MAP.md` current: one line per file describing its purpose. Update in the same commit as any add/remove/rename.
- Treat types, schemas, and existing tests as sources of truth — don't silently change contracts.
- Add/update tests in `tests/`, mirroring source structure (`src/x/y.py` → `tests/x/test_y.py`).
- Run `pytest -q` before declaring work done; do not report complete if tests fail.

## Git
- `main` = stable only, never commit/branch directly. `dev` = integration. `feat/*`/`fix/*` branch from `dev`.
- One logical change per commit: `<scope>: <what changed>`.
- PR into `dev`; merge `dev` → `main` only for tested, stable releases.

## Reporting
- Summarize what changed, why, and which tests were run — every time.