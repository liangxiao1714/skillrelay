# Document Conventions

- Status: accepted
- Last reviewed: 2026-05-25

## Purpose

This document governs how all SkillRelay documentation is structured. It is the meta-rule that every other doc must follow.

## Scope

Applies to every Markdown file under `docs/` (including `docs/zh-CN/`), and to any other documentation file the project produces.

Does **not** apply to source code comments — those are governed by `development/coding-standards.md`.

## Filenames

- All lowercase.
- Kebab-case (`hyphen-separated`).
- `.md` extension.
- ADR files: `NNNN-short-kebab-title.md` (4-digit zero-padded number).
- Task files: `T-NNNN-short-kebab-title.md`.
- Numbers are global within their category and never reused.

## Required Header

Every doc begins with:

```markdown
# <Title>

- Status: draft | review | accepted | deprecated | superseded by <doc>
- Last reviewed: YYYY-MM-DD
```

Additional header fields by doc type:

| Doc type | Extra header fields |
|---|---|
| ADR | `Date`, `Deciders`, `Related` |
| Spec | `Owner` (optional), `Depends on` (optional) |
| Task | `Phase`, `Owner`, `Depends on`, `Related specs`, `Created`, `Last updated` |

## Section Order (recommended)

1. **Purpose** — Why this doc exists, in 1–3 sentences.
2. **Scope** — What is and is not covered.
3. **Definitions** (if needed) — Terms specific to this doc.
4. **Body** — The main content, organized into clear sections.
5. **Examples** (if applicable).
6. **Open Questions** (if any).
7. **References** — Cross-doc links, external links.

Specs additionally include:

- **Acceptance criteria** — How we verify the spec is correctly implemented.
- **Test items** — What must be tested.

## Style

- Prefer short paragraphs and bullet lists over prose walls.
- Use fenced code blocks with a language tag (`yaml`, `ts`, `bash`, `text`).
- Inline code for identifiers, file paths, command names.
- Use tables for enumerable concepts.
- Use blockquotes for callouts and warnings.
- Avoid passive voice when describing actions.
- Avoid future-tense for things that are already true.

## Cross-references

- Use **relative paths** within the repository.
- When referring to ADRs, write `ADR-0001` plus a link.
- When referring to tasks, write `T-0001` plus a link.
- When referring to open questions, write `Q-0001` plus a link.
- External links should be stable URLs; avoid linking to volatile content where possible.

## Code Fences with Embedded Markdown

When a code block needs to **contain** another Markdown code block (such as a template), use **four backticks** for the outer fence and three for the inner. Example:

````text
````markdown
```yaml
key: value
```
````
````

## Language Policy

- **Primary language is English.** All authoritative docs live in `docs/` and are written in English.
- **Chinese mirror** lives under `docs/zh-CN/`. It is not required to land an English doc, but a Chinese doc **must** always have an English counterpart.
- Translation drift is acceptable in the short term; long-term, the i18n strategy doc (planned) defines reconciliation rules.

## Status Lifecycle

```text
draft -> review -> accepted
                     |
                     v
                 deprecated | superseded by <doc>
```

- **draft**: under active writing.
- **review**: author considers it complete; awaiting acceptance.
- **accepted**: authoritative.
- **deprecated**: no longer applicable; kept for history.
- **superseded by `<doc>`**: explicitly replaced; link the replacement.

Only **accepted** docs are authoritative.

## Diff Discipline

- Any change to an **accepted** doc requires bumping `Last reviewed` and noting the change in the commit message.
- A breaking change to an accepted doc downgrades its status to `review` until re-accepted.
- Renaming or removing an accepted doc requires a `superseded by <doc>` redirect or a deprecation note linked from `docs/README.md`.

## Open Questions Discipline

- Each doc may have an `Open Questions` section.
- Items there **must** be mirrored into [open-questions.md](../open-questions.md) with a stable `Q-NNNN` ID so they can be tracked centrally.
- When a question is resolved, link the resolution back to the originating doc.

## Commit Message Convention

Documentation commits follow [Conventional Commits](https://www.conventionalcommits.org/):

| Type | Use for |
|---|---|
| `docs:` | Any docs-only change. |
| `docs(scope):` | Optional scope, e.g. `docs(adr):`, `docs(spec):`, `docs(task):`. |

Example: `docs(adr): accept ADR-0001 language and stack`.

## References

- [definition-of-done.md](./definition-of-done.md)
- [../decisions/README.md](../decisions/README.md)
- [../tasks/README.md](../tasks/README.md)
- [../open-questions.md](../open-questions.md)
