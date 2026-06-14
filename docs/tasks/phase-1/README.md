# Phase 1: Enhanced Registry & Hermes Pull

- Status: done
- Goal: Add local search, Hermes pull/import-from-agent, and registry health inspection.

## Task Index

| ID | Title | Status | Depends on |
|---|---|---|---|
| [T-0101](./T-0101-local-search.md) | `skillrelay search` — local registry search | done | Phase 0 done |
| [T-0102](./T-0102-hermes-pull.md) | Hermes adapter: pull / import-from-agent | done | Phase 0 done |
| [T-0103](./T-0103-registry-health.md) | `skillrelay doctor` — registry health check | done | Phase 0 done |
| [T-0104](./T-0104-build-and-publish.md) | Build pipeline & npm publish readiness | done | Phase 0 done |

## Goals

By the end of Phase 1, SkillRelay should:

1. Allow users to search their local registry by name, tag, category, or free-text.
2. Allow importing a skill from an already-installed Hermes skill (reverse direction: agent → registry).
3. Provide a `doctor` command that checks registry integrity and adapter availability.
4. Produce a publishable npm package with correct `bin/`, `main`, `exports`, and `types` fields.

## Summary

All Phase 1 tasks are complete. The project has:
- `skillrelay search` — local registry full-text search with scoring (name/summary/description/tags/categories/author), `--tag`, `--category`, `--limit` filters
- `skillrelay import hermes:<name>` — pull from a locally installed Hermes skill into the registry
- `skillrelay doctor` — registry health check (initialized, orphans, corrupt skills, soft-deletes); exits 0 if healthy, 1 if issues
- Build pipeline: tsup produces `dist/`, `bin/skillrelay` is the entry point; `package.json` files list correct
- 6 unit tests (search scoring), 6 integration tests (search flow), 7 E2E tests (search), 5 E2E tests (doctor)

## References

- [../phase-0/README.md](../phase-0/README.md)
- [../../roadmap.md](../../roadmap.md)
- [../../v0.1-scope.md](../../v0.1-scope.md)
