# T-0007: Hermes Adapter Skeleton (detect, discover)

- Status: todo
- Phase: 0
- Owner: unassigned
- Depends on: T-0001, [adapter-contract.md](../../adapter-contract.md)
- Related specs: [adapter-contract.md](../../adapter-contract.md), [specs/schema/skill.md](../../specs/schema/skill.md)
- Created: 2026-06-14
- Last updated: 2026-06-14

## Goal

Implement the Hermes adapter skeleton in `src/adapters/hermes/` with the adapter interface, `detect()`, and `discover()` capabilities. The adapter must be callable in-process (resolves Q-0006 for v0.1).

## Scope

### In scope
- `src/adapters/base/adapter.ts` — TypeScript interface for all adapters.
- `src/adapters/base/registry.ts` — built-in static adapter registry (Hermes only for v0.1).
- `src/adapters/base/helpers.ts` — shared path detection helpers.
- `src/adapters/hermes/index.ts` — Hermes adapter manifest + factory export.
- `src/adapters/hermes/detect.ts` — detect whether Hermes is available on this machine.
- `src/adapters/hermes/discover.ts` — list Hermes native skills from the skill directory.
- Unit tests with fixtures for Hermes skill directories.
- Test fixtures: `tests/fixtures/skills/hermes-systematic-debugging/` (Hermes-native layout).

### Out of scope
- Import/export (T-0008).
- Adapter configuration file (Q-0007 still open; use sensible defaults for v0.1).

## Execution items

- [ ] Define `Adapter` interface in `src/adapters/base/adapter.ts` per `adapter-contract.md §4`.
- [ ] Define `AdapterDetectResult`, `AdapterDiscoverResult`, and related types.
- [ ] Implement `src/adapters/base/registry.ts`: `getAdapter(name: string): Adapter | undefined`.
- [ ] Implement `src/adapters/hermes/detect.ts`: check for `~/.hermes/` or `HERMES_HOME` env var; return detect result.
- [ ] Implement `src/adapters/hermes/discover.ts`: enumerate Hermes skill directories; return list of native skill refs.
- [ ] Implement `src/adapters/hermes/index.ts`: manifest + `HermesAdapter` class implementing `Adapter`.
- [ ] Verify Q-0006 resolution: adapters run in-process (no subprocess); document in adapter manifest.
- [ ] Write unit tests: `tests/unit/adapters/hermes/detect.test.ts`, `tests/unit/adapters/hermes/discover.test.ts`.

## Acceptance criteria

- [ ] `HermesAdapter` satisfies the `Adapter` interface at compile time.
- [ ] `detect()` returns `available: true` when `~/.hermes/` exists (or `HERMES_HOME` is set).
- [ ] `detect()` returns `available: false` when Hermes home is absent.
- [ ] `discover()` returns a list of native skill refs for a fixture Hermes skill directory.
- [ ] `discover()` returns empty list if Hermes skill directory is empty.
- [ ] `getAdapter("hermes")` returns the Hermes adapter.
- [ ] `getAdapter("nonexistent")` returns `undefined`.
- [ ] All adapter code is isolated: no imports from `src/core/registry/` or `src/cli/`.

## Test items

- [ ] `tests/unit/adapters/hermes/detect.test.ts` — available when dir exists (unit).
- [ ] `tests/unit/adapters/hermes/detect.test.ts` — not available when dir missing (unit).
- [ ] `tests/unit/adapters/hermes/discover.test.ts` — discovers skills from fixture dir (unit).
- [ ] `tests/unit/adapters/hermes/discover.test.ts` — returns empty list for empty dir (unit).
- [ ] `tests/unit/adapters/base/registry.test.ts` — getAdapter happy path (unit).

## Risks / Notes

- Q-0006 (adapter execution model) is resolved for v0.1 as in-process. Document this in the adapter manifest `notes` field.
- Hermes skill directory structure assumed: `~/.hermes/skills/<category>/<skill-name>/SKILL.md`. Verify against actual Hermes layout before implementing `discover.ts`.
- Do not hard-code `~/.hermes/`; use `os.homedir()` + path join.

## References

- [../../adapter-contract.md](../../adapter-contract.md)
- [../../open-questions.md](../../open-questions.md) (Q-0006)
- T-0001
