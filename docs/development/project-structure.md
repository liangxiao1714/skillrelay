# Project Structure

- Status: accepted
- Last reviewed: 2026-05-25
- Depends on: [ADR-0001](../decisions/0001-language-and-stack.md), [coding-standards.md](./coding-standards.md)

## Purpose

Define the on-disk layout of the SkillRelay repository and the module boundaries within `src/`. The structure is intentionally narrow: there is exactly one correct place for every kind of file.

## Scope

- Repository top level
- `src/` layout
- `tests/` layout
- Boundary rules between CLI / core / adapters
- Conventions for adding a new module

## 1. Repository Top Level

```text
skillrelay/
├── .claude/                  Agent-specific guidance (gitignored except documented files)
├── .github/                  Issue/PR templates, workflows (CI added later)
├── bin/                      Distributed CLI entry shims (added in T-0001)
│   └── skillrelay            Thin shim that imports dist/cli/index.js
├── dist/                     tsup build output (gitignored)
├── docs/                     All project documentation (see docs/README.md)
├── scripts/                  Local dev scripts (release helpers, fixture generators)
├── src/                      Source code (see §2)
├── tests/                    Test code and fixtures (see §3)
├── .gitignore
├── biome.json                Biome lint/format configuration
├── CHANGELOG.md              Added when release process begins
├── CLAUDE.md                 Project guidance for code agents
├── CONTRIBUTING.md           Contribution guide
├── CONTRIBUTING.zh-CN.md     Chinese mirror
├── LICENSE
├── package.json              Single package, no monorepo for v0.1
├── pnpm-lock.yaml
├── README.md
├── README.zh-CN.md
├── tsconfig.json             Strict TypeScript configuration
├── tsup.config.ts            Build configuration
└── vitest.config.ts          Test configuration
```

**No monorepo in v0.1.** A single `package.json` keeps the loop tight. Splitting into `@skillrelay/core`, `@skillrelay/cli`, and `@skillrelay/adapter-*` is a future decision tied to [Q-0005](../open-questions.md).

## 2. `src/` Layout

```text
src/
├── cli/                      CLI surface — argument parsing, output, exit codes
│   ├── index.ts              Entry point (bin); registers all commands
│   ├── commands/             One file per subcommand
│   │   ├── init.ts
│   │   ├── list.ts
│   │   ├── info.ts
│   │   ├── import.ts
│   │   ├── status.ts
│   │   ├── validate.ts
│   │   ├── export.ts
│   │   └── ...
│   ├── output/               Human and JSON formatters
│   │   ├── format-human.ts
│   │   ├── format-json.ts
│   │   └── logger.ts         Wraps the core logger for CLI use
│   └── errors.ts             Maps typed errors → stderr + exit codes
│
├── core/                     Pure domain logic — no CLI, no adapter knowledge
│   ├── schema/               zod schemas + inferred types
│   │   ├── skill.ts
│   │   ├── source.ts
│   │   ├── adapter-manifest.ts
│   │   └── index.ts          Allowed barrel (module boundary)
│   ├── registry/             Filesystem registry I/O
│   │   ├── layout.ts         Path helpers (skill dir, content path, etc.)
│   │   ├── init.ts
│   │   ├── read.ts
│   │   ├── write.ts
│   │   ├── status.ts
│   │   └── index.ts          Public API barrel
│   ├── source/               Source lifecycle (add/remove/enable/disable)
│   ├── import/               Import pipeline (local file/dir → canonical record)
│   ├── validate/             Validation rules
│   ├── id/                   Skill ID generation (per specs/id-generation.md)
│   ├── config/               Config file loading + defaults
│   ├── conflict/             Conflict detection and modeling
│   ├── safety/               Trust level and risk flag computation
│   └── errors/               Typed error classes
│       ├── base.ts           SkillRelayError
│       ├── registry.ts
│       ├── schema.ts
│       ├── adapter.ts
│       └── index.ts
│
├── adapters/                 Per-agent integration code
│   ├── base/                 Adapter interface + helpers
│   │   ├── adapter.ts        Adapter interface definition
│   │   ├── registry.ts       Built-in adapter registry (static for v0.1)
│   │   └── helpers.ts        Shared utilities (path detection, etc.)
│   └── hermes/
│       ├── index.ts          Manifest + exported adapter factory
│       ├── detect.ts
│       ├── discover.ts
│       ├── import.ts
│       ├── export.ts
│       ├── status.ts
│       └── validate.ts
│
└── util/                     General helpers with no domain knowledge
    ├── fs.ts                 fs-extra-style wrappers (atomic writes, tmp dirs)
    ├── path.ts               cross-platform path helpers
    ├── hash.ts               hashing for id generation
    ├── time.ts               iso8601 helpers
    └── log.ts                Internal logger (see specs/logging.md)
```

### `index.ts` files

- Only allowed at the **boundary of a published module** (e.g. `src/core/schema/index.ts`, `src/core/registry/index.ts`, `src/core/errors/index.ts`, `src/adapters/base/adapter.ts`).
- Never inside a leaf folder.
- A boundary `index.ts` re-exports only the **public** surface of its module.

### What goes where: decision rules

| If your code... | It belongs in... |
|---|---|
| Parses or generates a CLI argument | `src/cli/` |
| Writes to stdout / stderr | `src/cli/output/` |
| Calls `process.exit` | `src/cli/index.ts` (and only there) |
| Reads or writes the registry directory | `src/core/registry/` |
| Validates external data | `src/core/schema/` (schemas) + caller |
| Knows the layout of a Hermes skill | `src/adapters/hermes/` |
| Knows the layout of any agent | `src/adapters/<agent>/` |
| Has no domain concept (path joining, hashing, etc.) | `src/util/` |

## 3. `tests/` Layout

```text
tests/
├── unit/                    Pure unit tests, mirror src/ tree
│   ├── core/
│   │   ├── schema/
│   │   ├── registry/
│   │   └── ...
│   └── adapters/hermes/
├── integration/             Multi-module tests within the registry side
│   ├── import-flow.test.ts
│   ├── export-flow.test.ts
│   └── ...
├── e2e/                     Spawn the actual CLI binary against a tmp registry
│   ├── init.e2e.test.ts
│   ├── import-list-status.e2e.test.ts
│   └── ...
├── fixtures/                Read-only fixture data
│   ├── skills/
│   │   ├── minimal-valid/
│   │   ├── hermes-systematic-debugging/
│   │   └── malformed-metadata/
│   └── registries/
│       └── empty-initialized/
└── _support/                Test helpers (tmp registry factory, CLI runner)
    ├── tmp-registry.ts
    ├── run-cli.ts
    └── fixtures.ts
```

Details (placement rules, file naming, isolation) are in [test-strategy.md](./test-strategy.md).

## 4. Module Boundary Rules

These rules are **strict** and enforced by review.

```text
cli ───► core ◄─── adapters
            ▲
            └────── util (everyone can depend on util)

NEVER: cli ───► adapters         (CLI must go through core)
NEVER: core ───► adapters         (core is adapter-agnostic)
NEVER: core ───► cli              (core has no UI knowledge)
NEVER: adapters ───► cli          (adapters are UI-free)
NEVER: adapters ───► adapters     (no cross-adapter knowledge)
NEVER: util ───► anything in src  (util is leaf)
```

| From → To | Allowed? | Notes |
|---|---|---|
| `cli` → `core` | ✅ | Standard CLI-to-core call. |
| `cli` → `adapters` | ❌ | Must use the adapter registry exposed via `core/`. |
| `core` → `adapters` | ❌ | `core` defines the adapter interface; concrete adapters are injected. |
| `core` → `cli` | ❌ | `core` has no UI. |
| `adapters/X` → `core/schema` | ✅ | Adapters speak the canonical schema. |
| `adapters/X` → `core/registry` | ❌ | Adapters do not touch the registry filesystem; they receive parsed records. |
| `adapters/X` → `adapters/Y` | ❌ | No cross-adapter knowledge. |
| anything → `util` | ✅ | Util is dependency-free of `src/` siblings. |
| `util` → anything in `src/` | ❌ | Util must remain a leaf. |

**Enforcement plan**: Phase 0 enforces these by review. Phase 1+ may add an `eslint-plugin-boundaries`-style rule to Biome's config or a small custom linter under `scripts/`.

## 5. Public vs Internal Modules

- The **public TypeScript API** of SkillRelay-as-a-library (if/when used by other packages) is the set of named exports of `src/core/index.ts` (a boundary barrel to be added in T-0001).
- Everything else is internal and may change without semver impact.
- The **CLI surface** has its own stability contract — defined in [`specs/cli-commands.md`](../specs/cli-commands.md) (planned).

## 6. Configuration Files (root)

| File | Purpose |
|---|---|
| `package.json` | Dependencies, scripts, `bin`, `engines.node`. |
| `pnpm-lock.yaml` | Reproducible installs. Committed. |
| `tsconfig.json` | Strict TS config per [coding-standards §1](./coding-standards.md). |
| `tsup.config.ts` | Build output: ESM, declarations, single entry per output bundle. |
| `vitest.config.ts` | Test runner config, coverage thresholds. |
| `biome.json` | Lint and format rules. |
| `.gitignore` | Already exists. |
| `.npmignore` | Added when publishing v0.1; ensures `tests/`, `docs/`, etc. are not shipped. |

## 7. Adding a New Module — Checklist

When introducing a new directory under `src/`:

- [ ] Choose the right top-level home (`cli/`, `core/`, `adapters/`, `util/`).
- [ ] Confirm boundary rules in §4 are not violated.
- [ ] Add a boundary `index.ts` only if the module exposes a public API.
- [ ] Add unit test mirror under `tests/unit/<same-path>/`.
- [ ] If introducing a new domain concept, update [../glossary.md](../glossary.md).
- [ ] If the module's behavior is user-visible, ensure a spec doc exists in `docs/specs/`.

## 8. Build Output

- `tsup` outputs to `dist/`. The `bin/skillrelay` shim resolves to `dist/cli/index.js`.
- `dist/` is gitignored. It is only generated for release or local CLI testing.
- Type declarations (`*.d.ts`) are emitted into `dist/` alongside JS for library consumers.

## 9. Acceptance Criteria (for this doc)

- [ ] The repository layout described in §1 can be reproduced exactly when T-0001 lands.
- [ ] Every directory shown under `src/` in §2 has a documented purpose.
- [ ] The boundary matrix in §4 has no ambiguity for the 9 dependency arrows it lists.
- [ ] Every "decision rules" row in §2 maps unambiguously to one directory.

## 10. Test Items (for this doc)

- [ ] Once T-0001 lands, a structural test under `tests/integration/structure.test.ts` asserts that:
  - `src/cli/` has no imports from `src/adapters/`,
  - `src/core/` has no imports from `src/cli/` or `src/adapters/`,
  - `src/adapters/*/` only import from `src/core/schema/`, `src/core/errors/`, `src/adapters/base/`, and `src/util/`.
- [ ] CI verifies that `bin/skillrelay` resolves and runs the built `dist/cli/index.js`.

## References

- [coding-standards.md](./coding-standards.md)
- [test-strategy.md](./test-strategy.md)
- [ADR-0001](../decisions/0001-language-and-stack.md)
- [../adapter-contract.md](../adapter-contract.md)
- [../canonical-skill-format.md](../canonical-skill-format.md)
- [../specs/cli-commands.md](../specs/cli-commands.md) (planned)
