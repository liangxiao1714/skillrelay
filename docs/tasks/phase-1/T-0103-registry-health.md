# T-0103: `skillrelay doctor` — Registry Health Check

- Status: todo
- Phase: 1
- Owner: SkillRelay maintainers
- Depends on: Phase 0 complete
- Created: 2026-06-14
- Last updated: 2026-06-14

## Goal

Implement `skillrelay doctor` that inspects the registry and all configured adapters,
reports any issues found, and suggests remediation steps.

## Acceptance Criteria

- [ ] `skillrelay doctor` prints a summary of registry state (initialized, skill count, etc.).
- [ ] Checks each configured adapter (currently: Hermes): detected or not, skills dir present.
- [ ] Detects and reports orphaned skill directories (directory exists but no `skill.yaml`).
- [ ] Detects and reports skills that fail schema validation.
- [ ] Detects and reports soft-deleted skills (`.removed-` directories).
- [ ] Exits 0 if no issues found; exits 1 if issues found.
- [ ] `--json` flag returns structured JSON report.
- [ ] `--fix` flag (optional, future): auto-correct fixable issues.
- [ ] Unit tests for each health-check rule.
- [ ] E2E test: doctor on clean registry exits 0; doctor after corruption exits 1.

## Scope

### In scope
- `src/core/doctor/` module: `runDoctorChecks(root): Promise<DoctorReport>`.
- `src/cli/commands/doctor.ts` CLI command.
- Check types: registry initialized, adapter available, orphaned dirs, corrupt YAML, soft-deleted.

### Out of scope
- Auto-repair (`--fix`) in this ticket.
- Source reachability checks.

## Implementation Notes

```
src/core/doctor/
  index.ts        — runDoctorChecks(root, adapters): Promise<DoctorReport>
  checks.ts       — individual check functions (pure where possible)
  schema.ts       — DoctorReport, DoctorIssue types
src/cli/commands/doctor.ts
tests/unit/core/doctor/doctor.test.ts
tests/e2e/doctor.e2e.test.ts
```

## Definition of Done

All acceptance criteria checked, all tests passing, `pnpm typecheck` and `pnpm lint` clean.
