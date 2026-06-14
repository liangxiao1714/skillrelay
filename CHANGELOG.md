# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] — 2026-06-14

### Added

- **`skillrelay init`** — Initialize a local registry at `~/.skillrelay` (or `--registry <path>`).
- **`skillrelay import <path>`** — Import a skill from a local `SKILL.md` file or directory.
  - Supports `hermes:<name>` prefix to pull from a locally installed Hermes skill.
  - `--dry-run` flag: parse and validate without writing to the registry.
  - `--name <name>` flag: override the detected skill name.
- **`skillrelay list`** — List all skills in the local registry (table or `--json`).
- **`skillrelay info <skill-id>`** — Show full details for one skill (exact ID or name prefix).
- **`skillrelay status <skill-id>`** — Show registry state, origin, and adapter sync status.
- **`skillrelay validate <skill-id>`** — Validate a skill's metadata and content.
- **`skillrelay export <skill-id> hermes`** — Export a skill to Hermes-native format.
  - `--target <path>`: override target directory.
  - `--dry-run`: preview without writing.
  - `--overwrite`: overwrite if skill already exists at target.
- **`skillrelay remove <skill-id>`** — Soft-delete a skill from the registry (`--confirm` required).
- **`skillrelay search [query]`** — Search the local registry by name, tag, summary, author.
  - `--tag <tag>`: filter by tag.
  - `--category <cat>`: filter by category.
  - `--limit <n>`: limit result count (default 50).
- **`skillrelay doctor`** — Check registry health (initialized, orphans, corrupt skills, soft-deletes).
- **`skillrelay source add/list/remove/enable/disable`** — Manage skill sources (persisted in `sources.yaml`).

### Core modules
- Canonical `Skill` schema (Zod, branded `SkillId`, all sub-schemas).
- Filesystem-only registry (ADR-0002): one directory per skill, atomic writes.
- Deterministic skill ID: `<normalized-name>-<first-10-hex-SHA-256>`.
- Soft-delete: rename directory to `<id>.removed-<timestamp>`.
- Import pipeline: detect source type (file/dir), parse front-matter, build canonical record.
- Hermes adapter: detect, discover, import, export, status, validate.
- Source management: add/list/remove/enable/disable sources (stored in `sources.yaml`).
- Local search: name, summary, description, tags, categories, author scoring.
- Registry health doctor with orphan, integrity, and soft-delete checks.

### Developer tooling
- TypeScript strict mode with `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`.
- ESM-only (`"type": "module"`).
- pnpm package manager, tsup (esbuild) build, vitest tests, Biome lint+format.
- 217 tests: 115 unit + 15 integration + 29 E2E.
- Coverage ≥ 87% (threshold 80%).

[Unreleased]: https://github.com/skillrelay/skillrelay/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/skillrelay/skillrelay/releases/tag/v0.1.0
