# T-0004: Import from Local File / Directory

- Status: todo
- Phase: 0
- Owner: unassigned
- Depends on: T-0003
- Related specs: [specs/registry-layout.md](../../specs/registry-layout.md), [specs/schema/skill.md](../../specs/schema/skill.md), [specs/cli-commands.md](../../specs/cli-commands.md)
- Created: 2026-06-14
- Last updated: 2026-06-14

## Goal

Implement the import pipeline in `src/core/import/` that reads a local `SKILL.md` file or a skill directory, builds a canonical skill record, and stores it in the registry.

## Scope

### In scope
- `src/core/import/detect.ts` — detect source type and validate path.
- `src/core/import/parse-skill-md.ts` — parse a `SKILL.md` file (front-matter YAML + Markdown body).
- `src/core/import/parse-dir.ts` — parse a skill directory (look for `SKILL.md` or equivalent entry).
- `src/core/import/build-record.ts` — map parsed source to canonical `Skill` record.
- `src/core/import/index.ts` — public `importSkill(registryRoot, sourcePath, options)` function.
- `src/core/errors/` — add `SourceError` for import failures.
- Unit tests for each parser.
- Integration test: import a fixture skill into a tmp registry.
- Test fixtures: `tests/fixtures/skills/minimal-valid/`, `tests/fixtures/skills/hermes-systematic-debugging/`, `tests/fixtures/skills/malformed-metadata/`.

### Out of scope
- URL or remote imports.
- Hermes adapter (T-0007/T-0008).
- CLI command wiring (T-0005).

## Execution items

- [ ] Create `tests/fixtures/skills/minimal-valid/SKILL.md` fixture.
- [ ] Create `tests/fixtures/skills/hermes-systematic-debugging/` fixture (Hermes-style directory).
- [ ] Create `tests/fixtures/skills/malformed-metadata/SKILL.md` fixture.
- [ ] Implement `src/core/errors/source.ts` (`SourceError extends SkillRelayError`).
- [ ] Implement `src/core/import/detect.ts`: given a path, return `{ type: "local_file" | "local_dir", absolutePath }` or throw `SourceError`.
- [ ] Implement `src/core/import/parse-skill-md.ts`: use `gray-matter` to split front-matter + body; extract known fields; put unknown fields into `source_metadata`.
- [ ] Implement `src/core/import/parse-dir.ts`: find `SKILL.md` entry in directory; delegate to `parse-skill-md.ts`.
- [ ] Implement `src/core/import/build-record.ts`: map parsed source → canonical `Skill` with proper `origin`, `status`, `safety` defaults.
- [ ] Implement `src/core/import/index.ts`: orchestrate detect → parse → build → write; return `ImportOutcome`.
- [ ] Write unit tests: `tests/unit/core/import/`.
- [ ] Write integration test: `tests/integration/import-flow.test.ts`.

## Acceptance criteria

- [ ] `importSkill(root, "path/to/SKILL.md")` writes a canonical record to the registry.
- [ ] `importSkill` called twice with the same file returns a conflict result without overwriting.
- [ ] `importSkill` on a directory containing `SKILL.md` succeeds.
- [ ] `importSkill` on a path that does not exist throws `SourceError`.
- [ ] Front-matter YAML fields map to canonical fields; unknown fields go to `source_metadata`.
- [ ] The imported skill's `origin.type` is `local_file` or `local_dir` as appropriate.
- [ ] The imported skill's `origin.uri` is the absolute path of the source.
- [ ] `version` defaults to `"unversioned"` when absent from the source.
- [ ] Malformed front-matter YAML throws `SourceError`.

## Test items

- [ ] `tests/unit/core/import/detect.test.ts` — file path → `local_file` (unit).
- [ ] `tests/unit/core/import/detect.test.ts` — dir path → `local_dir` (unit).
- [ ] `tests/unit/core/import/detect.test.ts` — missing path → `SourceError` (unit).
- [ ] `tests/unit/core/import/parse-skill-md.test.ts` — parses front-matter + body (unit).
- [ ] `tests/unit/core/import/parse-skill-md.test.ts` — malformed YAML → `SourceError` (unit).
- [ ] `tests/unit/core/import/parse-skill-md.test.ts` — missing version → `unversioned` (unit).
- [ ] `tests/unit/core/import/build-record.test.ts` — builds valid `Skill` from parsed data (unit).
- [ ] `tests/integration/import-flow.test.ts` — full import of minimal-valid fixture into tmp registry (integration).
- [ ] `tests/integration/import-flow.test.ts` — duplicate import conflict (integration).

## Risks / Notes

- `gray-matter` may handle some edge cases (e.g. missing front-matter block) differently than expected; add explicit tests for these.
- Preserve original `SKILL.md` content in `original/` on import.
- Absolute path normalization is important for deterministic IDs: resolve symlinks if needed.

## References

- [../../specs/schema/skill.md](../../specs/schema/skill.md)
- [../../specs/registry-layout.md](../../specs/registry-layout.md)
- T-0003
