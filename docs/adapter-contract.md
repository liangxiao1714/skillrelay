# SkillRelay Adapter Contract

This document defines the intended contract for SkillRelay adapters.

Adapters are the boundary between the local canonical registry and agent-specific skill systems. They must isolate agent-specific behavior from the registry core.

## 1. Purpose

An adapter allows SkillRelay to work with a specific target agent or skill runtime without hard-coding that agent’s format into the registry.

Adapters handle:
- discovery of agent skill locations
- reading agent-native skills
- converting agent-native skills into canonical SkillRelay records
- converting canonical records into agent-native layout/format
- exporting/pushing skills to an agent
- optionally pulling/importing skills from an agent
- reporting sync/status information

## 2. Design Principles

1. Registry core must not depend on one agent’s file format.
2. Adapters must be replaceable and independently testable.
3. Adapters should expose capability metadata instead of assuming every operation is supported.
4. Adapters must support dry-run behavior for write operations where possible.
5. Adapters must not silently overwrite agent files.
6. Adapters must report lossy conversion and unsupported fields.
7. Adapters must keep source and target paths observable.

## 3. Adapter Identity

Every adapter should declare:

```yaml
name: hermes
label: Hermes Agent
version: 1
supported_operations:
  discover: true
  import: true
  export: true
  push: true
  pull: true
  sync: false
  validate: true
native_format: hermes-skill
```

## 4. Required Capabilities

### `detect()`
Determine whether the target agent is available on the current machine.

Expected result:
```yaml
available: true
confidence: high | medium | low
reason: string
paths:
  - string
```

### `capabilities()`
Return supported operations.

Expected result:
```yaml
discover: true
import: true
export: true
push: true
pull: false
sync: false
validate: true
```

### `discover()`
Find existing agent-native skills.

Expected result:
```yaml
skills:
  - native_id: string
    name: string
    path: string
    format: string
    detected_at: iso8601 timestamp
```

### `import_skill(native_ref)`
Convert an agent-native skill into a canonical SkillRelay record.

Must:
- preserve original files where possible
- map known metadata into canonical fields
- place unknown metadata into `source_metadata`
- report warnings for lossy conversion

### `export_skill(skill, target)`
Convert a canonical skill into an agent-native artifact or directory.

Must:
- support dry-run mode
- return target paths
- report generated files
- report conversion warnings
- avoid overwriting unless explicitly allowed

### `status(skill)`
Report whether a canonical skill is present in the target agent.

Expected result:
```yaml
present: true | false
state: synced | missing | divergent | unknown
native_path: string | null
last_seen_at: iso8601 timestamp
notes: string
```

### `validate(skill)`
Validate whether a canonical skill can be used by the target agent.

Expected result:
```yaml
valid: true | false
warnings: []
errors: []
```

## 5. Optional Capabilities

### `pull(native_ref)`
Pull a native skill from an agent into the registry.

### `push(skill, target)`
Push a canonical skill directly into the agent’s active skill directory.

### `sync(skill_or_filter)`
Reconcile registry and agent state.

Sync must be explicit. v0.1 must not implement implicit always-on sync.

### `remove(skill, target)`
Remove or unlink a skill from a target agent.

Remove should be conservative and must support dry-run.

## 6. Operation Semantics

### Import
Agent -> Registry

Used when a skill already exists in an agent and should be captured by SkillRelay.

### Export
Registry -> Artifact or directory

Used to prepare an agent-native version without necessarily installing it.

### Push
Registry -> Agent active skill location

Used to make a skill available to an agent.

### Pull
Agent -> Registry

Used to bring agent-originated or modified skills into the registry.

### Sync
Registry <-> Agent

Used to reconcile known state. Sync must surface conflicts; it must not silently choose a winner.

## 7. Conflict Handling

Adapters must report conflicts instead of hiding them.

Conflict examples:
- target agent already has a skill with the same name
- target has a newer or different version
- canonical skill and native skill diverged
- conversion would overwrite local changes
- unsupported native metadata cannot be represented canonically

Expected conflict result:
```yaml
has_conflict: true
conflict_type: same_name | version_mismatch | divergent_content | unsupported_metadata | overwrite_risk
message: string
suggested_actions:
  - keep_registry
  - keep_agent
  - rename
  - fork
  - skip
```

## 8. Safety Rules

Adapters must respect safety rules:
- never write outside the declared target without explicit configuration
- never delete native files without explicit remove command and dry-run path
- report risky scripts or commands if detected
- preserve backups or original files when modifying active agent directories
- avoid executing skill content during conversion or validation unless explicitly designed and approved

## 9. v0.1 Adapter Recommendation

The first adapter should be Hermes unless a later decision explicitly chooses otherwise.

Reason:
- Hermes skills are Markdown-based and visible in this environment.
- Hermes already uses structured skill directories and `SKILL.md` files.
- It is the most natural first vertical slice for this project.

v0.1 Hermes adapter should support:
- detect Hermes skill directory
- discover Hermes skills
- import a Hermes skill into canonical format
- export canonical skill into Hermes-compatible skill directory
- report status for whether the skill exists in the Hermes target directory

## 10. Testing Expectations

Each adapter should be tested with fixtures.

Minimum tests:
- detect available target
- detect missing target
- discover native skills
- import native skill to canonical record
- export canonical record to native layout
- dry-run export does not write files
- conflict when target already exists
- validation warning for unsupported fields

## 11. Open Questions

These should not be silently decided:
- whether adapter plugins are static modules or dynamically discovered packages
- whether adapters run in-process or as subprocesses
- exact configuration file shape for adapter targets
- exact behavior of destructive operations
- which adapter follows Hermes after v0.1
