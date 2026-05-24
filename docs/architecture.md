# SkillRelay Architecture

> **Status**: Design phase — this document is a work in progress.

## Overview

SkillRelay is a CLI-first local skills registry and multi-agent bridge. The local machine acts as a unified central skills repository, and agent-specific adapters handle format translation and sync.

## Core Components

### Registry

The local central repository stored on the user's machine. It holds:

- canonical skill content
- skill metadata (name, version, tags, origin, compatibility)
- source records (where skills came from)
- sync state per agent
- conflict flags (same-name skills from multiple sources or versions)

The registry is the single source of truth for all managed skills. It tracks the status of each skill: where it lives (registry only, or synced to specific agents), whether it is up-to-date, whether there are conflicts, and its availability across sources.

### Source

Where skills originate. Sources are managed objects — they can be added, removed, enabled, disabled, and queried for health and credibility status. Supported source types (planned):

- **SkillHub** — a dedicated online skill platform
- **GitHub repositories** — repos containing skills or skill packs
- **Local directories** — directories on the local machine
- **Agent skill directories** — another agent's installed skill folder
- **Individual files** — a single `SKILL.md` or equivalent

### Adapter

A per-agent integration layer. Each adapter is responsible for:

- understanding the target agent's skill format and directory conventions
- importing skills from that agent into the registry
- exporting skills from the registry to that agent
- converting between canonical format and agent-specific format
- reporting sync state

Planned adapters: Hermes, OpenClaw, Claude Code, OpenCode, Codex.

### Skill

A reusable unit of agent knowledge, workflow, or capability. A canonical skill record contains:

- **identity**: name, version, unique ID
- **metadata**: description, tags, categories, author
- **origin**: source, source URL, import timestamp
- **compatibility**: which agents support it, format requirements
- **content**: the actual skill definition

## Data Flow

```
External Sources         Local Registry          Agents
(SkillHub, GitHub,  -->  (canonical store)  -->  (Hermes, Claude,
 local dirs, ...)         on this machine         OpenClaw, ...)
                               ^
                               |
                          Adapters translate
                          formats in both
                          directions
```

Skills flow **bidirectionally**:

- `source → registry → agent` (import and distribute)
- `agent → registry → source` (capture and publish)

## Design Principles

1. **One central registry** per machine — all managed skills live here.
2. **On-demand sync** — skills are never force-loaded to all agents.
3. **Adapter isolation** — agents interact with the registry only through their adapter.
4. **Bidirectional flow** — the registry can both consume and produce skills.
5. **Extensibility** — new adapters and source types can be added without changing core.
6. **Conflict-aware** — same-name, multi-version, and multi-source conflicts are first-class concerns, not edge cases.
7. **Trust and safety as product concerns** — source credibility, risk detection, and trust flags are part of the skill lifecycle, not optional add-ons.

## CLI Architecture

The primary interface is a CLI tool with the command `skillrelay`. Functional areas:

| Area | Commands (planned) |
|---|---|
| Source management | `source add`, `source remove`, `source list`, `source enable`, `source disable`, `source status` |
| Search & discovery | `search`, `list` |
| Import | `install`, `import` |
| Export / distribute | `export`, `push` |
| Sync | `sync`, `pull` |
| Conversion | `convert` |
| Validation & safety | `check`, `validate` |
| Status | `status`, `info` |
| Config | `config` |
| Publish | `publish` |

> `publish` may operate in two modes: preparing a skill as a distributable artifact, or pushing directly to a configured external source when the source supports it.

## Open Questions

- Implementation language (candidates: Go, Rust, Python, Node.js)
- Canonical skill format specification
- Registry storage format (filesystem, SQLite, or hybrid)
- Adapter plugin interface contract
- Authentication model for external sources
