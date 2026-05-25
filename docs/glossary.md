# Glossary

- Status: accepted
- Last reviewed: 2026-05-25

## Purpose

Stable terminology used across SkillRelay docs and code. When in doubt, use these terms **exactly as defined here**. Deviations require updating this file.

## Scope

Covers core concepts, lifecycle verbs, state vocabulary, identity vocabulary, optional relay-themed vocabulary, and forbidden terms.

## Core Concepts

| Term | Definition |
|---|---|
| **SkillRelay** | The project itself. One word, PascalCase in prose, lowercase in CLI/package names (`skillrelay`). |
| **Skill** | A reusable, named unit of agent capability, workflow, or knowledge. Singular. Plural form "skills" is fine in prose describing content. |
| **Source** | A managed origin of skills (SkillHub, GitHub repo, local dir, agent skill dir, single file). First-class managed object with lifecycle state. |
| **Registry** | The local, on-machine canonical store of managed skills. Exactly one registry per machine in v0.1. |
| **Adapter** | A per-agent integration layer. Translates between canonical skill records and one specific agent's native format. |
| **Canonical format** | The internal registry representation of a skill, as defined in [canonical-skill-format.md](./canonical-skill-format.md). |
| **Native format** | An agent-specific skill representation (e.g. `SKILL.md` directory layout for Hermes). |
| **Manifest** | An adapter's self-declaration: name, label, version, supported operations, native format. |

## Lifecycle Verbs

| Verb | Direction | Meaning |
|---|---|---|
| **discover** | external → user | Surface skills that exist somewhere reachable, without importing. |
| **import** | external → registry | Bring an external skill into the registry as a canonical record. |
| **adapt** | registry → adapter-ready | Convert a canonical record into an agent-native artifact (in memory or to disk). |
| **export** | registry → artifact | Produce a portable agent-native artifact without installing it into the live agent. |
| **push** | registry → agent | Install a canonical skill into a target agent's live skill directory. |
| **pull** | agent → registry | Bring an agent's native skill back into the registry as a canonical record. |
| **sync** | registry ↔ agent | Reconcile registry and agent state, explicitly and selectively. |
| **publish** | registry → external | Send a skill to an external source (artifact preparation, or direct publish where supported). |
| **validate** | (any) | Check completeness, correctness, and safety. |

## State Vocabulary

| Term | Meaning |
|---|---|
| **registry_state** | Lifecycle state within the registry: `active`, `disabled`, `archived`. |
| **validation_state** | Result of the latest validation: `unknown`, `valid`, `warning`, `invalid`. |
| **sync state** | Per-agent state: `synced`, `missing`, `divergent`, `unknown`. |
| **trust_level** | Source/skill credibility: `unknown`, `trusted`, `community`, `untrusted`. |
| **risk flag** | A specific risk marker on a skill (e.g. risky script, external dependency). |
| **conflict** | A detected disagreement: `same_name`, `version_mismatch`, `divergent_content`, `unsupported_metadata`, `overwrite_risk`. |

## Identity Vocabulary

| Term | Meaning |
|---|---|
| **id** | Canonical, stable identity for a skill in the registry. Generation algorithm defined in [specs/id-generation.md](./specs/id-generation.md) (planned). |
| **name** | Human-readable name. May collide across skills; collisions are detected, not prevented. |
| **version** | Skill version string. Default-when-missing rule is defined in [specs/id-generation.md](./specs/id-generation.md) (planned). |
| **native_id** | The id used by the source/agent (e.g. a Hermes skill directory name). |
| **uri** | A reference to where a skill came from, recorded on the canonical record. |

## Optional Relay-themed Vocabulary

These come from the "relay race" metaphor. They are **candidate** internal/CLI names and not yet frozen. See [open-questions.md](./open-questions.md) Q-0010.

| Term | Meaning |
|---|---|
| **baton** | A single skill in transit between locations. |
| **runner** | An adapter (the one carrying batons in/out). |
| **track** | A registry-↔-agent sync channel. |
| **pass** | A push (registry → agent). |
| **catch** | A pull (agent → registry). |
| **broadcast** | A publish (registry → external source). |

Their adoption as user-facing CLI command names is **not** decided yet.

## CLI / Package Naming

| Use | Form |
|---|---|
| Brand / class names | PascalCase singular (`SkillRelay`, `Skill`, `Registry`, `Adapter`, `Source`) |
| CLI binary / npm package | lowercase, no separator (`skillrelay`) |
| File and directory names | kebab-case lowercase (`skillrelay-project-discussion.md`) |
| Prose describing content | plural `skills` is fine |

## Forbidden / Deprecated Terms

| Term | Why forbidden |
|---|---|
| **SkillMesh**, `skills_mesh` | Earlier codename. Deprecated as of 2026-05-24 in favor of SkillRelay. Do not use in any new code, docs, or commits. |
| "global skills runtime" | SkillRelay is local-first and not a runtime. |
| "skills cloud", "skills marketplace" | Out of scope; not the product direction. |
| "auto-sync daemon" | Not the default behavior; sync is always explicit. |

## References

- [implementation-contract.md](./implementation-contract.md)
- [canonical-skill-format.md](./canonical-skill-format.md)
- [adapter-contract.md](./adapter-contract.md)
- [../CLAUDE.md](../CLAUDE.md) §Project Identity
