# SkillRelay Roadmap

> **Last updated**: 2026-06-14

## Current Stage: v0.1.0 — Initial Release

SkillRelay v0.1.0 is complete. The core registry, CLI, adapters (Hermes + Claude), search, doctor, config, and update commands are all implemented and tested.

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
- [x] Coverage ≥ 93% (threshold 80%); 295 tests: 161 unit + 15 integration + 40 E2E

---

## Phase 4 — Multi-Source Discovery (Planned)

Goal: connect the registry to external skill sources.

- [ ] GitHub repository source integration (import from raw URL or git clone)
- [ ] Local directory source registration and watching
- [ ] Source-level search federation (search across multiple registered sources)
- [ ] SkillHub source integration (if SkillHub API is available)

## Phase 5 — Conversion & Validation (Planned)

Goal: cross-agent skill compatibility.

- [ ] Format conversion between agent-specific formats (e.g. Hermes → Claude)
- [ ] Cross-agent compatibility validation
- [ ] Trust and safety checks — source credibility and risk flags
- [ ] Dependency checking

## Phase 6 — Publish & Ecosystem (Planned)

Goal: bidirectional skill flow and open ecosystem.

- [ ] `skillrelay publish <skill>` — prepare a skill artifact or publish to a configured external source
- [ ] Version tracking and changelog per skill
- [ ] Conflict resolution — same-name, multi-version, multi-source
- [ ] Community adapter contributions
- [ ] OpenClaw adapter
- [ ] OpenCode adapter
- [ ] Codex adapter

## Out of Scope (for now)

- GUI or web interface
- Hosted/cloud registry
- Automatic background sync
