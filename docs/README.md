# SkillRelay Documentation

- Status: accepted
- Last reviewed: 2026-05-25

This is the documentation hub for the SkillRelay project.

SkillRelay practices **documentation-first development**: every feature, decision, and task is documented and reviewed before code is written. Code follows documentation, not the other way around.

## Reading Order

If you are new to the project, read in this order:

1. [Implementation Contract](./implementation-contract.md) — Authoritative project contract.
2. [Architecture](./architecture.md) — High-level design.
3. [v0.1 Scope](./v0.1-scope.md) — First implementation boundary.
4. [Canonical Skill Format](./canonical-skill-format.md) — Internal data model.
5. [Adapter Contract](./adapter-contract.md) — Plugin boundary.
6. [Roadmap](./roadmap.md) — Phased plan.
7. [Glossary](./glossary.md) — Stable terminology.

Then dive into [decisions/](./decisions/) for *why* and [specs/](./specs/) for *how*.

## Documentation Map

### Project foundation
| Doc | Purpose |
|---|---|
| [implementation-contract.md](./implementation-contract.md) | Durable project contract — read first |
| [architecture.md](./architecture.md) | Components, data flow, principles |
| [roadmap.md](./roadmap.md) | Phased delivery plan |
| [v0.1-scope.md](./v0.1-scope.md) | First implementation boundary |
| [design-discussion.md](./design-discussion.md) | Original design notes (zh-CN) |
| [glossary.md](./glossary.md) | Stable terminology |
| [open-questions.md](./open-questions.md) | Pending decisions log |

### Decisions (ADRs)
See [decisions/README.md](./decisions/README.md).

### Core technical specs
| Doc | Purpose | Status |
|---|---|---|
| [canonical-skill-format.md](./canonical-skill-format.md) | Canonical skill schema | review |
| [adapter-contract.md](./adapter-contract.md) | Adapter interface contract | review |
| [specs/registry-layout.md](./specs/registry-layout.md) | Filesystem layout for the local registry | planned |
| [specs/cli-commands.md](./specs/cli-commands.md) | CLI command shapes, flags, exit codes | planned |
| [specs/config-file.md](./specs/config-file.md) | Configuration file schema and locations | planned |
| [specs/error-model.md](./specs/error-model.md) | Error categories and exit codes | planned |
| [specs/id-generation.md](./specs/id-generation.md) | Skill ID generation algorithm | planned |
| [specs/logging.md](./specs/logging.md) | Logging spec | planned |
| [specs/migration-strategy.md](./specs/migration-strategy.md) | `schema_version` upgrade path | planned |
| [specs/schema/skill.md](./specs/schema/skill.md) | Concrete skill schema, aligned with zod | planned |
| [specs/schema/source.md](./specs/schema/source.md) | Concrete source schema | planned |
| [specs/schema/adapter-manifest.md](./specs/schema/adapter-manifest.md) | Adapter declaration schema | planned |

### Adapter specs
| Doc | Purpose | Status |
|---|---|---|
| [adapters/README.md](./adapters/README.md) | How to write an adapter | planned |
| [adapters/hermes.md](./adapters/hermes.md) | Hermes adapter spec | planned |

### Development
| Doc | Purpose | Status |
|---|---|---|
| [development/document-conventions.md](./development/document-conventions.md) | How docs are written | accepted |
| [development/definition-of-done.md](./development/definition-of-done.md) | What "done" means | accepted |
| [development/coding-standards.md](./development/coding-standards.md) | Code style, naming, structure | accepted |
| [development/project-structure.md](./development/project-structure.md) | `src/` layout | accepted |
| [development/workflow.md](./development/workflow.md) | Branch, commit, PR workflow | planned |
| [development/test-strategy.md](./development/test-strategy.md) | Test pyramid, fixtures, coverage | accepted |
| [development/release-process.md](./development/release-process.md) | Versioning and release | planned |
| [development/security-and-trust.md](./development/security-and-trust.md) | Trust boundary and adapter safety | planned |
| [development/compatibility-matrix.md](./development/compatibility-matrix.md) | Supported Node versions and OSes | planned |
| [development/i18n-strategy.md](./development/i18n-strategy.md) | Translation policy | planned |
| [development/telemetry-and-privacy.md](./development/telemetry-and-privacy.md) | Data collection policy (default: none) | planned |

### Tasks
See [tasks/README.md](./tasks/README.md).

### Translations
- [zh-CN/](./zh-CN/) — Chinese mirror (partial; tracks the English originals).

## Status Legend

Every doc carries a status banner:

| Status | Meaning |
|---|---|
| **draft** | Being written; not stable. |
| **review** | Author considers it complete; awaiting acceptance. |
| **accepted** | Authoritative source of truth. |
| **deprecated** | No longer applicable. |
| **superseded by `<doc>`** | Explicitly replaced. |
| **planned** | Doc is part of the plan but not yet written. (Index-only status.) |

Only **accepted** docs are authoritative.

## Documentation-First Rule

> **No production code is merged before its governing documentation is in `accepted` state.**

Concretely:

1. A feature begins with a spec doc.
2. A task ticket is created with execution items, acceptance criteria, and test items.
3. Tests are described before implementation.
4. Code is written to satisfy the documented criteria.
5. "Done" means: all acceptance criteria pass, all test items implemented, docs updated.

See [development/definition-of-done.md](./development/definition-of-done.md).
