# SkillRelay Implementation Contract

This document is the durable source of truth for how SkillRelay should be understood and implemented by any coding agent or human contributor.

It is intentionally written to survive tool changes. Whether the work is done with Claude Code, OpenCode, Codex, another code agent, or by a human reading the docs directly, the intent, boundaries, priorities, and execution rules here should remain the same.

## 1. Product Definition

SkillRelay is a CLI-first local skills registry and multi-agent bridge for managing agent skills across multiple AI agents.

It exists to:
- discover skills from many sources
- import them into a local canonical registry
- adapt them for different agent runtimes
- sync selected skills to selected agents
- pull agent-originated skills back into the registry
- publish skills back out to supported external sources

## 2. Non-Negotiable Boundaries

SkillRelay is not:
- a shared global skills runtime
- a cloud-hosted service
- a GUI-first product
- a marketplace-first product
- an always-on background synchronization system by default
- a project that forces every agent to load every skill

SkillRelay is:
- local-first
- CLI-first
- registry-centered
- adapter-based
- selective and on-demand in sync behavior
- bidirectional in lifecycle flow

## 3. Core Lifecycle

The intended lifecycle is:

discover -> import -> normalize/adapt -> register -> inspect/status -> sync/pull/push -> publish

Important: skills may also flow in reverse:
- from agents back into the registry
- from the registry back to external sources when supported

## 4. Core Concepts

### Skill
A reusable unit of agent capability, workflow, or knowledge.

A skill should be understood as a managed asset with:
- identity
- metadata
- source/origin
- content
- compatibility information
- status across registry and agents

### Source
A managed origin of skills.

Sources are not just search targets. They are first-class managed objects with lifecycle state such as:
- add/remove
- enable/disable
- status/health
- trust/credibility

Examples include:
- SkillHub or other external skill hubs
- GitHub repositories
- local directories
- another agent’s skill directory
- a single SKILL.md or equivalent file

### Registry
The local canonical store on the user’s machine.

The registry is the source of truth for managed skills and should track:
- canonical content
- metadata
- origin/source record
- version history
- sync state per agent
- conflicts
- availability/state

### Adapter
A per-agent integration layer.

Adapters are responsible for translating between the registry and a target agent’s conventions, including:
- import
- export
- conversion
- sync
- agent-specific layout/format handling

## 5. Important Product Rules

1. Local canonical registry first.
2. Selective sync only; do not force global loading.
3. Adapter isolation; core registry logic must not be coupled to one agent’s format.
4. Bidirectional lifecycle is required.
5. Source management is stateful and observable.
6. Trust, safety, and conflict handling are first-class concerns.
7. Publish must support two layers:
   - artifact preparation/export
   - direct publish to a supported source when possible
8. Status visibility matters: users must know where a skill lives, whether it is synced, and whether it is available.

## 6. Conflict Model

Conflicts are expected and must be modeled explicitly.

Treat these as first-class cases:
- same-name skills
- multi-version skills
- multi-source skills
- source-vs-registry divergence
- agent-vs-registry divergence

The system should not silently overwrite or ignore conflicts.

## 7. Safety and Trust

SkillRelay must treat trust/safety as part of the product, not as a weak afterthought.

This includes:
- source credibility
- dangerous or risky dependencies
- suspicious scripts or behavior
- incomplete or malformed skill definitions
- publish-time safety checks

## 8. CLI Expectations

SkillRelay is CLI-first.

CLI design should prioritize:
- explicit commands
- inspectable state
- composable workflows
- low ambiguity
- stable naming

Command names shown in docs are planning guidance unless explicitly frozen later.

## 9. Implementation Priorities

Build in this order:

1. Canonical skill model
2. Registry storage
3. Source model and source lifecycle
4. Basic CLI shell and inspection commands
5. One adapter end-to-end
6. Sync/pull/push behavior
7. Validation, trust, and conflict handling
8. Publish workflow
9. Broader multi-source and multi-adapter support

## 10. Non-Goals for the Early Stage

Do not prioritize:
- GUI/web UI
- cloud registry hosting
- automatic background sync as the default
- marketplace features before registry correctness
- broad agent support before one clean adapter works

## 11. How to Use This Document

For any coding agent or human contributor:
1. Read this first.
2. Treat it as the project contract.
3. Prefer preserving these boundaries over inventing new product directions.
4. If a task conflicts with this document, stop and resolve the conflict before implementing.
5. If implementation details are still unclear, propose options instead of silently choosing a new direction.

## 12. Current Project Status

SkillRelay is still in the design/planning stage.

The next work should focus on:
- finalizing the canonical model
- defining the registry structure
- defining the adapter contract
- tightening CLI semantics
- then implementing the first minimal end-to-end flow
