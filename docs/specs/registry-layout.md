# Spec: Registry Layout

- Status: accepted
- Last reviewed: 2026-06-14
- Depends on: [ADR-0002](../decisions/0002-v0-1-registry-and-canonical-skill-defaults.md), [../canonical-skill-format.md](../canonical-skill-format.md)
- Resolves: [Q-0001](../open-questions.md)

## Purpose

Define the on-disk directory layout of the local SkillRelay registry. This spec is the authoritative reference for all registry read/write operations in `src/core/registry/`.

## 1. Default Registry Location

```text
~/.skillrelay/
```

This default may be overridden by:
1. The environment variable `SKILLRELAY_REGISTRY` (if set).
2. The `registry.path` field in a project-level config file (see `specs/config-file.md`).

The override resolution order is: `SKILLRELAY_REGISTRY` > config file > default.

## 2. Top-Level Layout

```text
<registry>/
├── registry.yaml        # registry-level metadata and index header
└── skills/
    └── <skill-id>/      # one directory per canonical skill record
        ├── skill.yaml   # canonical metadata + registry state
        ├── content.md   # canonical readable content (Markdown)
        ├── original/    # original imported source files (preserved as-is)
        └── assets/      # optional additional assets (images, schemas, etc.)
```

All paths are relative to the registry root. No subdirectory nesting beyond `skills/<skill-id>/`.

## 3. `registry.yaml`

This file is the registry index header. It records registry-level metadata.

### Required fields

```yaml
schema_version: 1
created_at: <iso8601>
updated_at: <iso8601>
```

### Optional fields

```yaml
label: string          # human label for this registry instance (e.g. "home")
description: string    # optional note
```

`registry.yaml` is updated on every write that modifies the registry (init, import, remove).

## 4. `skills/<skill-id>/skill.yaml`

This file is the canonical record for one skill. Its shape is defined in `docs/specs/schema/skill.md`.

The `skill-id` directory name is the stable ID generated per ADR-0002 §Q-0002:

```
<normalized-name>-<first-10-hex-of-SHA-256>
```

## 5. `skills/<skill-id>/content.md`

The canonical readable content for the skill. In v0.1, always Markdown. The file must be UTF-8 encoded.

This file is referenced from `skill.yaml` via:

```yaml
content:
  type: markdown
  path: content.md
```

The path is relative to the skill directory (`skills/<skill-id>/`).

## 6. `skills/<skill-id>/original/`

Preserved copies of the original imported files, if available. These files are never parsed by the registry core after import — they exist for auditability and for adapters that want to reconstruct source-native artifacts.

Contents are determined by the import source:
- For a local `SKILL.md` file, the original file is copied here as-is.
- For a local directory import, the directory contents are mirrored here.
- For a Hermes skill, the Hermes-native directory is mirrored here.

## 7. `skills/<skill-id>/assets/`

Optional directory for additional skill assets (images, JSON schemas, example files, etc.) referenced from `content.md`. Created on demand; absence is valid.

## 8. Write Semantics

### Atomic writes

All writes to `skill.yaml` and `content.md` use a write-to-temp-then-rename pattern to avoid partial writes:

1. Write to `<skill-id>/skill.yaml.tmp`.
2. `fsync` the temp file.
3. `rename()` (atomic on POSIX) to `<skill-id>/skill.yaml`.

### Skill directory creation

Creating a new skill record:

1. Generate `<skill-id>`.
2. Check that `skills/<skill-id>/` does not already exist. If it does, detect conflict (do not overwrite silently).
3. Create `skills/<skill-id>/` directory.
4. Write `skill.yaml` atomically.
5. Write `content.md` atomically.
6. Copy original files to `original/` if available.
7. Update `registry.yaml` `updated_at`.

### Skill directory removal

Removing a skill record:

1. Read and validate the existing record (fail if not found).
2. Rename the directory to `skills/<skill-id>.removed-<timestamp>` (soft delete).
3. Update `registry.yaml` `updated_at`.

Hard-delete (permanent removal) is a separate explicit operation, not the default.

## 9. Registry Init

`skillrelay init` creates the registry if it does not exist:

1. Resolve the registry root path.
2. If `<registry>/registry.yaml` already exists → output a message and exit without error (idempotent).
3. Create `<registry>/` directory (including parents) if needed.
4. Create `<registry>/skills/` directory.
5. Write `registry.yaml` with `schema_version: 1`, `created_at`, `updated_at`.

## 10. Read Semantics

### Listing all skills

To list all skills, enumerate `skills/*/skill.yaml` and parse each file through the canonical skill schema.

Skills with parse errors are reported as invalid entries, not silently skipped.

### Reading one skill

Given a skill ID, read `skills/<skill-id>/skill.yaml`. Fail with `RegistryError` if the directory or file does not exist.

### Checking existence

Before any write, check for directory existence using `fs.stat`. Do not rely on catch-and-create patterns.

## 11. Path Constants

All path computations live in `src/core/registry/layout.ts`. No other module hard-codes registry subdirectory names.

```ts
// Illustrative — not final API
registryYamlPath(root: string): string
skillsDirPath(root: string): string
skillDirPath(root: string, skillId: SkillId): string
skillYamlPath(root: string, skillId: SkillId): string
skillContentPath(root: string, skillId: SkillId): string
skillOriginalDirPath(root: string, skillId: SkillId): string
```

## 12. Validation Criteria

- `skillrelay init` creates the structure in §2 and produces a valid `registry.yaml`.
- Importing the same skill twice from the same origin detects a conflict and does not overwrite.
- Listing skills reads all `skill.yaml` files under `skills/` correctly.
- Skill directory names match the ID pattern from ADR-0002.

## References

- [ADR-0002](../decisions/0002-v0-1-registry-and-canonical-skill-defaults.md)
- [../canonical-skill-format.md](../canonical-skill-format.md)
- [schema/skill.md](./schema/skill.md)
- [../open-questions.md](../open-questions.md) (Q-R0003)
- [../development/project-structure.md](../development/project-structure.md)
