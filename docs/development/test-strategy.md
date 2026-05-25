# Test Strategy

- Status: accepted
- Last reviewed: 2026-05-25
- Depends on: [ADR-0001](../decisions/0001-language-and-stack.md), [project-structure.md](./project-structure.md), [coding-standards.md](./coding-standards.md)

## Purpose

Define how SkillRelay is tested. The strategy is intentionally pragmatic for a CLI-first, filesystem-heavy local tool: prefer **real I/O against temporary directories** over mocking, prefer **few high-signal tests** over coverage chasing, and enforce **task-level test traceability** so every acceptance criterion has at least one named test.

## Scope

All automated testing. Includes:

- unit tests
- integration tests
- end-to-end (CLI) tests
- fixtures and test helpers
- coverage policy
- determinism rules

Excludes: manual QA, performance/load testing (out of scope for v0.1, see §10), and security/penetration testing (covered later by `security-and-trust.md`).

## 1. Test Framework

- **vitest** is the single test runner.
- Configuration lives at `vitest.config.ts` in the repo root.
- Tests run against the **TypeScript source directly** (vitest uses esbuild under the hood); no separate compile step required for testing.
- A single command runs all tiers: `pnpm test`. Subsets: `pnpm test:unit`, `pnpm test:integration`, `pnpm test:e2e`.

## 2. Test Pyramid

| Tier | Purpose | Targets | Speed | Approx share |
|---|---|---|---|---|
| **Unit** | One module, one behavior, no external I/O beyond `os.tmpdir()` | pure functions, zod schemas, ID generation, validators | < 50 ms each | ~60% |
| **Integration** | A small set of cooperating modules within one boundary (core, or one adapter) | registry I/O, import pipeline, single-adapter export | < 500 ms each | ~30% |
| **E2E** | Spawn the actual built CLI against a fresh tmp registry | command-level acceptance | < 5 s each | ~10% |

The percentages are guidelines, not targets to enforce.

## 3. Test Placement and Naming

```text
tests/
├── unit/          mirrors src/ tree exactly
├── integration/   flat, named after the flow under test
├── e2e/           flat, named after the CLI scenario
├── fixtures/      read-only data
└── _support/      helpers (no tests inside)
```

- Test files: `*.test.ts` for unit/integration, `*.e2e.test.ts` for e2e.
- Inside a file: `describe` blocks group by **the function or behavior under test**, not by "happy path / sad path".
- Test names are **sentences in the present tense**, describing observable behavior:
  - ✅ `it("imports a local SKILL.md and records origin metadata", ...)`
  - ❌ `it("test1", ...)` / `it("should work", ...)`

## 4. Filesystem Isolation

This is the most important rule for SkillRelay tests.

- **Every test gets its own temp directory** under `os.tmpdir()`. No exceptions.
- Temp dirs are created by `tests/_support/tmp-registry.ts` and cleaned up in `afterEach`.
- A test must **never** touch the user's real `~/.skillrelay/` directory.
- The registry path used by tests is **always** passed explicitly through CLI flags or function arguments — production defaults (`$HOME` resolution) are unit-tested in isolation.

The CLI runner helper (`tests/_support/run-cli.ts`) forces `SKILLRELAY_HOME` to the temp dir, ensuring even mis-wired tests cannot escape.

## 5. Fixtures

- All fixture data lives under `tests/fixtures/`.
- Fixtures are **read-only at runtime**. A test that needs to mutate a fixture must copy it into its tmp dir first.
- Fixture naming makes intent obvious:
  - `minimal-valid/` — the smallest valid skill
  - `hermes-systematic-debugging/` — a real Hermes skill shape
  - `malformed-metadata/` — for negative tests
  - `missing-content/` — for negative tests
  - `version-collision-a/`, `version-collision-b/` — for conflict tests
- A `tests/fixtures/README.md` documents what each fixture is for.

## 6. Mocking Philosophy

> **Real I/O over mocks, whenever feasible.**

- The filesystem is **not** mocked. Use tmp dirs.
- `Date.now()` and `new Date()` are wrapped through `src/util/time.ts` so tests can inject a fixed clock without mocking globals.
- Hashing functions are deterministic — no mocking needed.
- Adapter detection (looking for an agent's home directory) **is** mocked at the boundary: tests inject a synthetic "agent home" path rather than relying on the host machine's installed agents.
- No HTTP in v0.1. (When Phase 3 adds source fetching, MSW or equivalent will be added — separate decision.)
- `process.exit` is never mocked; the CLI is tested by running it as a subprocess in e2e tests, where exit codes are real.

## 7. Determinism Rules

A test must produce the same result every time, regardless of:

- machine, OS, CPU count, timezone, locale,
- order of test execution,
- presence of installed AI agents on the host,
- network availability.

Concrete rules:

- Inject the clock through `src/util/time.ts`.
- Never assert on absolute timestamps in fixtures; use relative checks or pre-injected fixed times.
- Sort any iteration over directory contents (filesystems return entries in OS-dependent order).
- Set `TZ=UTC` in `vitest.config.ts`.
- Set `LANG=C.UTF-8` in CI invocation.
- Tests must pass when run with `--shuffle`.

## 8. Coverage Policy

- **v0.1 baseline**: 80% lines / 75% branches measured globally by vitest's V8 coverage.
- **Critical-path modules** must reach 95% lines:
  - `src/core/schema/` (zod schemas)
  - `src/core/registry/` (registry I/O)
  - `src/core/id/` (ID generation)
  - `src/core/validate/` (validation rules)
  - `src/core/errors/` (typed errors)
- Coverage is informational in v0.1; CI does not fail on coverage thresholds until v0.2. Rationale: coverage chasing distorts test design during early design churn.
- Files under `src/cli/output/` and `src/util/log.ts` are **exempt** from coverage targets (mostly formatting glue, covered via e2e behavior).

## 9. Snapshot Tests

- Snapshots are **opt-in only** and used sparingly.
- Allowed for: CLI human output formatting, JSON output shape stability.
- **Forbidden for**: zod-validated data shapes (assert structure explicitly), error messages (assert error type + code instead).
- Snapshot files live next to their test (`__snapshots__/`).

## 10. Out-of-Scope for v0.1

These are deliberately deferred:

- Performance tests (e.g. registry with 10k skills).
- Cross-OS matrix in CI (v0.1 ships from macOS/Linux dev; Windows compatibility is best-effort).
- Mutation testing.
- Fuzz testing of zod parsers.
- Network/source-fetch tests (no remote sources in v0.1).

Each is tracked as a candidate addition for Phase 3+.

## 11. Per-Task Test Traceability

Every task ticket has a **Test items** section (see [tasks/README.md](../tasks/README.md)). Each item must be:

- written as a test-name-shaped sentence,
- implemented as exactly one test (occasionally one `describe` block with several `it`s, when grouping is natural).

A task is `done` (Level 4) only when **every** test item has a corresponding test file/case that passes.

Reviewers verify this by greping for the test-name sentences in the PR diff.

## 12. CI Policy (placeholder)

Detailed CI configuration belongs in [release-process.md](./release-process.md) (planned) and `.github/workflows/`. Baseline expectations:

- On every PR: `pnpm install`, `biome check`, `tsc --noEmit`, `pnpm test`.
- e2e tests run **after** unit and integration (fail-fast).
- Coverage is reported but not enforced (per §8).

## 13. Tooling Conventions

- `pnpm test` runs all tiers.
- `pnpm test:watch` runs unit + integration in watch mode (excludes e2e by default).
- `pnpm test:e2e` runs only e2e.
- `pnpm test:coverage` produces an HTML coverage report under `coverage/`.

## 14. Acceptance Criteria (for this doc)

- [ ] Every test tier in §2 has a documented home in `tests/` per [project-structure.md §3](./project-structure.md).
- [ ] The filesystem isolation rule (§4) is encoded in a test helper, not just in this doc.
- [ ] The mapping from "test item on a task ticket" to "actual vitest case" is verifiable by reading the PR.

## 15. Test Items (for this doc)

- [ ] Once T-0001 lands, `tests/_support/tmp-registry.ts` exposes `createTmpRegistry()` with auto-cleanup.
- [ ] Once T-0001 lands, `tests/_support/run-cli.ts` exposes `runCli(args, opts)` returning `{ exitCode, stdout, stderr }`.
- [ ] vitest is configured with `TZ=UTC` and shuffle support.
- [ ] At least one critical-path module reaches the 95% line target by end of Phase 0.

## References

- [coding-standards.md](./coding-standards.md)
- [project-structure.md](./project-structure.md)
- [definition-of-done.md](./definition-of-done.md) (Level 4 + Level 5)
- [../tasks/README.md](../tasks/README.md) (task template Test items section)
- [../v0.1-scope.md §8](../v0.1-scope.md)
