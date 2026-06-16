# SkillRelay Roadmap

> **Last updated**: 2026-06-16

## Current Stage: Phase 7 Complete — Multi-Source Discovery

SkillRelay now ships with **17 CLI commands**, **2 agent adapters** (Hermes + Claude), **remote URL + GitHub import**, **357 tests**, and **~79% of the long-term project vision** delivered. See [`acceptance.md`](./acceptance.md) for the full verification record.

---

## Phase 0 — Foundation ✅

Goal: establish the project skeleton and core data structures.

- [x] TypeScript strict mode, ESM-only, pnpm, tsup, vitest, Biome
- [x] Canonical `Skill` data structure (Zod schema, branded `SkillId`)
- [x] Filesystem-only registry (ADR-0002): one directory per skill, atomic writes
- [x] Deterministic skill ID: `<normalized-name>-<first-10-hex-SHA-256>`
- [x] Import pipeline: detect source type (file/dir), parse YAML front-matter, build canonical record
- [x] Registry init / read / write / soft-delete

## Phase 1 — Core CLI ✅

Goal: a working CLI with full lifecycle for local registry management.

- [x] `skillrelay init` — initialize a local registry
- [x] `skillrelay list` — list skills in the local registry
- [x] `skillrelay import <path>` — import a skill from a local path
- [x] `skillrelay import hermes:<name>` — pull a skill from a Hermes installation
- [x] `skillrelay info <skill>` — show skill details
- [x] `skillrelay status <skill>` — show where a skill lives and its sync state
- [x] `skillrelay validate <skill>` — validate skill metadata and content
- [x] `skillrelay remove <skill>` — soft-delete a skill from the registry
- [x] `skillrelay source add/remove/list/enable/disable` — manage skill sources
- [x] `skillrelay search [query]` — search local registry by name, summary, tags, categories, author
- [x] `skillrelay doctor` — check registry health (orphans, corrupt skills, soft-deletes)
- [x] Build pipeline: tsup produces `dist/`, binary in `bin/skillrelay`, npm-publishable package

## Phase 2 — Agent Adapters ✅

Goal: connect the registry to real agents.

- [x] Hermes adapter: detect, discover, import, export, status, validate
- [x] Claude Code adapter: detect, discover, import, export (YAML front-matter), status, validate
- [x] `skillrelay export <skill> hermes` — export to Hermes native format
- [x] `skillrelay export <skill> claude` — export to Claude Code commands directory
- [x] `skillrelay config get/set/unset` — user configuration (default_registry, default_adapter, color, log_level)
- [x] `skillrelay update <skill>` — re-fetch from origin URI, preserve registry state and adapter metadata

## Phase 3 — Coverage & Build Verification ✅

Goal: close coverage gaps and verify the published package.

- [x] Unit tests for adapter registry (registerAdapter, getAdapter, listAdapterNames)
- [x] Unit tests for hermes/validate.ts (validateForHermes)
- [x] Unit tests for hermes/import.ts (importHermesSkill)
- [x] Unit tests for HermesAdapter and ClaudeAdapter class manifests and capabilities
- [x] Build verification: `pnpm build` succeeds, `node dist/cli/index.js --version` works
- [x] Coverage ≥ 93% (threshold 80%)

## Phase 4 — Trust & Sync ✅

Goal: per-skill safety annotations and bulk export.

- [x] `skillrelay trust <skill> <level>` — set `safety.trust_level` (`trusted | community | untrusted | unknown`)
- [x] `skillrelay sync <agent>` — batch export all active skills to one adapter, with `--dry-run`, `--overwrite`, `--json`

## Phase 5 — Tag & Convert ✅

Goal: in-place metadata edits and registry-independent format conversion.

- [x] `skillrelay tag <skill>` — list / `--add` / `--remove` / `--set` tags
- [x] `skillrelay convert --from <fmt> --to <fmt>` — Hermes ↔ Claude conversion without the registry

## Phase 6 — Acceptance Documentation ✅

Goal: produce a comprehensive verification record mapping the project vision to shipped implementation.

- [x] [`docs/acceptance.md`](./acceptance.md) — English acceptance report with 19-section vision mapping
- [x] [`docs/zh-CN/acceptance.md`](./zh-CN/acceptance.md) — Chinese mirror
- [x] Engineering metrics: 321 tests, 93.77% coverage, 0 lint findings, 0 type errors, build green
- [x] v0.1 acceptance criteria from `v0.1-scope.md §6` all individually mapped to E2E tests

---

## Phase 7 — Multi-Source Discovery ✅

Goal: connect the registry to external skill sources.

- [x] `skillrelay import https://…` — import from any raw HTTP/HTTPS URL
- [x] `skillrelay import github:<owner>/<repo>/<path>[@ref]` — import from GitHub (resolves to raw.githubusercontent.com)
- [x] `fetchText(url)` — Node 18+ built-in fetch helper with content-type + size guard
- [x] `resolveGithubUri` — parses `github:` scheme, supports optional `@ref` for branch/tag/SHA
- [x] `update` command re-fetches skills with `url` / `github` origin type
- [ ] Local directory source registration and watching (deferred to Phase 7b)
- [ ] Source-level search federation across multiple registered sources (deferred)
- [ ] SkillHub source integration (deferred)

## Phase 8 — Publish & Ecosystem (Planned)

Goal: bidirectional skill flow and open ecosystem.

- [ ] `skillrelay publish <skill>` — prepare a skill artifact or publish to a configured external source
- [ ] Version tracking and per-skill changelog history
- [ ] Conflict resolution — same-name, multi-version, multi-source
- [ ] Automatic risk-script scanning to complement manual `trust` annotations
- [ ] Community RFC process for skill spec evolution

## Phase 9 — Additional Adapters (Planned)

Goal: broaden agent coverage.

- [ ] OpenClaw adapter
- [ ] OpenCode adapter
- [ ] Codex adapter
- [ ] Dynamic `@skillrelay/adapter-*` discovery (resolves Q-0005)

## Out of Scope (for now)

- GUI or web interface
- Hosted/cloud registry
- Automatic background sync
