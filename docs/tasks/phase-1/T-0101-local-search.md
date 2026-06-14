# T-0101: `skillrelay search` — Local Registry Search

- Status: todo
- Phase: 1
- Owner: SkillRelay maintainers
- Depends on: Phase 0 complete
- Created: 2026-06-14
- Last updated: 2026-06-14

## Goal

Implement `skillrelay search <query>` that searches the local registry by name, tag, category,
author, or summary text and returns ranked results.

## Acceptance Criteria

- [ ] `skillrelay search <query>` searches `name`, `summary`, `tags`, `categories`, `author`.
- [ ] Partial and case-insensitive matching is supported.
- [ ] Returns a human-readable table (skill ID, name, tags, match reason).
- [ ] `--json` flag returns a JSON array of matching skill objects.
- [ ] `--tag <tag>` narrows results to skills with that tag.
- [ ] `--category <cat>` narrows by category.
- [ ] Exits 0 when results found; exits 0 with "No skills found" message when empty.
- [ ] Exits 2 if registry not initialized.
- [ ] Unit tests for search matching logic (pure function, no filesystem).
- [ ] Integration test: search returns expected results after import.
- [ ] E2E test: `skillrelay search` from CLI.

## Scope

### In scope
- `src/core/search/` module: `searchSkills(root, query, options)`.
- `src/cli/commands/search.ts` CLI command.
- Simple string-match scoring (no fuzzy match in v1).

### Out of scope
- Full-text index (deferred to Phase 3).
- Remote / SkillHub search.

## Implementation Notes

```
src/core/search/
  index.ts        — searchSkills(root, query, options): Promise<SearchResult[]>
  match.ts        — pure scoring functions (unit-testable without I/O)
  schema.ts       — SearchOptions, SearchResult types
src/cli/commands/search.ts
tests/unit/core/search/search.test.ts
tests/integration/search-flow.test.ts
tests/e2e/search.e2e.test.ts
```

## Definition of Done

All acceptance criteria checked, all tests passing, `pnpm typecheck` and `pnpm lint` clean.
