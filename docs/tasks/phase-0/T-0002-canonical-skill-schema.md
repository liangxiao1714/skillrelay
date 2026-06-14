# T-0002: Canonical Skill Schema (zod)

- Status: todo
- Phase: 0
- Owner: unassigned
- Depends on: T-0001, [specs/schema/skill.md](../../specs/schema/skill.md)
- Related specs: [specs/schema/skill.md](../../specs/schema/skill.md), [ADR-0002](../../decisions/0002-v0-1-registry-and-canonical-skill-defaults.md)
- Created: 2026-06-14
- Last updated: 2026-06-14

## Goal

Implement the canonical skill zod schema and all derived TypeScript types in `src/core/schema/`, matching the field reference in `specs/schema/skill.md`.

## Scope

### In scope
- `src/core/schema/skill.ts` — zod schema for all fields in the spec.
- `src/core/schema/index.ts` — public barrel re-exporting all schema types.
- `src/core/id/` — skill ID generation and normalization utilities.
- `src/util/hash.ts` — SHA-256 helper used by ID generation.
- `src/util/time.ts` — ISO 8601 timestamp helpers.
- `src/core/errors/base.ts`, `src/core/errors/schema.ts`, `src/core/errors/index.ts`.
- Unit tests for schema parsing (valid, invalid, edge cases).
- Unit tests for ID generation (determinism, same-origin yields same ID, different-origin yields different ID).

### Out of scope
- Registry filesystem I/O (T-0003).
- Any CLI integration (T-0005).

## Execution items

- [ ] Implement `src/util/hash.ts` (SHA-256 over string, returns hex).
- [ ] Implement `src/util/time.ts` (current ISO 8601 UTC, parse ISO 8601 string).
- [ ] Implement `src/core/errors/base.ts` (`SkillRelayError` base class with `code: string`).
- [ ] Implement `src/core/errors/schema.ts` (`SchemaValidationError extends SkillRelayError`).
- [ ] Implement `src/core/errors/index.ts` (barrel).
- [ ] Implement `src/core/id/normalize.ts` (name normalization: lowercase, non-alnum → `-`, collapse, trim).
- [ ] Implement `src/core/id/generate.ts` (generate `SkillId` from name + version + origin type + origin uri).
- [ ] Implement `src/core/schema/skill.ts` (full zod schema per spec §3).
- [ ] Implement `src/core/schema/index.ts` (public barrel).
- [ ] Write unit tests: `tests/unit/core/schema/skill.test.ts`.
- [ ] Write unit tests: `tests/unit/core/id/generate.test.ts`.
- [ ] Verify `tsc --noEmit` passes.
- [ ] Verify `pnpm test` passes.

## Acceptance criteria

- [ ] `z.infer<typeof SkillSchema>` produces a type with all required fields from the spec.
- [ ] Parsing a minimal valid YAML object (from spec §6 example) succeeds.
- [ ] Parsing an object missing `id` returns a `SchemaValidationError`.
- [ ] Parsing an object missing `name` returns a `SchemaValidationError`.
- [ ] Importing the same name + version + origin twice yields identical `SkillId`.
- [ ] Importing same name but different origin yields different `SkillId`.
- [ ] Normalizing `"  My Skill!! "` produces `"my-skill"` as the name component.
- [ ] Empty name falls back to `"skill"` as the name prefix.
- [ ] All exported types from `src/core/schema/index.ts` are usable without importing from internal files.

## Test items

- [ ] `tests/unit/core/schema/skill.test.ts` — valid full record parses (unit).
- [ ] `tests/unit/core/schema/skill.test.ts` — missing required field fails (unit, per field).
- [ ] `tests/unit/core/schema/skill.test.ts` — `"unversioned"` version is accepted (unit).
- [ ] `tests/unit/core/schema/skill.test.ts` — unknown extra keys are preserved in `source_metadata` if mapped (unit).
- [ ] `tests/unit/core/id/generate.test.ts` — same inputs → same ID (unit).
- [ ] `tests/unit/core/id/generate.test.ts` — different origin → different ID (unit).
- [ ] `tests/unit/core/id/generate.test.ts` — name normalization cases (unit).

## Risks / Notes

- Zod branded types require `.brand<"SkillId">()` applied to a string schema; ensure the brand is preserved through `z.infer`.
- `exactOptionalPropertyTypes: true` in tsconfig means optional fields must be typed as `T | undefined`, not `T?` alone. Be careful with zod `.optional()` and zod `.default()`.

## References

- [../../specs/schema/skill.md](../../specs/schema/skill.md)
- [ADR-0002](../../decisions/0002-v0-1-registry-and-canonical-skill-defaults.md)
- [../../development/coding-standards.md](../../development/coding-standards.md)
- T-0001
