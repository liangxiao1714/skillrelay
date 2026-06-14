# ADR-0002: v0.1 Registry and Canonical Skill Defaults

- Status: accepted
- Date: 2026-06-02
- Deciders: SkillRelay maintainers
- Related: [../open-questions.md](../open-questions.md), [../canonical-skill-format.md](../canonical-skill-format.md), [../v0.1-scope.md](../v0.1-scope.md), [ADR-0001](./0001-language-and-stack.md)

## Context

SkillRelay v0.1 needs enough foundational decisions to move from documentation planning into executable specs and tasks.

The next implementation work is blocked by four open questions:

| Question | Topic |
|---|---|
| [Q-0001](../open-questions.md) | Registry storage backend |
| [Q-0002](../open-questions.md) | Skill ID generation algorithm |
| [Q-0003](../open-questions.md) | Default version when source has none |
| [Q-0004](../open-questions.md) | Canonical content format coverage in v0.1 |

The v0.1 scope favors a small, inspectable, local-first vertical slice over a complete long-term storage system. The implementation contract requires the registry to preserve provenance, expose status, avoid silent conflict resolution, and stay adapter-isolated.

These decisions should keep the first implementation simple without painting the project into a corner.

## Decision

For v0.1, SkillRelay uses:

| Question | Decision |
|---|---|
| Q-0001 | Filesystem-only registry backend |
| Q-0002 | Deterministic skill ID: normalized name plus short SHA-256 hash over identity inputs |
| Q-0003 | Default missing source version to `unversioned` |
| Q-0004 | Canonical content supports Markdown only |

### Q-0001: Registry storage backend

Use a filesystem-only registry for v0.1.

The registry stores one directory per canonical skill record:

```text
<registry>/
  registry.yaml
  skills/
    <skill-id>/
      skill.yaml
      content.md
      original/
      assets/
```

The exact registry layout belongs in `docs/specs/registry-layout.md`, but v0.1 should preserve these properties:

- Human-inspectable YAML and Markdown files.
- No database dependency for the first vertical slice.
- Atomic-enough writes through temporary files plus rename where practical.
- Future migration path to SQLite or a hybrid index if search/status performance requires it.

### Q-0002: Skill ID generation algorithm

Generate skill IDs deterministically from normalized identity inputs.

Recommended v0.1 shape:

```text
<normalized-name>-<short-hash>
```

Where:

- `normalized-name` is derived from the display name:
  - lowercase,
  - trim leading/trailing whitespace,
  - replace runs of non-alphanumeric characters with `-`,
  - collapse repeated `-`,
  - trim leading/trailing `-`.
- `short-hash` is the first 10 hex characters of SHA-256 over a stable identity payload.

Recommended identity payload for v0.1:

```yaml
name: <canonical name>
version: <canonical version>
origin_type: <origin type>
origin_uri: <normalized origin uri>
```

This gives stable IDs for repeated imports from the same origin while allowing same-name skills from different sources to coexist.

If the normalized name is empty, use `skill` as the name prefix before appending the hash.

### Q-0003: Default version when source has none

Use `unversioned` when imported source material has no explicit version.

Rationale:

- It is honest: the source did not provide semantic version information.
- It avoids inventing SemVer semantics that do not exist.
- It allows validation to warn clearly: version is missing or unversioned.
- It keeps later version inference or source-specific mapping possible.

A skill with `version: unversioned` is allowed in v0.1 but should produce a validation warning, not an error.

### Q-0004: Canonical content format coverage in v0.1

Support Markdown-only canonical readable content in v0.1.

Canonical records should use:

```yaml
content:
  type: markdown
  path: content.md
```

For source formats that are already Markdown, copy or normalize into `content.md` while preserving original files under `original/` where practical.

Non-Markdown sources are out of scope for v0.1 unless a later spec explicitly defines a conversion rule. Import should fail or warn clearly rather than silently storing arbitrary unsupported content as canonical content.

## Consequences

### Positive

- The first registry implementation stays simple, reviewable, and easy to debug.
- Users and agents can inspect registry state with normal filesystem tools.
- The ID scheme supports same-name skills from different origins without requiring a database sequence.
- `unversioned` preserves truth about source metadata instead of inventing `0.0.0`.
- Markdown-only content matches Hermes and the expected first adapter path.
- The decisions unblock the schema, registry layout, and phase-0 task specs.

### Negative

- Filesystem-only registry makes complex querying slower than SQLite.
- Deterministic IDs depend on careful URI normalization; changes to normalization rules can affect repeat imports.
- `unversioned` is not SemVer and may need special handling in sorting or conflict reporting.
- Markdown-only content excludes some future skill formats from v0.1 import.

### Neutral

- A future SQLite or hybrid index can be added without changing the canonical skill directory as the durable source of truth.
- The short hash length can be revisited if collision risk becomes material.
- Adapters may preserve richer native content under `original/` even when canonical content remains Markdown.

## Alternatives Considered

### SQLite registry backend

SQLite would provide stronger query, indexing, and transaction semantics.

It is not chosen for v0.1 because the first implementation needs transparent local files more than complex query performance. SQLite remains a candidate for v0.2+ as an index or as the primary store if registry size and query needs justify it.

### Hybrid filesystem plus SQLite index

A hybrid design would keep files as source-of-truth and maintain SQLite for fast lookup.

It is not chosen for v0.1 because it doubles the implementation and migration surface before the canonical model is proven. The filesystem layout should avoid blocking this later.

### Content-hash-only skill IDs

Content hashes are stable for exact content, but they change whenever the skill text changes. That makes them poor long-term identities for a managed skill that may evolve.

### ULID skill IDs

ULIDs are simple and collision-resistant, but they are not deterministic. Re-importing the same source would require additional duplicate detection before identity can be recognized.

### Default missing versions to `0.0.0`

`0.0.0` is SemVer-like and tool-friendly, but it implies a concrete version chosen by the source or registry. That can hide the difference between a deliberately versioned skill and an unversioned source.

### Error on missing source version

Rejecting unversioned skills would make v0.1 too strict for real agent skill directories, especially Markdown-first ecosystems where versions are often absent.

### Markdown plus plain text content

Plain text support is straightforward, but it expands the schema and adapter surface before the first Hermes-oriented path needs it. Plain text can be added later through an explicit schema evolution.

### Arbitrary content types

Supporting arbitrary content would better preserve source formats, but it weakens validation and conversion guarantees in the first release.

## Validation Criteria

This ADR is considered correct if, before v0.1 release:

- `docs/specs/schema/skill.md` can define a complete v0.1 schema using `unversioned` and Markdown-only canonical content.
- `docs/specs/registry-layout.md` can define registry init/read/write without requiring SQLite.
- Importing the same local skill twice from the same origin yields the same skill ID.
- Importing same-name skills from different origins yields different skill IDs.
- Validation warns, but does not fail, for `version: unversioned`.
- At least one Hermes skill can be imported into canonical Markdown content and exported back through the Hermes adapter path.

Revisit this ADR if any of these conditions fail or if normal local registries above 10,000 skills become too slow to list/status with filesystem-only reads.

## References

- [../implementation-contract.md](../implementation-contract.md)
- [../v0.1-scope.md](../v0.1-scope.md)
- [../canonical-skill-format.md](../canonical-skill-format.md)
- [../open-questions.md](../open-questions.md)
- [ADR-0001](./0001-language-and-stack.md)
