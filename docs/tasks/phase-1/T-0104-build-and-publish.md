# T-0104: Build Pipeline & npm Publish Readiness

- Status: todo
- Phase: 1
- Owner: SkillRelay maintainers
- Depends on: Phase 0 complete, T-0101, T-0102, T-0103
- Created: 2026-06-14
- Last updated: 2026-06-14

## Goal

Ensure SkillRelay can be published to npm as a usable CLI tool:
- Correct `package.json` `bin`, `main`, `exports`, and `types` fields.
- `.npmignore` or `files` field excluding source, tests, and coverage.
- `CHANGELOG.md` with v0.1.0 release notes.
- `pnpm build` produces a working `dist/cli/index.js`.
- `npx skillrelay --version` works after a dry-run publish.

## Acceptance Criteria

- [ ] `package.json` has `"bin": { "skillrelay": "bin/skillrelay" }` (already done).
- [ ] `package.json` `"files"` field lists only `bin/`, `dist/`, `README.md`, `LICENSE`.
- [ ] `pnpm build` succeeds with zero TypeScript errors.
- [ ] `node dist/cli/index.js --version` prints the version.
- [ ] `npm pack --dry-run` shows only the expected files.
- [ ] `CHANGELOG.md` created with v0.1.0 section.
- [ ] `README.md` updated with quick-start install and usage examples.
- [ ] CI-ready: `pnpm build && pnpm test && pnpm lint && pnpm typecheck` all pass.

## Scope

### In scope
- `package.json` `"files"` field.
- `.npmignore` (or use `files` field instead).
- `CHANGELOG.md` v0.1.0 entry.
- `README.md` usage section.

### Out of scope
- Actually publishing to npm (requires npm account + access token).
- CI pipeline setup (deferred to Phase 2).

## Definition of Done

`npm pack --dry-run` shows correct files. All CI checks pass locally.
