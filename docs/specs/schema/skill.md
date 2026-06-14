# Spec: Canonical Skill Schema

- Status: accepted
- Last reviewed: 2026-06-14
- Depends on: [ADR-0002](../../decisions/0002-v0-1-registry-and-canonical-skill-defaults.md), [../../canonical-skill-format.md](../../canonical-skill-format.md)
- Resolves: [Q-0002](../../open-questions.md), [Q-0003](../../open-questions.md), [Q-0004](../../open-questions.md)

## Purpose

Define the complete v0.1 canonical skill schema as implemented by the zod schema at `src/core/schema/skill.ts`. This spec is the authoritative reference; the zod schema is the runtime implementation of this spec.

## 1. Schema Version

All canonical skill records carry `schema_version: 1`. This field gates forward-compatibility checks.

## 2. Skill ID Type

Skill IDs are branded strings with the shape:

```
<normalized-name>-<first-10-hex-of-SHA-256>
```

Example: `systematic-debugging-a1b2c3d4e5`

Generation rules are defined in [ADR-0002 §Q-0002](../../decisions/0002-v0-1-registry-and-canonical-skill-defaults.md) and implemented in `src/core/id/`.

## 3. Complete Field Reference

### 3.1 Top-level Required Fields

| Field | Type | Notes |
|---|---|---|
| `schema_version` | `1` (literal) | Always `1` for v0.1 |
| `id` | `SkillId` (branded string) | Stable registry identity |
| `name` | `string` (non-empty) | Human-readable display name |
| `version` | `string` (non-empty) | Skill version; `"unversioned"` when source has none |
| `summary` | `string` (non-empty) | One-line description of the skill |
| `content` | `SkillContent` | Pointer to canonical readable content |
| `origin` | `SkillOrigin` | Where this skill came from |
| `compatibility` | `SkillCompatibility` | Agent compatibility info |
| `status` | `SkillStatus` | Registry-level state |

### 3.2 Top-level Optional Fields

| Field | Type | Notes |
|---|---|---|
| `description` | `string` | Longer description (multi-line allowed) |
| `tags` | `string[]` | Flat list of tags |
| `categories` | `string[]` | Category groupings |
| `author` | `string` | Author name or identifier |
| `license` | `string` | SPDX license identifier or free text |
| `homepage` | `string` (URL) | Canonical URL for this skill |
| `source_metadata` | `Record<string, unknown>` | Preserved source-specific fields |
| `requirements` | `SkillRequirements` | Runtime requirements |
| `safety` | `SkillSafety` | Trust and risk info |
| `conflicts` | `SkillConflicts` | Conflict state |
| `adapters` | `Record<string, AdapterState>` | Per-agent adapter tracking |

### 3.3 `SkillContent`

```yaml
content:
  type: markdown           # only "markdown" in v0.1
  path: content.md         # relative to the skill directory
```

| Field | Type | Notes |
|---|---|---|
| `type` | `"markdown"` (literal) | Only Markdown in v0.1 |
| `path` | `string` (non-empty) | Relative path from skill directory |

### 3.4 `SkillOrigin`

```yaml
origin:
  type: local_file         # origin type (see enum below)
  uri: /path/to/SKILL.md  # normalized source URI
  imported_at: "2026-06-14T00:00:00Z"
```

| Field | Type | Notes |
|---|---|---|
| `type` | `OriginType` | One of the enum values below |
| `uri` | `string` (non-empty) | Normalized source URI |
| `imported_at` | `string` (ISO 8601) | Timestamp of import |

**`OriginType` enum**:

| Value | Meaning |
|---|---|
| `local_file` | A single file on the local filesystem |
| `local_dir` | A directory on the local filesystem |
| `git` | A git repository |
| `skillhub` | SkillHub source |
| `agent` | Imported from a running agent's skill directory |
| `url` | An arbitrary URL |
| `unknown` | Origin could not be determined |

### 3.5 `SkillCompatibility`

```yaml
compatibility:
  agents:
    - hermes
```

| Field | Type | Notes |
|---|---|---|
| `agents` | `string[]` | Agent identifiers known to support this skill; may be empty |

### 3.6 `SkillStatus`

```yaml
status:
  registry_state: active
  validation_state: unknown
```

| Field | Type | Notes |
|---|---|---|
| `registry_state` | `RegistryState` | Current registry-level state |
| `validation_state` | `ValidationState` | Last known validation result |

**`RegistryState` enum**: `"active"` | `"disabled"` | `"archived"`

**`ValidationState` enum**: `"unknown"` | `"valid"` | `"warning"` | `"invalid"`

### 3.7 `SkillRequirements`

```yaml
requirements:
  commands: []
  environment_variables: []
  files: []
  permissions: []
```

| Field | Type | Notes |
|---|---|---|
| `commands` | `string[]` | CLI commands or binaries needed |
| `environment_variables` | `string[]` | Env vars required |
| `files` | `string[]` | Files or paths required |
| `permissions` | `string[]` | Permissions or capabilities required |

All fields default to empty arrays if not present.

### 3.8 `SkillSafety`

```yaml
safety:
  trust_level: unknown
  risk_flags: []
```

| Field | Type | Notes |
|---|---|---|
| `trust_level` | `TrustLevel` | Assessment of source trust |
| `risk_flags` | `string[]` | Human-readable risk flag descriptions |

**`TrustLevel` enum**: `"unknown"` | `"trusted"` | `"community"` | `"untrusted"`

### 3.9 `SkillConflicts`

```yaml
conflicts:
  has_conflict: false
  conflict_refs: []
```

| Field | Type | Notes |
|---|---|---|
| `has_conflict` | `boolean` | Whether a conflict has been detected |
| `conflict_refs` | `string[]` | IDs of conflicting skills |

### 3.10 `AdapterState`

```yaml
adapters:
  hermes:
    supported: true
    last_exported_at: null
    last_imported_at: "2026-06-14T00:00:00Z"
    target_path: null
    notes: "Imported from Hermes skill directory."
```

| Field | Type | Notes |
|---|---|---|
| `supported` | `boolean \| "unknown"` | Whether the adapter can handle this skill |
| `last_exported_at` | `string (ISO 8601) \| null` | Last export timestamp |
| `last_imported_at` | `string (ISO 8601) \| null` | Last import timestamp |
| `target_path` | `string \| null` | Agent-native path if exported |
| `notes` | `string` | Free-text notes from the adapter |

## 4. Validation Rules

### 4.1 Required-field errors (skill is `invalid`)

- Any required field from §3.1 is missing or empty.
- `content.path` does not resolve to a readable file.
- `origin.type` is not one of the defined enum values.
- `schema_version` is not `1`.

### 4.2 Warnings (skill state is `warning`, not `invalid`)

- `version` is `"unversioned"`.
- `compatibility.agents` is empty.
- `safety.trust_level` is `"unknown"`.
- `source_metadata` is absent (minor: origin context may be lost).
- Any `requirements.commands` entry refers to a command not found on `PATH` at validation time.

### 4.3 Info (informational, does not affect state)

- `description` is absent.
- `tags` and `categories` are both empty.
- `author` or `license` is absent.

## 5. Zod Implementation Notes

- The zod schema lives at `src/core/schema/skill.ts`.
- All TypeScript types are derived via `z.infer<>` — no hand-written duplicates.
- Branded types (`SkillId`) are created with `.brand<"SkillId">()`.
- Unknown extra keys in YAML are passed through to `source_metadata` rather than causing a parse error at the top level.
- Partial schemas (e.g. for updates) should use `.partial()` on the relevant sub-schemas.

## 6. Minimal Valid Example

```yaml
schema_version: 1
id: systematic-debugging-a1b2c3d4e5
name: systematic-debugging
version: 1.0.0
summary: Four-phase root cause debugging workflow.
content:
  type: markdown
  path: content.md
origin:
  type: agent
  uri: hermes:~/.hermes/skills/software-development/systematic-debugging
  imported_at: "2026-06-14T00:00:00Z"
compatibility:
  agents:
    - hermes
status:
  registry_state: active
  validation_state: valid
```

## References

- [ADR-0002](../../decisions/0002-v0-1-registry-and-canonical-skill-defaults.md)
- [../../canonical-skill-format.md](../../canonical-skill-format.md)
- [../../open-questions.md](../../open-questions.md)
- [registry-layout.md](../registry-layout.md)
