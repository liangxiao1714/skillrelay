# SkillRelay Canonical Skill Format

This document defines the first canonical skill model for SkillRelay.

The canonical format is the internal registry representation. It must be stable enough for adapters to target, but flexible enough to preserve information from different agent ecosystems.

## 1. Purpose

The canonical format exists to:
- give the registry a consistent internal representation
- preserve source/origin information
- support conversion to and from agent-specific formats
- support status, validation, conflict, and publish workflows
- avoid coupling SkillRelay core to any single agent format

## 2. Format Principles

1. Preserve original content whenever possible.
2. Separate canonical metadata from original source metadata.
3. Do not silently drop unknown fields.
4. Make compatibility explicit.
5. Make status and provenance inspectable.
6. Keep v0.1 simple enough to implement.
7. Allow future schema evolution through an explicit schema version.

## 3. Recommended Storage Shape

A registered skill should be stored as a directory or record containing:

```text
<registry>/skills/<skill-id>/
  skill.yaml              # canonical metadata and registry state
  content.md              # canonical readable skill content
  original/               # original imported files, if any
  assets/                 # optional copied assets
```

The exact registry layout may change, but the separation between canonical metadata, canonical content, and original source artifacts should be preserved.

## 4. Canonical Fields

### Required Fields

```yaml
schema_version: 1
id: string
name: string
version: string
summary: string
content:
  type: markdown
  path: content.md
origin:
  type: local_file | local_dir | git | skillhub | agent | url | unknown
  uri: string
  imported_at: iso8601 timestamp
compatibility:
  agents: []
status:
  registry_state: active | disabled | archived
  validation_state: unknown | valid | warning | invalid
```

### Recommended Fields

```yaml
description: string
tags: []
categories: []
author: string
license: string
homepage: string
source_metadata: {}
requirements:
  commands: []
  environment_variables: []
  files: []
  permissions: []
safety:
  trust_level: unknown | trusted | community | untrusted
  risk_flags: []
conflicts:
  has_conflict: false
  conflict_refs: []
adapters:
  <agent-name>:
    supported: true | false | unknown
    last_exported_at: iso8601 timestamp | null
    last_imported_at: iso8601 timestamp | null
    target_path: string | null
    notes: string
```

## 5. Field Semantics

### `schema_version`
The canonical schema version. v0.1 should use `1`.

### `id`
Stable registry identity. It should not depend only on display name. A recommended initial form is a normalized name plus a short hash of origin or content.

### `name`
Human-readable skill name. Name conflicts are allowed but must be detected.

### `version`
Skill version. If the source has no explicit version, use `0.0.0` or `unversioned` consistently. The choice must be documented in implementation.

### `summary` / `description`
Short and long human-readable purpose statements.

### `content`
Canonical readable content. v0.1 should prefer Markdown.

### `origin`
Where this skill came from. This must be recorded for every imported skill.

### `source_metadata`
Original metadata from the source format. Unknown or source-specific fields should be preserved here instead of being discarded.

### `requirements`
Dependencies or environment assumptions the skill needs.

### `compatibility`
Which agents the skill is known or expected to work with.

### `status`
Registry-level state and validation result.

### `safety`
Trust and risk assessment. v0.1 may only populate simple flags, but the model must exist.

### `conflicts`
Conflict indicators. Do not silently overwrite existing skills with the same name/version/source relationship.

### `adapters`
Per-agent adapter state and export/import history.

## 6. Minimal Example

```yaml
schema_version: 1
id: hermes-systematic-debugging-a1b2c3
name: systematic-debugging
version: 1.0.0
summary: Four-phase root cause debugging workflow.
description: A reusable debugging workflow for understanding bugs before fixing them.
tags:
  - debugging
  - software-development
categories:
  - software-development
content:
  type: markdown
  path: content.md
origin:
  type: agent
  uri: hermes:~/.hermes/skills/software-development/systematic-debugging
  imported_at: "2026-05-24T00:00:00Z"
source_metadata:
  original_format: hermes-skill
compatibility:
  agents:
    - hermes
status:
  registry_state: active
  validation_state: valid
requirements:
  commands: []
  environment_variables: []
  files: []
  permissions: []
safety:
  trust_level: trusted
  risk_flags: []
conflicts:
  has_conflict: false
  conflict_refs: []
adapters:
  hermes:
    supported: true
    last_exported_at: null
    last_imported_at: "2026-05-24T00:00:00Z"
    target_path: null
    notes: Imported from Hermes skill directory.
```

## 7. Validation Rules for v0.1

A skill is valid when:
- `schema_version` exists
- `id`, `name`, `version`, and `summary` exist
- canonical content path exists and is readable
- origin type and uri are recorded
- status is present

A skill should produce warnings when:
- version is missing or unversioned
- source metadata is incomplete
- compatibility is unknown
- safety trust level is unknown
- requirements reference missing commands or files

A skill should be invalid when:
- required fields are missing
- content cannot be read
- metadata cannot be parsed
- schema version is unsupported

## 8. Conversion Rules

Adapters may convert between canonical and agent-specific formats.

Conversion must follow these rules:
- preserve original content if possible
- preserve unknown metadata in `source_metadata`
- record conversion limitations in adapter notes
- do not claim full compatibility if lossy conversion occurred
- never silently overwrite target agent files without an explicit command or dry-run confirmation behavior

## 9. Open Questions

These are not settled yet and should not be silently decided by an agent:
- exact registry storage backend: filesystem, SQLite, or hybrid
- exact ID generation algorithm
- whether version should default to `0.0.0` or `unversioned`
- how rich the requirement model should become
- whether canonical content should support non-Markdown formats in v0.1
