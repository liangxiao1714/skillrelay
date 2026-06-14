# Phase 3: Coverage & Build Verification

- Status: in-progress
- Goal: Improve test coverage on uncovered adapter modules, verify the build pipeline, and update documentation.

## Task Index

| ID | Title | Status | Depends on |
|---|---|---|---|
| T-0301 | Unit tests: adapter registry (registerAdapter/getAdapter/listAdapterNames) | in-progress | Phase 2 done |
| T-0302 | Unit tests: hermes/validate.ts (validateForHermes) | in-progress | Phase 2 done |
| T-0303 | Unit tests: hermes/import.ts (importHermesSkill) | in-progress | Phase 2 done |
| T-0304 | Unit tests: adapter class manifests (HermesAdapter, ClaudeAdapter) | in-progress | Phase 2 done |
| T-0305 | Build verification: tsup build + binary smoke test | todo | Phase 2 done |
| T-0306 | Update roadmap and Chinese README | todo | T-0305 |

## Goals

By the end of Phase 3, SkillRelay should:

1. Have ≥ 88% test coverage across all non-CLI modules.
2. Have a verified, buildable npm package (`pnpm build` succeeds, `node dist/cli/index.js --version` works).
3. Have an updated roadmap and up-to-date Chinese README.

## References

- [../phase-2/README.md](../phase-2/README.md)
- [../../roadmap.md](../../roadmap.md)
