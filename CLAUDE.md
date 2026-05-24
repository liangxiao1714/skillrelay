# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

## Development Notes

- No build system, test framework, or language has been chosen yet. Refer to `skillrelay-project-discussion.md` for the full design rationale before making architectural decisions.
- When implementing, start by settling on: data structures for Skill and Registry, the canonical skill format, and the adapter interface contract — everything else depends on these.
- If you encounter any leftover reference to "SkillMesh" or `skills_mesh` anywhere in the repo, **rename it to SkillRelay / skillrelay** — the old codename is fully deprecated.
