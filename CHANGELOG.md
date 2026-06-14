# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] — 2026-06-14

### Added

#### CLI Commands

- **`skillrelay init`** — Initialize a local registry at `~/.skillrelay` (or `--registry <path>`).
- **`skillrelay import <path>`** — Import a skill from a local `SKILL.md` file or directory.
  - Supports `hermes:<name>` prefix to pull from a locally installed Hermes skill.
  - `--dry-run` flag: parse and validate without writing to the registry.
  - `--name <name>` flag: override the detected skill name.
- **`skillrelay list`** — List all skills in the local registry (table or `--json`).
- **`skillrelay info <skill-id>`** — Show full details for one skill (exact ID or name prefix).
- **`skillrelay status <skill-id>`** — Show registry state, origin, and adapter sync status.
- **`skillrelay validate <skill-id>`** — Validate a skill's metadata and content; updates `validation_state`.
- **`skillrelay export <skill-id> <agent>`** — Export a skill to an agent-native format.
  - `hermes` adapter: writes to `~/.hermes/skills/` by default.
  - `claude` adapter: writes to `~/.claude/commands/` by default.
  - `--target <path>`: override target directory.
  - `--dry-run`: preview without writing.
  - `--overwrite`: overwrite if skill already exists at target.
- **`skillrelay update <skill-id>`** — Re-import a skill from its original source URI, preserving registry state and adapter metadata.
  - `--dry-run`: preview without writing.
- **`skillrelay remove <skill-id>`** — Soft-delete a skill from the registry (`--confirm` required).
- **`skillrelay search [query]`** — Search the local registry by name, summary, description, tags, categories, and author.
  - `--tag <tag>`: filter by tag.
  - `--category <cat>`: filter by category.
  - `--limit <n>`: limit result count (default 50).
- **`skillrelay doctor`** — Check registry health (initialized, orphans, corrupt skills, soft-deletes).
  - Exits 0 if healthy, 1 if any issues.
- **`skillrelay config get/set/unset`** — Get, set, or remove configuration values (`default_registry`, `default_adapter`, `color`, `log_level`).
- **`skillrelay source add/list/remove/enable/disable`** — Manage skill sources (persisted in `sources.yaml`).

#### Global Flags

All commands support: `--registry <path>`, `--json`, `--no-color`, `--quiet`, `--version`, `--help`.

#### Core Modules

- Canonical `Skill` schema (Zod, branded `SkillId`, all sub-schemas).
- Filesystem-only registry (ADR-0002): one directory per skill, atomic writes.
- Deterministic skill ID: `<normalized-name>-<first-10-hex-SHA-256>`.
- Soft-delete: rename directory to `<id>.removed-<timestamp>`.
- Import pipeline: detect source type (file/dir/hermes), parse front-matter, build canonical record.
- Search engine: name, summary, description, tags, categories, author scoring with tag/category filter support.
- Registry health doctor: orphan, integrity, and soft-delete checks.
- Config storage: `config.yaml` in registry root; Zod-validated schema.
- Update pipeline: re-fetch from `origin.uri`, merge registry state and adapter metadata.

#### Adapters

- **Hermes adapter**: detect, discover, import, export, status, validate.
- **Claude adapter**: detect, discover, import, export (YAML front-matter), status, validate.

#### Developer Tooling

- TypeScript strict mode with `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`.
- ESM-only (`"type": "module"`).
- pnpm package manager, tsup (esbuild) build, vitest tests, Biome lint+format.
- 259 tests: 125 unit + 15 integration + 40 E2E.
- Coverage ≥ 86% (threshold 80%; `src/cli/**` excluded — CLI runs as subprocess in E2E).

### Exit Codes

| Code | Meaning |
|---|---|
| `0` | Success |
| `1` | General error or health issue |
| `2` | Registry not initialized |
| `3` | Skill not found |
| `4` | Conflict (skill already exists) |
| `5` | Adapter not available |

[Unreleased]: https://github.com/skillrelay/skillrelay/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/skillrelay/skillrelay/releases/tag/v0.1.0
