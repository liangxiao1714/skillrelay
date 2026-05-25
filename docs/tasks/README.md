# Tasks

- Status: accepted
- Last reviewed: 2026-05-25

## Purpose

Task tickets are the **atomic units of executable work** in SkillRelay. Each ticket is granular enough that:

- a single developer can complete it without further design,
- it has binary acceptance criteria,
- it lists concrete test items.

Tickets live in `docs/tasks/phase-N/`. They are versioned in git alongside the code.

## When to create a task

Create a task ticket when:

- A spec is `accepted` and ready to be implemented.
- The work spans more than a trivial change.
- The work needs explicit acceptance criteria or testing.

Do **not** create tasks for:

- One-line fixes (use commit messages instead).
- Pure documentation edits (the doc is its own record).
- Exploratory spikes (use a draft spec or open question instead).

## File naming

`T-NNNN-short-kebab-title.md`

Numbers are **global** (not per-phase) and **never reused**. The phase is stored inside the file, not in the filename.

A cancelled task keeps its number and file.

## Template

Use this template for every new task ticket:

````markdown
# T-NNNN: <Title>

- Status: todo | in-progress | blocked | review | done | cancelled
- Phase: 0 | 1 | 2 | ...
- Owner: <name or "unassigned">
- Depends on: <T-XXXX, T-YYYY, or "none">
- Related specs: <doc link(s)>
- Created: YYYY-MM-DD
- Last updated: YYYY-MM-DD

## Goal

One sentence describing what success looks like.

## Scope

### In scope
- Bullet list of what this ticket covers.

### Out of scope
- Bullet list of what is deliberately not covered.

## Execution items

Ordered, actionable steps. Each item should be small enough to commit individually.

- [ ] step 1
- [ ] step 2
- [ ] ...

## Acceptance criteria

Each criterion must be binary (pass/fail). No subjective wording.

- [ ] criterion 1
- [ ] criterion 2
- [ ] ...

## Test items

Concrete tests that must exist for this task to be done. Reference [../development/test-strategy.md](../development/test-strategy.md) for placement and style.

- [ ] test 1 (unit / integration / e2e)
- [ ] test 2
- [ ] ...

## Risks / Notes

Anything a future implementer needs to know.

## References

- Spec links
- ADR links
- Related task links
````

## Status Lifecycle

```text
todo ──► in-progress ──► review ──► done
            │              ▲
            ▼              │
         blocked ──────────┘
            │
            ▼
        cancelled
```

| State | Meaning |
|---|---|
| **todo** | Defined and ready, not yet started. |
| **in-progress** | Active implementation. |
| **blocked** | Cannot proceed; reason must be recorded in `Risks / Notes`. |
| **review** | Implementation complete; awaiting acceptance check. |
| **done** | All acceptance criteria pass AND all test items implemented AND merged. |
| **cancelled** | Deliberately abandoned; keep the file and the number. |

## Doc-first invariant

A task ticket may **only enter `in-progress`** when:

- All `Related specs` it references are in `accepted` state.
- All `Depends on` tasks are `done`.

This invariant is enforced by reviewer discipline (and, later, by CI checks once tooling exists).

## Phase Index

| Phase | Goal | Index |
|---|---|---|
| 0 | Foundation (scaffold + canonical schema + registry I/O) | [phase-0/README.md](./phase-0/README.md) (planned) |
| 1 | Core CLI (list, install, info, status, remove, source) | (planned) |
| 2 | First Adapter end-to-end (Hermes) | (planned) |
| 3 | Multi-source search & discovery | (planned) |
| 4 | Conversion & validation across agents | (planned) |
| 5 | Publish & ecosystem | (planned) |

Phase definitions track [../roadmap.md](../roadmap.md).

## Currently Planned Task Tickets

These task tickets are planned (will be written next, in this order):

| ID | Title | Phase | Depends on |
|---|---|---|---|
| T-0001 | Scaffold TypeScript project | 0 | none |
| T-0002 | Canonical skill schema (zod) | 0 | T-0001, specs/schema/skill.md |
| T-0003 | Registry init / read / write | 0 | T-0002, specs/registry-layout.md |
| T-0004 | Import from local file/dir | 0 | T-0003 |
| T-0005 | CLI: list / info / status | 0 | T-0004, specs/cli-commands.md |
| T-0006 | Validate command | 0 | T-0002, T-0004 |
| T-0007 | Hermes adapter skeleton (detect, discover, manifest) | 0 | T-0001, adapters/hermes.md |
| T-0008 | Hermes adapter: export / push | 0 | T-0003, T-0007 |

> Task IDs are reserved here even though the task files have not yet been authored, to keep numbering stable.

## References

- [../development/document-conventions.md](../development/document-conventions.md)
- [../development/definition-of-done.md](../development/definition-of-done.md) (Level 4: task-level done criteria)
- [../roadmap.md](../roadmap.md)
- [../v0.1-scope.md](../v0.1-scope.md)
