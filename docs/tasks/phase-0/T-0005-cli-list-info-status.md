# T-0005: CLI — list / info / status

- Status: todo
- Phase: 0
- Owner: unassigned
- Depends on: T-0004, [specs/cli-commands.md](../../specs/cli-commands.md)
- Related specs: [specs/cli-commands.md](../../specs/cli-commands.md)
- Created: 2026-06-14
- Last updated: 2026-06-14

## Goal

Wire up the `skillrelay list`, `skillrelay info`, `skillrelay status`, and `skillrelay import` CLI commands per `specs/cli-commands.md`.

## Scope

### In scope
- `src/cli/commands/init.ts`
- `src/cli/commands/list.ts`
- `src/cli/commands/info.ts`
- `src/cli/commands/status.ts`
- `src/cli/commands/import.ts`
- `src/cli/output/format-human.ts` — human-readable table/detail formatters.
- `src/cli/output/format-json.ts` — JSON output formatter.
- `src/cli/errors.ts` — maps typed errors → exit codes per spec §4.
- Update `src/cli/index.ts` to register all commands.
- E2E tests spawning the built CLI binary.

### Out of scope
- `skillrelay validate` (T-0006).
- `skillrelay export` (T-0008).

## Execution items

- [ ] Implement `src/cli/commands/init.ts` — calls `initRegistry`, outputs confirmation or "already initialized".
- [ ] Implement `src/cli/commands/import.ts` — calls `importSkill`, supports `--dry-run`, outputs skill ID on success.
- [ ] Implement `src/cli/commands/list.ts` — calls `listSkills`, renders table; supports `--json`.
- [ ] Implement `src/cli/commands/info.ts` — calls `readSkill`, renders detail view; supports `--json`.
- [ ] Implement `src/cli/commands/status.ts` — reads skill.yaml, renders sync/adapter state; supports `--json`.
- [ ] Implement `src/cli/output/format-human.ts` with table and detail formatters.
- [ ] Implement `src/cli/output/format-json.ts`.
- [ ] Implement `src/cli/errors.ts` with exit code mapping per spec §4.
- [ ] Update `src/cli/index.ts` to register all above commands with global options.
- [ ] Write E2E tests.

## Acceptance criteria

- [ ] `skillrelay init` creates registry and exits 0.
- [ ] `skillrelay init` on already-initialized registry exits 0 with informational message.
- [ ] `skillrelay import ./SKILL.md` imports and prints skill ID.
- [ ] `skillrelay import ./SKILL.md --dry-run` prints what would be written; registry is unchanged.
- [ ] `skillrelay list` shows the imported skill.
- [ ] `skillrelay list --json` outputs valid JSON array.
- [ ] `skillrelay info <id>` shows all skill fields.
- [ ] `skillrelay info <id> --json` outputs valid JSON object.
- [ ] `skillrelay status <id>` shows registry state and adapter table.
- [ ] `skillrelay info <nonexistent>` exits 3.
- [ ] `skillrelay list` on uninitialized registry exits 2.
- [ ] All commands respect `--registry <path>` global option.

## Test items

- [ ] `tests/e2e/init.e2e.test.ts` — init creates registry (e2e).
- [ ] `tests/e2e/init.e2e.test.ts` — init idempotent (e2e).
- [ ] `tests/e2e/import-list-status.e2e.test.ts` — import → list → info → status round-trip (e2e).
- [ ] `tests/e2e/import-list-status.e2e.test.ts` — list on empty registry shows empty (e2e).
- [ ] `tests/e2e/import-list-status.e2e.test.ts` — info on missing skill exits 3 (e2e).
- [ ] `tests/e2e/import-list-status.e2e.test.ts` — `--json` output parses as valid JSON (e2e).

## Risks / Notes

- E2E tests must build the CLI first (`pnpm build`) or use `tsx` to run source directly. Use `tsx` for speed in tests.
- The `_support/run-cli.ts` helper should wrap `execa` or Node `child_process.spawn` for clean output capture.

## References

- [../../specs/cli-commands.md](../../specs/cli-commands.md)
- T-0004
