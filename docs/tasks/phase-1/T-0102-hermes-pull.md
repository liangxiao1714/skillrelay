# T-0102: Hermes Adapter — Pull / Import-from-Agent

- Status: todo
- Phase: 1
- Owner: SkillRelay maintainers
- Depends on: Phase 0 complete
- Created: 2026-06-14
- Last updated: 2026-06-14

## Goal

Implement the "pull" direction for the Hermes adapter: discover a skill that is already installed
in Hermes and import it into the SkillRelay registry. This is the reverse of `skillrelay export`.

## Acceptance Criteria

- [ ] `skillrelay import hermes:<skill-name>` imports a Hermes-native skill into the registry.
- [ ] Discovery searches both flat layout (`skills/<name>/SKILL.md`) and category layout.
- [ ] `compatibility.agents` is set to `["hermes"]` on imported skills.
- [ ] `source_metadata.original_format: "hermes-skill"` is set.
- [ ] `adapters.hermes.last_imported_at` is updated in `skill.yaml` after successful import.
- [ ] `--dry-run` returns the parsed skill record without writing to registry.
- [ ] Conflict detection: if skill already in registry, return `"conflict"` outcome.
- [ ] Unit tests: `importHermesSkill()` round-trips correctly.
- [ ] Integration test: Hermes fixture directory → registry import → read back.
- [ ] E2E test: `skillrelay import hermes:<name>` with a mock HERMES_HOME.

## Scope

### In scope
- `src/adapters/hermes/import.ts` (already scaffolded) — implement full body.
- CLI `import` command: detect `hermes:` prefix source path and route to Hermes adapter.
- Update `adapters.hermes` state in `skill.yaml` after pull.

### Out of scope
- Git-based Hermes skill fetch.
- Authentication.

## Implementation Notes

The `importHermesSkill` function in `src/adapters/hermes/import.ts` is already scaffolded.
It needs to:
1. Resolve `nativeRef` (the skill name) to a directory under `HERMES_HOME/skills/`.
2. Call `parseSkillDir()` to parse the SKILL.md.
3. Call `buildSkillRecord()` with `sourceType: "agent"`.
4. Set `compatibility.agents: ["hermes"]` and `source_metadata.original_format: "hermes-skill"`.
5. Return `{ skill, contentMd }`.

The CLI `import` command should detect when `sourcePath` starts with `hermes:` and call the
Hermes adapter import path instead of the local file import.

## Definition of Done

All acceptance criteria checked, all tests passing, `pnpm typecheck` and `pnpm lint` clean.
