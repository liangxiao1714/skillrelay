# Definition of Done

- Status: accepted
- Last reviewed: 2026-05-25

## Purpose

Define what "done" means at each level of work in SkillRelay. Without a shared definition, "done" is whatever the implementer happens to feel like.

This doc is binding. Any reviewer (human or agent) may reject work that does not satisfy the applicable level.

## Scope

Covers five levels:

1. Documentation docs
2. Architecture Decision Records (ADRs)
3. Technical specs
4. Task tickets
5. Code changes

## Level 1 — Doc-level: a documentation doc is done when

- [ ] Filename and location follow [document-conventions.md](./document-conventions.md).
- [ ] Header (status, last reviewed) is present and current.
- [ ] Purpose and Scope sections are stated.
- [ ] All sections required by the doc type are present.
- [ ] Any Open Questions are mirrored into [../open-questions.md](../open-questions.md) with stable `Q-NNNN` IDs.
- [ ] All cross-references resolve (relative links exist).
- [ ] Status has been moved to `accepted`.

## Level 2 — ADR-level: a decision record is done when

- [ ] Level 1 criteria above are met.
- [ ] **Context** is described clearly enough that a future reader unfamiliar with the original discussion can understand the trade-offs.
- [ ] At least two alternatives are listed with explicit reasons for rejection.
- [ ] **Consequences** are recorded with three categories: positive, negative, neutral.
- [ ] **Validation criteria** state how we will know in the future whether the decision was correct.
- [ ] Status is `accepted` and a `Date` is recorded.

## Level 3 — Spec-level: a technical spec is done when

- [ ] Level 1 criteria above are met.
- [ ] **Acceptance criteria** section exists and every criterion is binary (testable as pass/fail).
- [ ] **Test items** section exists and covers every acceptance criterion.
- [ ] Edge cases and error cases are described.
- [ ] All cross-referenced contracts (adapter contract, canonical format, etc.) are consistent — no contradictions.
- [ ] If the spec introduces new terminology, [../glossary.md](../glossary.md) is updated.
- [ ] If the spec leaves anything undecided, the open items are filed in [../open-questions.md](../open-questions.md).

## Level 4 — Task-level: a task ticket is done when

- [ ] Task ticket follows the task template in [../tasks/README.md](../tasks/README.md).
- [ ] **Goal**, **Scope** (in/out), and **Dependencies** are stated.
- [ ] **Execution items** are concrete (a developer can act on them without further design).
- [ ] **Acceptance criteria** are binary (pass/fail), not subjective. No wording like "looks good" or "is fast enough".
- [ ] **Test items** are concrete enough to translate directly into test files.
- [ ] All referenced specs exist and are in `accepted` state.
- [ ] All `Depends on` tasks are listed (and themselves not cancelled).

## Level 5 — Code-level: a code change is done when

- [ ] All linked task **acceptance criteria** pass.
- [ ] All linked task **test items** are implemented as automated tests.
- [ ] Tests pass locally; tests pass in CI (once CI exists).
- [ ] Lint and format checks pass.
- [ ] TypeScript compiles with **no errors** and **no `any`** outside of explicitly justified, commented spots.
- [ ] Public APIs match the documented contract; deviations require updating the spec first and re-accepting it.
- [ ] CHANGELOG entry added (once a release process exists).
- [ ] User-facing docs updated if behavior changed.
- [ ] Commit messages follow Conventional Commits.

## Documentation-First Hard Rule

> **No code is merged before the governing docs (spec + task) are `accepted`.**

If implementation reveals that a spec is wrong:

1. **Stop** coding.
2. Downgrade the spec to `draft` or `review`.
3. Resolve the issue and re-accept the spec.
4. Resume coding under the corrected spec.

This rule exists to keep documentation and implementation in continuous agreement. Drift is a project failure, not a normal cost of doing work.

## Quick Reference: "Can I merge?"

A change can be merged only if, for every level it touches:

| Touches | Must satisfy |
|---|---|
| New/changed doc | Level 1 |
| New/changed ADR | Level 1 + 2 |
| New/changed spec | Level 1 + 3 |
| New/changed task | Level 1 + 4 |
| New/changed code | Level 5 (and all upstream Levels 3 + 4 must be satisfied for the referenced spec/task) |

## References

- [document-conventions.md](./document-conventions.md)
- [../decisions/README.md](../decisions/README.md)
- [../tasks/README.md](../tasks/README.md)
- [../glossary.md](../glossary.md)
- [../open-questions.md](../open-questions.md)
