# ADR-0001: Language and Core Stack

- Status: accepted
- Date: 2026-05-25
- Deciders: SkillRelay maintainers
- Related: [../implementation-contract.md](../implementation-contract.md), [../v0.1-scope.md](../v0.1-scope.md), [../architecture.md](../architecture.md)

## Context

SkillRelay is a CLI-first, local-first tool that:

- manages a filesystem-based registry of skills,
- reads and writes YAML metadata and Markdown content,
- exposes a plugin-style adapter system for multiple AI agents,
- targets users who already operate AI agents (Claude Code, OpenCode, Hermes, etc.), most of which run on Node.js,
- needs fast iteration through the early design phase, as the canonical schema and adapter contracts are still evolving.

[implementation-contract.md](../implementation-contract.md) §9 requires that the canonical model, registry, and one adapter slice are built before any broader features. We need a stack that supports a small, testable, vertically integrated first slice.

Candidate languages: Node.js (TypeScript), Go, Rust, Python, C#.

## Decision

SkillRelay is implemented in **TypeScript** running on **Node.js ≥ 20 LTS**, using the following core stack:

| Concern | Choice |
|---|---|
| Language | TypeScript (strict mode) |
| Runtime | Node.js ≥ 20 LTS |
| Module system | ESM (`"type": "module"`) |
| Package manager | pnpm |
| Build tool | tsup (esbuild-based) |
| CLI parser | commander |
| Schema / validation | zod |
| YAML | js-yaml |
| Markdown front-matter | gray-matter |
| Test runner | vitest |
| Lint / format | Biome |
| Distribution (v0.1) | `npm install -g skillrelay` |
| Distribution (later, optional) | Single-file builds via Node SEA or `bun build --compile` |

**Adapter loading** is **static and built-in** for v0.1. Dynamic adapter discovery via `@skillrelay/adapter-*` npm packages is deferred to v0.2 or later; see [Q-0005 in open-questions.md](../open-questions.md).

## Consequences

### Positive

- **Ecosystem fit.** Target users (Claude Code, OpenCode, Hermes) already run on Node, so users almost always have a Node runtime available.
- **Contributor pool.** Largest pool of potential third-party Adapter contributors among the candidate languages.
- **Workload fit.** Excellent libraries for YAML, Markdown, filesystem, and CLI — exactly the project's actual workload.
- **Schema safety.** TypeScript + zod gives both static and runtime safety for the canonical skill schema.
- **Plugin trajectory.** Dynamic plugin discovery is trivial when needed later (`import()`).
- **Design-phase speed.** Fast iteration during the design-heavy phase.

### Negative

- **No native single binary.** v0.1 ships via npm and requires a Node runtime. (Mitigated by user ecosystem; future path: Node SEA / bun compile.)
- **Cold-start time.** CLI cold-start is 100–300 ms higher than a Go/Rust binary. Acceptable for SkillRelay's call frequency profile.
- **`node_modules` weight.** Global installs carry transitive dependency weight. Mitigated by lean dependency selection.

### Neutral

- TypeScript adds a compile step, but `tsup` keeps it sub-second for our project size.
- ESM-only excludes some legacy CommonJS-only packages; accepted as a forward-looking choice.
- pnpm is less universally pre-installed than npm, but the install instruction `npm install -g pnpm` is one line.

## Alternatives Considered

### Go
- **Pro**: single static binary, fast startup, strong concurrency primitives.
- **Con**: weaker fit for rapid schema iteration; smaller overlap with target users; plugin system requires extra protocol design; no significant advantage for an I/O-bound CLI.
- **Verdict**: rejected. Its main advantage (distribution) is largely neutralized because target users already have Node installed.

### Rust
- **Pro**: single binary, strong correctness guarantees, mature ecosystem.
- **Con**: high iteration cost during a design-heavy phase; over-engineered for the actual workload (file I/O, parsing).
- **Verdict**: rejected for v0.1. May be revisited if a high-performance core ever becomes necessary; no such need is currently identified.

### Python
- **Pro**: rapid prototyping, good YAML/Markdown ecosystem.
- **Con**: distribution story (venv / pipx / pyenv) is the worst of all candidates for an end-user CLI; weakest overlap with target users.
- **Verdict**: rejected.

### C#
- **Pro**: maintainer is most fluent in C#; .NET 8 AOT can produce single-file binaries; `System.CommandLine` + `YamlDotNet` + `AssemblyLoadContext` could deliver every requirement.
- **Con**: target users and Adapter contributors are overwhelmingly in the Node/TS world; ecosystem fit is wrong even though the language is technically sufficient.
- **Verdict**: rejected. Not for technical reasons — purely ecosystem fit.

## Validation Criteria

This ADR is considered correct if, **six months from acceptance** (by 2026-11-25):

- v0.1 has shipped via `npm install -g skillrelay`.
- At least one third-party Adapter has been written or genuinely attempted by someone other than the original maintainer. If not, the cause must not be traceable to language friction.
- No documented case of TypeScript/Node performance blocking a CLI command for normal-size registries (< 10k skills).

If any of the above fails materially, this ADR should be revisited via a follow-up ADR (superseding this one).

## References

- [../implementation-contract.md](../implementation-contract.md)
- [../v0.1-scope.md](../v0.1-scope.md)
- [../architecture.md](../architecture.md)
- [../open-questions.md](../open-questions.md) (Q-R0001)
