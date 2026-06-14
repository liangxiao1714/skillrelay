**[English](./README.md) | [中文](./README.zh-CN.md)**

---

# SkillRelay

> The relay station for your agent skills.

SkillRelay is a CLI-first local skills registry and multi-agent bridge for discovering, importing, syncing, converting, and publishing agent skills across AI agents such as Hermes, Claude Code, OpenClaw, OpenCode, and Codex.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Node ≥ 20](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org/)

---

## Why SkillRelay

As AI agents become more capable, their skills and workflows are becoming valuable assets. But today, skills are often scattered across different tools, formats, and local directories — with no standard way to move them between agents.

SkillRelay solves that fragmentation by providing:

- a **local canonical registry** as the central hub for all your agent skills
- an **adapter system** that translates skills into each agent's native format
- a **full lifecycle flow**: discover → import → adapt → sync → export
- a **bidirectional lifecycle** where agent-originated skills can flow back into the local registry and then be republished to external sources

The goal is not to force every agent to load every skill. It is to give you one place to manage all your skills, and a consistent way to get them where they need to go.

SkillRelay is a local tool — it runs on your machine and maintains a local registry. It is not a shared global runtime or cloud-hosted service.

---

## Installation

```bash
npm install -g skillrelay
```

Requires **Node.js ≥ 20**.

---

## Quick Start

```bash
# 1. Initialize the local registry (default: ~/.skillrelay)
skillrelay init

# 2. Import a skill from a local Markdown file
skillrelay import ./my-skill.md

# 3. Import a skill already installed in Hermes
skillrelay import hermes:code-review

# 4. List all skills in your registry
skillrelay list

# 5. Export a skill to Claude Code's commands folder
skillrelay export <skill-id> claude

# 6. Check registry health
skillrelay doctor
```

---

## Core Concepts

| Concept | Description |
|---|---|
| **Skill** | A reusable unit of agent knowledge, workflow, or capability |
| **Source** | Where skills come from — local files, Git repos, or another agent's skill folder |
| **Registry** | The local canonical store on your machine that holds all managed skills |
| **Adapter** | A per-agent integration layer that handles import, export, format conversion, and sync |

---

## Intended Workflow

```
External Source  -->  Local Registry  -->  Agent
(local file, Git,     (~/.skillrelay)      (Hermes, Claude,
 Hermes, ...)                               OpenClaw, ...)

             <--  bidirectional  <--
```

A typical SkillRelay flow:

1. **Discover** a skill from a local file or another agent
2. **Import** it into the local registry
3. **Search** for it later using the local search index
4. **Export** it to another agent's native format
5. **Update** it when the source changes

---

## Commands

### `skillrelay init`

Initialize a local registry.

```bash
skillrelay init                       # uses ~/.skillrelay
skillrelay --registry ./my-reg init   # custom location
```

---

### `skillrelay import <path>`

Import a skill into the registry from a local file, directory, or Hermes.

```bash
skillrelay import ./skill.md          # from a SKILL.md file
skillrelay import ./my-skill-dir/     # from a directory containing SKILL.md
skillrelay import hermes:code-review  # pull from a locally installed Hermes skill

# Flags
skillrelay import ./skill.md --dry-run          # parse without writing
skillrelay import ./skill.md --name my-skill    # override detected name
skillrelay import hermes:code-review --json     # JSON output
```

---

### `skillrelay list`

List all skills in the registry.

```bash
skillrelay list
skillrelay list --json
```

---

### `skillrelay info <skill-id>`

Show full details for one skill. Accepts exact ID or an unambiguous name prefix.

```bash
skillrelay info my-skill-a1b2c3d4e5
skillrelay info my-skill              # prefix match
skillrelay info my-skill --json
```

---

### `skillrelay status <skill-id>`

Show the registry state, origin, and adapter sync status for a skill.

```bash
skillrelay status my-skill-a1b2c3d4e5
skillrelay status my-skill --json
```

---

### `skillrelay search [query]`

Search the local registry by name, summary, description, tags, categories, and author.

```bash
skillrelay search "code review"
skillrelay search --tag typescript
skillrelay search --category productivity --limit 10
skillrelay search --json
```

---

### `skillrelay validate <skill-id>`

Validate a skill's metadata and content. Updates the skill's `validation_state` in the registry.

```bash
skillrelay validate my-skill-a1b2c3d4e5
skillrelay validate my-skill --json
```

---

### `skillrelay export <skill-id> <agent>`

Export a skill from the registry to an agent-native format.

**Supported agents:** `hermes`, `claude`

```bash
# Export to Hermes (writes to ~/.hermes/skills/ by default)
skillrelay export my-skill-a1b2c3d4e5 hermes
skillrelay export my-skill hermes --target ~/custom/path

# Export to Claude Code (writes to ~/.claude/commands/ by default)
skillrelay export my-skill-a1b2c3d4e5 claude
skillrelay export my-skill claude --overwrite  # overwrite if already exists

# Flags (both adapters)
skillrelay export my-skill hermes --dry-run    # preview without writing
skillrelay export my-skill claude --json       # JSON output
```

---

### `skillrelay update <skill-id>`

Re-import a skill from its original source URI, preserving registry state and adapter sync metadata.

```bash
skillrelay update my-skill-a1b2c3d4e5
skillrelay update my-skill --dry-run
skillrelay update my-skill --json
```

---

### `skillrelay remove <skill-id>`

Soft-delete a skill from the registry. The skill directory is renamed and kept for recovery.

```bash
skillrelay remove my-skill-a1b2c3d4e5 --confirm
skillrelay remove my-skill --confirm --json
```

---

### `skillrelay doctor`

Check registry health: initialization, orphan directories, corrupt skills, soft-deleted items.

```bash
skillrelay doctor                     # exits 0 if healthy, 1 if issues
skillrelay doctor --json
```

---

### `skillrelay config`

Get, set, or unset configuration values.

```bash
skillrelay config get                          # show all config
skillrelay config get log_level                # show one key
skillrelay config set default_adapter claude   # set a value
skillrelay config set color false              # disable color output
skillrelay config unset default_adapter        # remove a key
skillrelay config get --json
```

**Allowed keys:** `default_registry`, `default_adapter`, `color`, `log_level`

---

### `skillrelay source`

Manage skill sources (persisted in `sources.yaml`).

```bash
skillrelay source add https://example.com/skills
skillrelay source list
skillrelay source list --json
skillrelay source enable <source-id>
skillrelay source disable <source-id>
skillrelay source remove <source-id>
```

---

## Global Flags

All commands support these top-level flags:

| Flag | Description |
|---|---|
| `--registry <path>` | Override registry root (default: `~/.skillrelay`) |
| `--json` | Output JSON instead of human-readable text |
| `--no-color` | Disable ANSI color output |
| `--quiet` | Suppress informational output; only show errors |
| `--version` | Show version number |
| `--help` | Show help |

---

## Exit Codes

| Code | Meaning |
|---|---|
| `0` | Success |
| `1` | General error or health issue |
| `2` | Registry not initialized |
| `3` | Skill not found |
| `4` | Conflict (skill already exists) |
| `5` | Adapter not available |

---

## Documentation

| Document | Description |
|---|---|
| [Architecture](./docs/architecture.md) | Core components, data flow, and design principles |
| [Roadmap](./docs/roadmap.md) | Planned development phases |
| [Changelog](./CHANGELOG.md) | Version history |
| [Contributing](./CONTRIBUTING.md) | How to contribute |

---

## Project Status

**SkillRelay v0.1.0 is the initial working release.**

The core registry, import/export pipeline, search, doctor, config, update, and adapter system (Hermes + Claude) are implemented and tested with 259 passing tests and ≥ 86% coverage.

See [CHANGELOG.md](./CHANGELOG.md) for the full list of features.

---

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) to get started.

## License

[MIT](./LICENSE)

---

### `skillrelay trust <skill-id> <level>`

Set the trust level for a skill in the registry.

**Levels:** `trusted`, `community`, `untrusted`, `unknown`

```bash
skillrelay trust my-skill-a1b2c3d4e5 trusted
skillrelay trust my-skill community
skillrelay trust my-skill untrusted --json
```

---

### `skillrelay sync <agent>`

Export all active skills from the registry to an agent in one command.

**Supported agents:** `hermes`, `claude`

```bash
skillrelay sync hermes                  # export all active skills to Hermes
skillrelay sync claude                  # export all active skills to Claude Code
skillrelay sync hermes --dry-run        # preview without writing
skillrelay sync hermes --overwrite      # overwrite existing
skillrelay sync claude --json           # JSON output with per-skill results
```
