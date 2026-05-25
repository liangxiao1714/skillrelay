# Architecture Decision Records (ADRs)

- Status: accepted
- Last reviewed: 2026-05-25

## Purpose

ADRs capture **architecturally significant decisions** and their rationale, so future contributors (including future-us) can understand *why* a thing was done, not just *what* was done.

## When to write an ADR

Write an ADR for any decision that:

- Affects multiple components or modules.
- Constrains future work (language, framework, storage, protocol choice).
- Trades off measurable properties (performance, simplicity, portability).
- Is likely to be questioned later.
- Replaces or supersedes a previous decision.

You do **not** need an ADR for:

- Local refactoring choices.
- Code style preferences (those live in `development/coding-standards.md`).
- Reversible micro-decisions.

## File naming

`NNNN-short-kebab-title.md` where `NNNN` is a 4-digit zero-padded sequential number.

Numbers are **never reused**. If an ADR is rejected, mark its status `rejected` but keep the file and the number.

## Template

Use the following template when creating a new ADR:

````markdown
# ADR-NNNN: <Title>

- Status: proposed | accepted | rejected | deprecated | superseded by ADR-XXXX
- Date: YYYY-MM-DD
- Deciders: <name(s) or role(s)>
- Related: <ADR / doc links>

## Context

What problem are we solving? What constraints are in play? What did we know at the time of the decision?

## Decision

The decision in one or two clear sentences. Then any necessary detail (tables, lists).

## Consequences

### Positive
- ...

### Negative
- ...

### Neutral
- ...

## Alternatives Considered

### Alternative A
- Why it was considered
- Why it was not chosen

### Alternative B
- ...

## Validation Criteria

How we will know, later, whether this decision was correct. State concrete checks with rough deadlines.

## References

- Links to discussion, prior art, related specs.
````

## Index

| ADR | Title | Status | Date |
|---|---|---|---|
| [0001](./0001-language-and-stack.md) | Language and core stack | accepted | 2026-05-25 |

> Add new entries **above** this line. Keep the table newest-first.

## Status Lifecycle

```text
proposed ──► accepted ──► deprecated | superseded by ADR-XXXX
    │
    └──► rejected
```

A rejected ADR keeps its number and file so the history of consideration is preserved. Do not delete ADR files.

## References

- [../development/document-conventions.md](../development/document-conventions.md)
- [../development/definition-of-done.md](../development/definition-of-done.md) (Level 2: ADR-level done criteria)
