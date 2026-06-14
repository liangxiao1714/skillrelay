# T-0006: Validate Command

- Status: todo
- Phase: 0
- Owner: unassigned
- Depends on: T-0002, T-0004
- Related specs: [specs/schema/skill.md §4](../../specs/schema/skill.md), [specs/cli-commands.md](../../specs/cli-commands.md)
- Created: 2026-06-14
- Last updated: 2026-06-14

## Goal

Implement `skillrelay validate <skill-id>` that checks a canonical skill record for errors and warnings and updates `status.validation_state` in `skill.yaml`.

## Scope

### In scope
- `src/core/validate/rules.ts` — validation rule implementations.
- `src/core/validate/index.ts` — `validateSkill(root, skillId)` → `ValidationReport`.
- `src/cli/commands/validate.ts` — CLI wiring.
- Unit tests for each validation rule.
- Integration test: validate a known-good and known-invalid fixture.

### Out of scope
- Adapter-level validation (T-0008).
- Trust/safety scoring beyond basic flag presence (later task).

## Execution items

- [ ] Define `ValidationReport` type: `{ valid: boolean; errors: string[]; warnings: string[]; infos: string[] }`.
- [ ] Implement validation rules per `specs/schema/skill.md §4`:
  - Required field presence checks (errors).
  - `content.md` file readable check (error).
  - `version === "unversioned"` check (warning).
  - `compatibility.agents.length === 0` check (warning).
  - `safety.trust_level === "unknown"` check (warning).
- [ ] Implement `src/core/validate/index.ts`: run all rules, update `status.validation_state` in `skill.yaml`.
- [ ] Implement `src/cli/commands/validate.ts`: call `validateSkill`, render pass/warning/fail; support `--json`.
- [ ] Write unit tests: `tests/unit/core/validate/`.
- [ ] Write integration test: `tests/integration/validate-flow.test.ts`.

## Acceptance criteria

- [ ] A valid skill returns `valid: true, errors: [], warnings: []`.
- [ ] A skill with `version: "unversioned"` returns `warnings` containing the version warning.
- [ ] A skill missing `summary` returns `valid: false` with an error.
- [ ] A skill whose `content.md` is missing returns `valid: false` with an error.
- [ ] `validateSkill` updates `status.validation_state` in `skill.yaml` after running.
- [ ] `skillrelay validate <id>` exits 0 for valid, 1 for invalid.
- [ ] `skillrelay validate <id> --json` outputs a JSON report.

## Test items

- [ ] `tests/unit/core/validate/rules.test.ts` — each rule fires on its specific condition (unit).
- [ ] `tests/integration/validate-flow.test.ts` — valid fixture → valid report (integration).
- [ ] `tests/integration/validate-flow.test.ts` — malformed-metadata fixture → invalid report (integration).
- [ ] `tests/e2e/validate.e2e.test.ts` — CLI exits 0 for valid, 1 for invalid (e2e).

## Risks / Notes

- Updating `skill.yaml` after validation must use the atomic write pattern from T-0003.
- Validation should read `content.md` but not parse or interpret it.

## References

- [../../specs/schema/skill.md](../../specs/schema/skill.md)
- [../../specs/cli-commands.md](../../specs/cli-commands.md)
- T-0002, T-0004
