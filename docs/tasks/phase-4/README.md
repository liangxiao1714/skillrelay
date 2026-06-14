# Phase 4: Trust Management & Batch Sync

- Status: in-progress
- Goal: Add trust level management and batch agent sync capabilities.

## Task Index

| ID | Title | Status | Depends on |
|---|---|---|---|
| T-0401 | `skillrelay trust <skill-id> <level>` — set skill trust level | in-progress | Phase 3 done |
| T-0402 | `skillrelay sync <agent>` — batch export all active skills to an agent | in-progress | Phase 3 done |
| T-0403 | Unit + E2E tests for trust and sync commands | in-progress | T-0401, T-0402 |

## Goals

By the end of Phase 4, SkillRelay should:

1. Allow users to mark skills as trusted, community, untrusted, or unknown.
2. Allow batch exporting all active registry skills to a given agent in one command.
3. Have tests for new commands and ≥ 93% coverage maintained.

## References

- [../phase-3/README.md](../phase-3/README.md)
- [../../roadmap.md](../../roadmap.md)
