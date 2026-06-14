# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build, Lint, and Test Commands

> These commands are defined in `docs/development/test-strategy.md` and `docs/decisions/0001-language-and-stack.md`. The `package.json` does not exist yet — it will be created in T-0001.

| Command | Purpose |
|---|---|
| `pnpm install` | Install dependencies |
| `pnpm build` | Compile TypeScript via tsup → `dist/` |
| `pnpm test` | Run all test tiers (unit + integration + e2e) |
| `pnpm test:unit` | Unit tests only |
| `pnpm test:integration` | Integration tests only |
| `pnpm test:e2e` | E2E tests only (spawns real CLI) |
| `pnpm test:watch` | Unit + integration in watch mode |
| `pnpm test:coverage` | Coverage report → `coverage/` |
| `pnpm lint` | `biome check` (lint + format check) |
| `pnpm lint:fix` | `biome check --apply` |
| `tsc --noEmit` | Type-check without emitting (must pass with zero errors) |

To run a single test file: `pnpm vitest run tests/unit/core/schema/skill.test.ts`

## Project Identity

- **Official name**: **SkillRelay** (finalized 2026-05-24)
- **Earlier working codename**: "SkillMesh" — **deprecated**, do not use in any new code, docs, or commits.
- **CLI primary command**: `skillrelay`
- **CLI short aliases (planned)**: `sr` or `relay`
- **Repository / directory name**: `skillrelay` (all lowercase, no separator)
- **Tagline (working)**: "The relay station for your agent skills."

### Why "SkillRelay"

"Relay" semantically captures the project's core action — **receive and pass on** — which maps directly to the push / pull / sync / publish flow between external sources, the local registry, and individual agents. The singular form "Skill" (not "Skills") follows the English attributive-noun rule (cf. SkillShare, PackageManager) — the plural "skills" remains correct when describing content in prose, docs, and taglines.

### Naming Conventions in This Project

- Brand / class names: **PascalCase singular** → `SkillRelay`, `Skill`, `Source`, `Registry`, `Adapter`.
- CLI commands / binaries / package names: **lowercase, no separator** → `skillrelay`.
- File and directory names: **kebab-case lowercase** → `skillrelay-project-discussion.md`.
- Prose describing content: **plural "skills"** is fine → "manages your agent skills".

## Project Overview

SkillRelay is a CLI-first local skills registry and multi-agent skills bridge. **It is not yet implemented** — the repository currently contains only documentation and design files. The main design planning document is `docs/design-discussion.md` (written in Chinese). All implementation is to be built from scratch.

The project goal is to make the local machine a **unified central skills repository** that can ingest skills from multiple sources and distribute them to different AI agents (e.g. Hermes, OpenClaw, Claude Code, OpenCode, Codex). It is not a simple skill installer — it manages the full lifecycle: discovery, import, storage, conversion, sync, and publish.

## Core Concepts

- **Skill** — A reusable skill unit with purpose, metadata, origin, compatibility info, and content.
- **Source** — Where skills come from: SkillHub, GitHub repos, local directories, individual SKILL.md files, or another agent's installed skill directory.
- **Registry** — The local central repository on this machine that stores all managed skills and their index.
- **Adapter** — A per-agent integration layer responsible for importing, exporting, converting, and syncing skills between the registry and a specific agent.

### Relay-themed Vocabulary (proposed, to be confirmed during CLI design)

These terms come from the "relay race" metaphor and may be used as subcommand names or internal concepts:

- **baton** — a single skill package being passed
- **runner** — an agent adapter (the one carrying batons in/out)
- **track** — a sync channel between registry and a specific agent
- **pass** — push a skill outward
- **catch** — pull a skill inward
- **broadcast** — publish to an external source

## Architecture Principles

- The local machine hosts **one central registry**; each agent keeps its own skill directory structure.
- Skills sync is **on-demand**, never forced full-sync.
- Skills flow **bidirectionally**: external sources → local registry → agents, and agents → local registry → external sources.
- Different agents interact with the registry only through their **adapter** — the adapter handles format translation and loading conventions.
- The project should be **open source** and extensible: new adapters and new source types can be added without changing the core.

## Planned CLI Form Factor

The primary interface is a CLI tool. Key functional areas to implement:

| Area | Description |
|---|---|
| Source management | Add/remove/enable/disable skill sources |
| Search & discovery | Search registry and external sources by name, tag, category, origin |
| Install / import | Pull skills from external sources or other agents into the local registry |
| Export / distribute | Push skills from registry to a target agent or directory |
| Pull / push | Registry ↔ agent selective sync |
| Conversion | Translate between canonical format and agent-specific formats |
| Validation | Check skill completeness, dependencies, permissions, compatibility |
| Status tracking | Show where each skill is installed and its sync state |
| Version & history | Record versions, source updates, change history |
| Conflict resolution | Handle same-name skills from different sources/versions |
| Trust & safety | Flag source trust level, detect risky scripts or external dependencies |
| Config | Manage registry path, source list, adapter rules, sync policies |
| Publish | Push local skills back to external sources |

## Source Layout

```
src/
├── cli/          CLI surface — argument parsing, output formatters, exit codes
│   ├── index.ts  Entry point; registers all commands
│   ├── commands/ One file per subcommand (init, list, info, import, status, validate, export)
│   ├── output/   Human and JSON formatters; logger wrapper
│   └── errors.ts Maps typed errors → stderr + exit codes
├── core/         Pure domain logic — no CLI, no adapter knowledge
│   ├── schema/   zod schemas + inferred types (public barrel: index.ts)
│   ├── registry/ Filesystem registry I/O (public barrel: index.ts)
│   ├── import/   Import pipeline: local file/dir → canonical record
│   ├── validate/ Validation rules
│   ├── id/       Skill ID generation
│   ├── config/   Config file loading + defaults
│   ├── conflict/ Conflict detection and modeling
│   ├── safety/   Trust level and risk flag computation
│   └── errors/   Typed error classes (public barrel: index.ts)
├── adapters/
│   ├── base/     Adapter interface + static registry + shared helpers
│   └── hermes/   Hermes adapter (detect, discover, import, export, status, validate)
└── util/         Domain-free helpers: fs, path, hash, time, log
```

Tests mirror this layout under `tests/unit/`. Integration tests are flat under `tests/integration/`. E2E tests spawn the real CLI against a tmp registry under `tests/e2e/`. Fixtures are read-only under `tests/fixtures/`.

## Module Boundary Rules

These are strict — enforced by review, later by lint:

```
cli ──► core ◄── adapters
              ▲
              └── util  (everyone may depend on util)
```

| Dependency | Allowed? |
|---|---|
| `cli` → `core` | ✅ |
| `cli` → `adapters` | ❌ must go through adapter registry in `core/` |
| `core` → `adapters` | ❌ core defines the interface; adapters are injected |
| `core` → `cli` | ❌ |
| `adapters/X` → `core/schema` | ✅ |
| `adapters/X` → `core/registry` | ❌ adapters receive parsed records, never touch registry fs |
| `adapters/X` → `adapters/Y` | ❌ |
| anything → `util` | ✅ |
| `util` → anything in `src/` | ❌ util is a leaf |

`process.exit` is called **only** from `src/cli/index.ts`. `console.log` is used **only** in `src/cli/output/` and tests. All registry filesystem writes go through `src/core/registry/`. All agent filesystem writes go through the relevant adapter.

## Key Coding Rules

Stack: TypeScript strict mode, ESM only (`"type": "module"`), Node ≥ 20 LTS. Full rules in `docs/development/coding-standards.md`.

- ESM relative imports use `.js` extensions: `import { x } from "./foo.js"`
- No `any` without `// reason:` comment. Prefer `unknown` at boundaries, narrow with zod.
- All external data (filesystem, env, CLI args) must be parsed through a zod schema before use. Schemas live in `src/core/schema/`.
- Branded ID types: `type SkillId = string & { readonly __brand: "SkillId" }`.
- Discriminated unions over flag bags for outcome types.
- Typed error hierarchy under `src/core/errors/` — never swallow errors, never throw raw zod errors.
- `__dirname`/`__filename` are forbidden — use `import.meta.url`.
- No barrel files except at published module boundaries (`src/core/schema/index.ts`, etc.).
- Clock access goes through `src/util/time.ts` so tests can inject a fixed time.

## Testing Rules

- Every test gets its own temp directory via `tests/_support/tmp-registry.ts`. Tests must never touch `~/.skillrelay/`.
- Fixtures are read-only. Copy into tmp dir before mutating.
- E2E tests use `tests/_support/run-cli.ts` which forces `SKILLRELAY_HOME` to the tmp dir.
- Tests must pass with `--shuffle`. Set `TZ=UTC` in `vitest.config.ts`.
- Critical-path modules (`src/core/schema/`, `src/core/registry/`, `src/core/id/`, `src/core/validate/`, `src/core/errors/`) target 95% line coverage.

## Implementation Status

**No code exists yet.** `src/` contains only a `.gitkeep`. Implementing T-0001 next.

Decisions resolved:
- ADR-0001: TypeScript + Node.js ≥ 20, ESM, pnpm, tsup, vitest, commander, zod, js-yaml, Biome.
- ADR-0002: Filesystem-only registry, deterministic ID (name + SHA-256 hash), `unversioned` default, Markdown-only content.
- Q-0009: No short aliases (`sr`, `relay`) in v0.1.
- Q-0010: Relay-themed verbs are internal vocabulary only; not user-facing CLI in v0.1.
- Q-0011: JSON output (`--json`) supported on `list`, `info`, `status`, `validate` in v0.1.
- Q-0008: Destructive ops default to refuse; require explicit `--overwrite` flag. No prompt in v0.1.
- Q-0012: Conflict resolution is report-only in v0.1 (print details, exit 5).

Specs written:
- `docs/specs/schema/skill.md` — canonical skill schema field reference.
- `docs/specs/registry-layout.md` — registry on-disk layout.
- `docs/specs/cli-commands.md` — v0.1 CLI command surface.

Task tickets written: T-0001 through T-0008 in `docs/tasks/phase-0/`.

**Current task: T-0001** — scaffold TypeScript project.

Key docs to read before implementing anything:
- `docs/implementation-contract.md` — project contract and non-negotiable boundaries
- `docs/v0.1-scope.md` — what v0.1 must and must not include
- `docs/canonical-skill-format.md` — canonical skill schema
- `docs/adapter-contract.md` — adapter interface contract
- `docs/open-questions.md` — unresolved decisions (do not silently decide these)

If you encounter any reference to "SkillMesh" or `skills_mesh`, rename it to SkillRelay / skillrelay — the old codename is fully deprecated.
