# T-0003: Registry Init / Read / Write

- Status: todo
- Phase: 0
- Owner: unassigned
- Depends on: T-0002, [specs/registry-layout.md](../../specs/registry-layout.md)
- Related specs: [specs/registry-layout.md](../../specs/registry-layout.md), [ADR-0002](../../decisions/0002-v0-1-registry-and-canonical-skill-defaults.md)
- Created: 2026-06-14
- Last updated: 2026-06-14

## Goal

Implement registry filesystem I/O in `src/core/registry/` supporting init, read one skill, write one skill, and list all skills, per the layout spec.

## Scope

### In scope
- `src/core/registry/layout.ts` — all path helper functions.
- `src/core/registry/init.ts` — `initRegistry(root)`.
- `src/core/registry/read.ts` — `readSkill(root, skillId)`, `listSkills(root)`.
- `src/core/registry/write.ts` — `writeSkill(root, skill, content, originalFiles?)`.
- `src/core/registry/status.ts` — `registryExists(root)`.
- `src/core/registry/index.ts` — public barrel.
- `src/core/errors/registry.ts` — `RegistryError`.
- `src/util/fs.ts` — atomic write helper (write-to-temp + rename).
- Unit tests for all operations.
- Integration test: init → write → list → read round-trip.

### Out of scope
- Import pipeline (T-0004).
- CLI wiring (T-0005).
- Removal / soft-delete (deferred to a later task).

## Execution items

- [ ] Implement `src/util/fs.ts`: `atomicWriteFile(path, content)` and `ensureDir(path)`.
- [ ] Implement `src/core/errors/registry.ts` (`RegistryError extends SkillRelayError`).
- [ ] Implement `src/core/registry/layout.ts` with path helpers per spec §11.
- [ ] Implement `src/core/registry/init.ts`:
  - Check if registry already initialized (idempotent).
  - Create registry dir, `skills/` subdir.
  - Write `registry.yaml` atomically.
- [ ] Implement `src/core/registry/status.ts`: `registryExists(root): Promise<boolean>`.
- [ ] Implement `src/core/registry/read.ts`:
  - `readSkill(root, skillId)` — read and parse `skill.yaml` via zod schema; fail with `RegistryError` if not found.
  - `listSkills(root)` — enumerate `skills/*/skill.yaml`; report invalid entries without silently skipping.
- [ ] Implement `src/core/registry/write.ts`:
  - `writeSkill(root, skill, contentMd, originalFiles?)`.
  - Detect existing `skill-id` dir → return conflict, do not overwrite.
  - Atomic writes for `skill.yaml` and `content.md`.
  - Copy original files to `original/` if provided.
  - Update `registry.yaml` `updated_at`.
- [ ] Implement `src/core/registry/index.ts` (public barrel).
- [ ] Write unit tests: `tests/unit/core/registry/`.
- [ ] Write integration test: `tests/integration/registry-roundtrip.test.ts`.

## Acceptance criteria

- [ ] `initRegistry(path)` creates `registry.yaml` and `skills/` directory.
- [ ] `initRegistry` called twice on same path returns without error (idempotent).
- [ ] `writeSkill` creates `skills/<id>/skill.yaml` and `skills/<id>/content.md`.
- [ ] `readSkill` returns the same skill data written by `writeSkill`.
- [ ] `listSkills` returns one entry after one `writeSkill`.
- [ ] `writeSkill` called again with same skill ID returns a conflict result (no overwrite).
- [ ] `readSkill` on non-existent ID throws `RegistryError`.
- [ ] `listSkills` on uninitialized registry throws `RegistryError`.
- [ ] All writes use atomic pattern (write-to-temp + rename).

## Test items

- [ ] `tests/unit/core/registry/layout.test.ts` — path helpers return correct strings (unit).
- [ ] `tests/unit/core/registry/init.test.ts` — creates expected files/dirs in tmp dir (unit).
- [ ] `tests/unit/core/registry/init.test.ts` — idempotent on second call (unit).
- [ ] `tests/unit/core/registry/write.test.ts` — writes skill files atomically (unit).
- [ ] `tests/unit/core/registry/write.test.ts` — conflict on duplicate ID (unit).
- [ ] `tests/unit/core/registry/read.test.ts` — reads and parses valid skill (unit).
- [ ] `tests/unit/core/registry/read.test.ts` — throws on missing skill (unit).
- [ ] `tests/unit/core/registry/read.test.ts` — lists all skills, reports invalid ones (unit).
- [ ] `tests/integration/registry-roundtrip.test.ts` — init → write → list → read (integration).

## Risks / Notes

- Use `os.tmpdir()` for all test registries; never write tests to a real `~/.skillrelay`.
- `registry.yaml` `updated_at` must be updated atomically with each write; consider reading then writing in sequence with error rollback.
- Conflict detection checks directory existence with `fs.stat` before writing — not catch-and-overwrite.

## References

- [../../specs/registry-layout.md](../../specs/registry-layout.md)
- [ADR-0002](../../decisions/0002-v0-1-registry-and-canonical-skill-defaults.md)
- T-0002
