# SkillRelay Roadmap

> **Status**: Design phase — roadmap is indicative and subject to change.

## Current Stage: Design & Planning

The project is in the design and planning stage. No implementation has started yet.

Active tasks:
- [ ] Finalize implementation language
- [ ] Define canonical skill format specification
- [ ] Define registry storage format
- [ ] Define adapter interface contract
- [ ] Design CLI command structure

## Phase 0 — Foundation

Goal: establish the project skeleton and core data structures.

- [ ] Choose implementation language and toolchain
- [ ] Define canonical `Skill` data structure
- [ ] Define `Registry` storage format
- [ ] Define `Adapter` interface contract
- [ ] Set up project build system and test framework
- [ ] Implement local registry read/write

## Phase 1 — Core CLI

Goal: a working CLI that can manage a local registry.

- [ ] `skillrelay list` — list skills in the local registry
- [ ] `skillrelay install <source>` — import a skill from a local path or URL
- [ ] `skillrelay info <skill>` — show skill details
- [ ] `skillrelay status <skill>` — show where a skill lives and its sync state across registry and agents
- [ ] `skillrelay remove <skill>` — remove a skill from the registry
- [ ] `skillrelay source add/remove/list/enable/disable` — manage skill sources
- [ ] `skillrelay config` — manage configuration

## Phase 2 — Agent Adapters

Goal: connect the registry to real agents.

- [ ] Claude Code adapter
- [ ] Hermes adapter
- [ ] OpenClaw adapter
- [ ] `skillrelay push <agent>` — push a skill to an agent
- [ ] `skillrelay pull <agent>` — pull a skill from an agent
- [ ] `skillrelay sync <agent>` — sync registry with an agent

## Phase 3 — Search & Discovery

Goal: multi-source discovery and search.

- [ ] `skillrelay search <query>` — search local registry and sources
- [ ] SkillHub source integration
- [ ] GitHub repository source integration
- [ ] Tag-based and category-based filtering

## Phase 4 — Conversion & Validation

Goal: cross-agent skill compatibility.

- [ ] Format conversion between agent-specific formats
- [ ] `skillrelay validate <skill>` — validate skill completeness and compatibility
- [ ] Dependency checking
- [ ] Trust and safety checks — source credibility, risk flags, and dangerous dependency detection (distinct from format validation)

## Phase 5 — Publish & Ecosystem

Goal: bidirectional skill flow and open ecosystem.

- [ ] `skillrelay publish <skill>` — prepare a skill artifact or publish directly to a configured external source (where supported)
- [ ] Version tracking and history
- [ ] Conflict resolution — same-name, multi-version, and multi-source conflicts
- [ ] Community adapter contributions
- [ ] Community source integrations

## Out of Scope (for now)

- GUI or web interface
- Hosted/cloud registry
- Automatic background sync
