# Phase 1: Enhanced Registry & Hermes Pull

- Status: in-progress
- Goal: Add local search, Hermes pull/import-from-agent, and registry health inspection.

## Task Index

| ID | Title | Status | Depends on |
|---|---|---|---|
| [T-0101](./T-0101-local-search.md) | `skillrelay search` — local registry search | todo | Phase 0 done |
| [T-0102](./T-0102-hermes-pull.md) | Hermes adapter: pull / import-from-agent | todo | Phase 0 done |
| [T-0103](./T-0103-registry-health.md) | `skillrelay doctor` — registry health check | todo | Phase 0 done |
| [T-0104](./T-0104-build-and-publish.md) | Build pipeline & npm publish readiness | todo | Phase 0 done |

## Goals

By the end of Phase 1, SkillRelay should:

1. Allow users to search their local registry by name, tag, category, or free-text.
2. Allow importing a skill from an already-installed Hermes skill (reverse direction: agent → registry).
3. Provide a `doctor` command that checks registry integrity and adapter availability.
4. Produce a publishable npm package with correct `bin/`, `main`, `exports`, and `types` fields.

## References

- [../phase-0/README.md](../phase-0/README.md)
- [../../roadmap.md](../../roadmap.md)
- [../../v0.1-scope.md](../../v0.1-scope.md)
