# Spec: CLI Commands

- Status: accepted
- Last reviewed: 2026-06-14
- Depends on: [../../v0.1-scope.md](../v0.1-scope.md), [ADR-0001](../decisions/0001-language-and-stack.md)
- Related: [Q-0009](../open-questions.md), [Q-0010](../open-questions.md), [Q-0011](../open-questions.md)

## Purpose

Define the v0.1 CLI command surface: command names, arguments, options, output format, and exit codes. This spec is the authoritative reference for `src/cli/commands/`.

## 1. Binary Name

```
skillrelay
```

Short aliases (`sr`, `relay`) are **not shipped in v0.1**. This resolves Q-0009 for the initial release.
Relay-themed command aliases (`pass`, `catch`, `broadcast`) are **internal vocabulary only** for v0.1. This resolves Q-0010.

## 2. Global Options

Applicable to all commands:

| Option | Type | Default | Description |
|---|---|---|---|
| `--registry <path>` | string | `~/.skillrelay` | Override registry root path |
| `--json` | flag | false | Output JSON instead of human-readable text |
| `--no-color` | flag | false | Disable ANSI color output |
| `--quiet` | flag | false | Suppress informational output; only show errors |
| `--version` | flag | — | Show CLI version and exit |
| `--help` | flag | — | Show help and exit |

JSON output mode (`--json`) is supported for: `list`, `info`, `status`, `validate`. This resolves Q-0011 for v0.1.

## 3. Command Reference

### `skillrelay init`

Initialize a new local registry.

```
skillrelay init [--registry <path>]
```

**Behavior**:
- Creates the registry directory structure (see `specs/registry-layout.md`).
- If registry already exists at target path, prints an informational message and exits 0 (idempotent).
- Prints confirmation of path where registry was created.

**Exit codes**:
- `0` — success or already initialized.
- `1` — cannot create directory (permission error, path conflict).

---

### `skillrelay list`

List all skills in the registry.

```
skillrelay list [--registry <path>] [--json] [--quiet]
```

**Behavior**:
- Enumerates all `skills/<skill-id>/skill.yaml` files.
- Prints a table row per skill: `ID`, `NAME`, `VERSION`, `REGISTRY_STATE`, `VALIDATION_STATE`.
- Skills with parse errors are listed as `[error]` rows, not silently skipped.
- If registry is not initialized, exits with error.

**Human output example**:
```
ID                                      NAME                       VERSION      STATE    VALIDATION
systematic-debugging-a1b2c3d4e5        systematic-debugging       1.0.0        active   valid
my-workflow-f9e8d7c6b5                  my-workflow                unversioned  active   warning
```

**JSON output**: array of skill summary objects.

**Exit codes**:
- `0` — success (even if list is empty).
- `2` — registry not initialized.

---

### `skillrelay info <skill-id>`

Show full details for one skill.

```
skillrelay info <skill-id> [--registry <path>] [--json]
```

**Arguments**:
- `<skill-id>` — the skill ID (full string) or an unambiguous name prefix.

**Behavior**:
- Reads and displays all fields from `skill.yaml`.
- Displays content preview (first 5 lines of `content.md`).
- Shows per-adapter status under `Adapters:`.
- If `<skill-id>` matches multiple skills, lists matches and exits with error.
- If `<skill-id>` is not found, exits with error.

**Exit codes**:
- `0` — found and displayed.
- `2` — registry not initialized.
- `3` — skill not found.
- `4` — ambiguous ID (multiple matches).

---

### `skillrelay import <path>`

Import a skill from a local file or directory into the registry.

```
skillrelay import <path> [--registry <path>] [--name <name>] [--dry-run]
```

**Arguments**:
- `<path>` — path to a `SKILL.md` file or a directory containing a skill definition.

**Options**:
- `--name <name>` — override the detected skill name.
- `--dry-run` — parse and validate without writing to registry. Prints what would be written.

**Behavior**:
- Detects source type (`local_file` or `local_dir`).
- Parses skill metadata and content.
- Generates canonical skill ID.
- If a skill with the same ID already exists: reports conflict and exits without overwriting.
- If a skill with the same name but different origin already exists: reports conflict; does not abort unless IDs clash.
- Writes canonical record to registry.
- Prints the assigned skill ID on success.

**Exit codes**:
- `0` — imported successfully.
- `1` — parse error or unsupported format.
- `2` — registry not initialized.
- `5` — conflict: skill with same ID already exists.

---

### `skillrelay status <skill-id>`

Show the sync and registry status of a skill.

```
skillrelay status <skill-id> [--registry <path>] [--json]
```

**Behavior**:
- Reads `skill.yaml` for the given ID.
- Displays:
  - Registry state and validation state.
  - Origin (source type, URI, imported_at).
  - Per-adapter state (supported, last exported/imported, target path).
  - Conflict state if present.

**Exit codes**:
- `0` — found.
- `2` — registry not initialized.
- `3` — skill not found.

---

### `skillrelay validate <skill-id>`

Validate a skill's canonical record.

```
skillrelay validate <skill-id> [--registry <path>] [--json]
```

**Behavior**:
- Reads and validates `skill.yaml` against the canonical schema.
- Checks that `content.md` is readable.
- Runs field-level validation rules (see `specs/schema/skill.md §4`).
- Prints a structured pass/warning/fail report.
- Updates `status.validation_state` in `skill.yaml` on completion.

**Human output example**:
```
✓  systematic-debugging-a1b2c3d4e5
   Result: warning
   Warnings:
     - version is "unversioned"
     - compatibility.agents is empty
```

**Exit codes**:
- `0` — valid (no errors; warnings may be present).
- `1` — invalid (one or more errors).
- `2` — registry not initialized.
- `3` — skill not found.

---

### `skillrelay export <skill-id> <agent>`

Export a skill from the registry into an agent-native artifact or directory.

```
skillrelay export <skill-id> <agent> [--registry <path>] [--target <path>] [--dry-run] [--overwrite]
```

**Arguments**:
- `<skill-id>` — skill to export.
- `<agent>` — adapter name (e.g. `hermes`).

**Options**:
- `--target <path>` — override the default agent target directory.
- `--dry-run` — describe what would be written without writing anything.
- `--overwrite` — allow overwriting if skill already exists at target (default: refuse with conflict error).

**Behavior**:
- Detects the adapter for `<agent>`.
- Validates the skill before exporting.
- Calls adapter `export_skill()`.
- On success, updates `adapters.<agent>.last_exported_at` and `target_path` in `skill.yaml`.
- On conflict (target already exists), reports details and exits unless `--overwrite` is set.

**Exit codes**:
- `0` — exported successfully.
- `1` — validation failed; not exported.
- `2` — registry not initialized.
- `3` — skill not found.
- `5` — conflict at target.
- `6` — adapter not found or agent not available.

## 4. Exit Code Reference

| Code | Meaning |
|---|---|
| `0` | Success |
| `1` | Input / parse / validation error |
| `2` | Registry not initialized |
| `3` | Skill not found |
| `4` | Ambiguous identifier |
| `5` | Conflict (duplicate, overwrite risk) |
| `6` | Adapter or agent unavailable |
| `127` | Internal unexpected error |

## 5. Output Formatting Rules

- Human output goes to **stdout** for data, **stderr** for diagnostics and errors.
- `--json` output is always on **stdout**, one JSON value (not NDJSON) unless explicitly stated.
- `--quiet` suppresses all stdout output except the primary result.
- ANSI color is used by default when stdout is a TTY; disabled when piped or when `--no-color` is set.
- All timestamps in output are displayed in local time in human mode; ISO 8601 UTC in JSON mode.

## 6. Unresolved (deferred to v0.1.1 or later)

- `skillrelay source add/list/remove/enable/disable` — source management commands.
- `skillrelay search` — search local registry by name, tag, category.
- `skillrelay remove` — remove a skill from the registry.
- `skillrelay config` — configuration management.
- `skillrelay publish` — publish skills to external sources.

## References

- [../v0.1-scope.md](../v0.1-scope.md)
- [../open-questions.md](../open-questions.md) (Q-0009, Q-0010, Q-0011)
- [schema/skill.md](./schema/skill.md)
- [registry-layout.md](./registry-layout.md)
- [../adapter-contract.md](../adapter-contract.md)
