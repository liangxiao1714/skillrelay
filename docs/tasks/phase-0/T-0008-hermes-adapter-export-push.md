# T-0008: Hermes Adapter — Export / Push

- Status: todo
- Phase: 0
- Owner: unassigned
- Depends on: T-0003, T-0007
- Related specs: [adapter-contract.md](../../adapter-contract.md), [specs/cli-commands.md](../../specs/cli-commands.md)
- Created: 2026-06-14
- Last updated: 2026-06-14

## Goal

Implement Hermes adapter `import_skill()` (Hermes → registry) and `export_skill()` (registry → Hermes), wire up `skillrelay export <skill-id> hermes` CLI command, and make the full v0.1 end-to-end flow work.

## Scope

### In scope
- `src/adapters/hermes/import.ts` — convert Hermes-native skill dir → canonical Skill record.
- `src/adapters/hermes/export.ts` — convert canonical Skill → Hermes-native skill dir; supports dry-run and `--overwrite`.
- `src/adapters/hermes/status.ts` — check if a canonical skill is present in Hermes.
- `src/adapters/hermes/validate.ts` — check if a canonical skill is compatible with Hermes.
- `src/cli/commands/export.ts` — CLI wiring for `skillrelay export <id> <agent>`.
- Update `src/adapters/hermes/index.ts` with full capability manifest.
- Unit and integration tests with fixture Hermes directories.
- Resolves Q-0008 (destructive operation behavior): default is refuse + require `--overwrite` flag.
- Resolves Q-0012 (conflict resolution UX): report conflict details and exit; no interactive prompt in v0.1.

### Out of scope
- Hermes pull/sync (v0.1.1 or later).
- Other adapters.

## Execution items

- [ ] Implement `src/adapters/hermes/import.ts`: read Hermes `SKILL.md`, map to canonical record.
- [ ] Implement `src/adapters/hermes/export.ts`:
  - Convert canonical Skill to Hermes-native dir layout.
  - Support `--dry-run` (return file list without writing).
  - Check target path before write; if exists and `--overwrite` not set, return conflict.
  - Write files atomically.
- [ ] Implement `src/adapters/hermes/status.ts`: check target path; return `AdapterStatusResult`.
- [ ] Implement `src/adapters/hermes/validate.ts`: check skill is Markdown, has name/summary; return `ValidationResult`.
- [ ] Update `src/adapters/hermes/index.ts` with full capability manifest.
- [ ] Implement `src/cli/commands/export.ts` per `specs/cli-commands.md §3`.
- [ ] Update `src/cli/index.ts` to register export command.
- [ ] Update `src/core/registry/write.ts` to support updating `adapters.<name>.*` fields (for post-export state update).
- [ ] Resolve Q-0008 (refuse without `--overwrite`) and Q-0012 (report-only conflict UX).
- [ ] Write unit tests for import, export, status, validate.
- [ ] Write integration test: import fixture → `writeSkill` → `export` → verify Hermes dir created.
- [ ] Write E2E test: full flow from CLI.

## Acceptance criteria

- [ ] `HermesAdapter.import_skill(nativeRef)` returns a valid canonical Skill.
- [ ] `HermesAdapter.export_skill(skill, target, { dryRun: true })` returns file list without writing.
- [ ] `HermesAdapter.export_skill(skill, target)` writes Hermes-native `SKILL.md` to target dir.
- [ ] Export to existing target without `--overwrite` returns conflict result (no write).
- [ ] Export to existing target with `--overwrite: true` writes and returns success.
- [ ] `HermesAdapter.status(skill)` returns `present: true` after successful export.
- [ ] `skillrelay export <id> hermes` exits 0 on success.
- [ ] `skillrelay export <id> hermes --dry-run` prints what would be written; nothing is written.
- [ ] `skillrelay export <id> hermes` on already-exported skill exits 5 (conflict) without `--overwrite`.
- [ ] After successful export, `skill.yaml` has `adapters.hermes.last_exported_at` set.
- [ ] v0.1 acceptance criteria in `v0.1-scope.md §6` all pass end-to-end.

## Test items

- [ ] `tests/unit/adapters/hermes/import.test.ts` — fixture → canonical record (unit).
- [ ] `tests/unit/adapters/hermes/export.test.ts` — dry-run returns paths, no writes (unit).
- [ ] `tests/unit/adapters/hermes/export.test.ts` — writes Hermes dir structure (unit).
- [ ] `tests/unit/adapters/hermes/export.test.ts` — conflict without overwrite (unit).
- [ ] `tests/unit/adapters/hermes/export.test.ts` — overwrite flag allows write (unit).
- [ ] `tests/unit/adapters/hermes/status.test.ts` — present after export (unit).
- [ ] `tests/integration/export-flow.test.ts` — import → write → export → status round-trip (integration).
- [ ] `tests/e2e/export.e2e.test.ts` — CLI export happy path (e2e).
- [ ] `tests/e2e/export.e2e.test.ts` — CLI export conflict exits 5 (e2e).

## Risks / Notes

- Q-0008 resolved: default behavior is refuse + require explicit `--overwrite` flag. No prompt in v0.1.
- Q-0012 resolved: conflict reporting is report-only (print details, exit 5). Interactive prompt deferred.
- Atomic writes to agent directories must never leave partial files. Use the same atomic write pattern as in `src/util/fs.ts`.
- The Hermes adapter must not import from `src/core/registry/` — it receives parsed Skill records, not registry paths.

## References

- [../../adapter-contract.md](../../adapter-contract.md)
- [../../specs/cli-commands.md](../../specs/cli-commands.md)
- [../../open-questions.md](../../open-questions.md) (Q-0008, Q-0012)
- T-0003, T-0007
