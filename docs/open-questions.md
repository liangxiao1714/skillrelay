# Open Questions

- Status: accepted
- Last reviewed: 2026-05-25

## Purpose

Central log of decisions that have been deliberately **not made yet**. Each entry records:

- the question,
- the candidate answers,
- the doc(s) that surfaced it,
- a trigger condition for when it must be decided,
- the current status.

When a question is resolved, move it to the **Resolved** section with a link to the ADR or spec that resolved it.

## How to add an entry

Append a new row to the **Open** table. Use a stable `Q-NNNN` ID. IDs are never reused.

When mirroring an `Open Questions` section from another doc, copy the question here and back-reference both ways.

## Open

| ID | Question | Surfaced in | Candidates | Trigger to decide | Status |
|---|---|---|---|---|---|
| Q-0005 | Adapter loading model (dynamic discovery) | [adapter-contract.md §11](./adapter-contract.md) | static built-in (v0.1), dynamic npm `@skillrelay/adapter-*`, both | v0.1 static decided in [ADR-0001](./decisions/0001-language-and-stack.md); dynamic deferred | partially resolved |
| Q-0006 | Adapter execution model | [adapter-contract.md §11](./adapter-contract.md) | in-process, subprocess | Before Hermes adapter skeleton (T-0007) | open |
| Q-0007 | Adapter target configuration shape | [adapter-contract.md §11](./adapter-contract.md) | per-adapter config file, central config, env vars, hybrid | Before [specs/config-file.md](./specs/config-file.md) | open |
| Q-0008 | Destructive operation behavior (remove/overwrite) | [adapter-contract.md §11](./adapter-contract.md) | always dry-run-first, prompt, flag-gated | Before T-0008 (export/push) | open |
| Q-0009 | CLI short aliases (`sr`, `relay`) ship in v0.1? | [../README.md](../README.md), [../CLAUDE.md](../CLAUDE.md) | yes, no, configurable | Before [specs/cli-commands.md](./specs/cli-commands.md) | open |
| Q-0010 | Relay-themed verbs as user-facing CLI commands | [glossary.md](./glossary.md) | use as primary, use as aliases, internal-only | Before CLI command spec freeze | open |
| Q-0011 | JSON output mode coverage in v0.1 | [v0.1-scope.md §4](./v0.1-scope.md) | all commands, list/info only, none | Before [specs/cli-commands.md](./specs/cli-commands.md) | open |
| Q-0012 | Conflict resolution UX in v0.1 | [adapter-contract.md §7](./adapter-contract.md) | report only, prompt, flag-driven | Before T-0008 (export/push) | open |

## Resolved

| ID | Question | Resolution | Resolved by | Date |
|---|---|---|---|---|
| Q-R0001 | Implementation language and stack | TypeScript on Node.js ≥ 20 LTS, ESM, pnpm, tsup, vitest, commander, zod, js-yaml, Biome | [ADR-0001](./decisions/0001-language-and-stack.md) | 2026-05-25 |
| Q-R0002 | Earlier codename "SkillMesh" — keep or drop? | Drop; deprecated in favor of SkillRelay | [../CLAUDE.md](../CLAUDE.md) §Project Identity | 2026-05-24 |
| Q-R0003 | Registry storage backend | Filesystem-only for v0.1; one directory per skill, human-inspectable YAML + Markdown; SQLite deferred | [ADR-0002](./decisions/0002-v0-1-registry-and-canonical-skill-defaults.md) | 2026-06-02 |
| Q-R0004 | Skill ID generation algorithm | `<normalized-name>-<first-10-hex-of-SHA-256-over-identity-payload>`; deterministic, same-origin yields same ID | [ADR-0002](./decisions/0002-v0-1-registry-and-canonical-skill-defaults.md) | 2026-06-02 |
| Q-R0005 | Default version when source has none | `unversioned`; honest, warns on validation, not an error | [ADR-0002](./decisions/0002-v0-1-registry-and-canonical-skill-defaults.md) | 2026-06-02 |
| Q-R0006 | Canonical content format coverage in v0.1 | Markdown only; non-Markdown sources fail or warn clearly | [ADR-0002](./decisions/0002-v0-1-registry-and-canonical-skill-defaults.md) | 2026-06-02 |

## Rules

- Every open question must point to the doc(s) that raised it.
- A question may not stay `open` past its trigger condition without an explicit deferral note added to its row.
- When a question is resolved:
  - Move it to **Resolved**, keeping a stable `Q-RNNNN` reference (the original `Q-NNNN` is preserved in commit history).
  - The ADR or spec that resolves it must back-link to its Q-ID.
  - Any doc that surfaced the question should be updated to point at the resolution.

## References

- [decisions/README.md](./decisions/README.md)
- [development/document-conventions.md](./development/document-conventions.md) (Open Questions discipline)
