**[English](./README.md) | [中文](./README.zh-CN.md)**

---

# SkillRelay

> The relay station for your agent skills.

SkillRelay is a CLI-first local skills registry and multi-agent bridge for discovering, importing, syncing, converting, and publishing agent skills across AI agents such as Hermes, OpenClaw, Claude Code, OpenCode, and Codex.

---

## Why SkillRelay

As AI agents become more capable, their skills and workflows are becoming valuable assets. But today, skills are often scattered across different tools, formats, and local directories — with no standard way to move them between agents.

SkillRelay solves that fragmentation by providing:

- a **local canonical registry** as the central hub for all your agent skills
- an **adapter system** that translates skills into each agent's native format
- a **full lifecycle flow**: discover → import → adapt → sync → publish

The goal is not to force every agent to load every skill. It is to give you one place to manage all your skills, and a consistent way to get them where they need to go.

## Core Concepts

| Concept | Description |
|---|---|
| **Skill** | A reusable unit of agent knowledge, workflow, or capability |
| **Source** | Where skills come from — SkillHub, GitHub repos, local dirs, or another agent's skill folder |
| **Registry** | The local canonical store on your machine that holds all managed skills |
| **Adapter** | A per-agent integration layer that handles import, export, format conversion, and sync |

## Planned Capabilities

- local skills registry
- multi-source discovery and search
- import and export workflows
- agent-specific adaptation
- pull / push / sync between registry and agents
- skill format conversion
- validation and health checks
- version tracking and conflict handling
- trust and safety checks
- skill publishing back to sources
- extensible source and adapter system

## Intended Workflow

```
External Source  -->  Local Registry  -->  Agent
(SkillHub, Git,       (your machine)       (Hermes, Claude,
 local dir, ...)                            OpenClaw, ...)

             <--  bidirectional  <--
```

A typical SkillRelay flow:

1. **Discover** a skill from an external source or another agent
2. **Import** it into the local registry
3. **Adapt** it for a specific agent's format
4. **Sync** it to that agent
5. Optionally **publish** it back to an external source

## CLI

The primary interface is the `skillrelay` command (short aliases: `sr`, `relay` — planned).

```
skillrelay search <query>         # search registry and sources
skillrelay install <source>       # import a skill into the registry
skillrelay push <agent> <skill>   # push a skill to an agent
skillrelay pull <agent> <skill>   # pull a skill from an agent
skillrelay sync <agent>           # sync registry with an agent
skillrelay publish <skill>        # publish a skill to an external source
skillrelay source add <url>       # add a skill source
skillrelay list                   # list skills in the registry
skillrelay info <skill>           # show skill details
```

> Note: CLI commands are planned and subject to change during design.

## Documentation

| Document | Description |
|---|---|
| [Architecture](./docs/architecture.md) | Core components, data flow, and design principles |
| [Roadmap](./docs/roadmap.md) | Planned development phases |
| [Design Discussion](./docs/design-discussion.md) | Original project design notes (Chinese) |
| [Contributing](./CONTRIBUTING.md) | How to contribute |

## Project Status

**SkillRelay is currently in the design and planning stage.**

The repository contains documentation and architecture definitions. No implementation has started yet. Contributions to design, architecture, and documentation are welcome.

See [roadmap](./docs/roadmap.md) for planned phases.

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) to get started.

## License

[MIT](./LICENSE)
