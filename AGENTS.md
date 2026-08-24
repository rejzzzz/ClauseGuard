# AGENTS.md

## Rules
- Understand existing code before changing it; search for similar implementations first.
- Follow existing repository patterns over generic best practices.
- Prefer simple, explicit code over unnecessary OOP, abstractions, interfaces, or design patterns.
- Keep modules cohesive and dependencies explicit; optimize for local reasoning.
- Organize code by feature/domain; don't split files just to meet a line-count rule.
- Make the smallest change necessary; avoid unrelated refactors.
- Preserve existing behavior unless explicitly asked to change it.
- Treat types, schemas, contracts, and tests as sources of truth.
- Add/update tests for behavior changes.
- Run `pytest -q` before declaring work complete.
- Do not add heavy dependencies without approval.
- Use `pathlib.Path` and list-form `subprocess` calls; support Linux and Windows.

## Workflow
1. Explore → identify relevant code, tests, types, and existing patterns.
2. Plan → identify the smallest set of files that need changing.
3. Implement → follow existing conventions.
4. Verify → run tests and inspect the final diff.
5. Report → summarize changes and tests run.

## Decisions
- Prefer fewer files, fewer abstractions, and less behavioral change.
- If repository evidence is insufficient for an architectural/security/data-model decision, ask before proceeding.

## Git
- `main` = stable; `dev` = integration; `feature/*` and `fix/*` branch from `dev`.
- Merge feature/fix → `dev`; merge `dev` → `main` only for stable releases.