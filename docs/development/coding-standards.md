# Coding Standards

- Status: accepted
- Last reviewed: 2026-05-25
- Depends on: [ADR-0001](../decisions/0001-language-and-stack.md)

## Purpose

Define the binding code-style and code-shape rules for SkillRelay. The goals are: (1) make the codebase boringly consistent so reviewers focus on substance, (2) make the type system actively prevent classes of bugs, and (3) keep the data-flow boundaries (CLI ↔ core ↔ adapter) hard to accidentally cross.

## Scope

All TypeScript code under `src/` and `tests/`. Configuration files (`*.config.ts`) are subject to the same rules. Generated code (e.g. `dist/`) is exempt.

## 1. Language Baseline

| Setting | Value |
|---|---|
| Language | TypeScript |
| `tsconfig` `strict` | `true` |
| `noUncheckedIndexedAccess` | `true` |
| `exactOptionalPropertyTypes` | `true` |
| `noImplicitOverride` | `true` |
| `noFallthroughCasesInSwitch` | `true` |
| `module` | `ESNext` |
| `moduleResolution` | `Bundler` (matches tsup/esbuild) |
| Target | `ES2022` |
| Runtime | Node.js ≥ 20 LTS |
| Module system | ESM only (`"type": "module"`) |

`tsc --noEmit` must pass with **zero** errors before any merge.

## 2. File and Module Conventions

- One **primary export concern** per file. Tiny related helpers may live in the same file.
- Filenames are kebab-case (`skill-loader.ts`, `registry-init.ts`). Test files use `.test.ts`.
- ESM only. Always include explicit `.js` extensions in relative imports (TS source uses `.js` to refer to its own compiled output — required by ESM/Node resolution):
  ```ts
  import { loadSkill } from "./skill-loader.js";
  ```
- **No barrel files** (`index.ts` re-exporting everything) inside a module. Barrels are allowed only at **published module boundaries** (e.g. `src/core/schema/index.ts`).
- **Order of imports** inside a file:
  1. Node built-ins (`node:fs/promises`, `node:path`)
  2. External packages
  3. Internal absolute-ish (`@/core/...`) — when path aliases are introduced
  4. Internal relative (`./...`, `../...`)

  A blank line separates each group. Biome's import sorting enforces this.

## 3. Exports

- Prefer **named exports**. Default exports are disallowed except for `commander` command modules, where a default export is the natural shape.
- Public module surfaces are documented with JSDoc (see §10).
- Re-export with explicit names; never `export *` from a barrel.

## 4. Naming Conventions

| Kind | Convention | Example |
|---|---|---|
| Variables / functions | camelCase | `loadSkill`, `targetPath` |
| Types / interfaces / classes | PascalCase | `Skill`, `Registry`, `HermesAdapter` |
| Generic parameters | PascalCase, single capital preferred | `T`, `TSkill` |
| Constants (module-level immutable) | UPPER_SNAKE_CASE | `DEFAULT_REGISTRY_DIR` |
| Enum-like string unions | lowercase kebab values | `"same-name"`, `"version-mismatch"` |
| Booleans | `is`, `has`, `should`, `can` prefixes | `isValid`, `hasConflict` |
| Async functions | no `Async` suffix; signature itself is the marker | `loadSkill()`, not `loadSkillAsync()` |
| Files | kebab-case | `id-generation.ts` |
| Directories | kebab-case | `core/registry/` |

**Forbidden**: Hungarian notation (`strName`, `nFiles`), unclear abbreviations (`fn`, `mgr`, `svc`).

## 5. Type System Rules

- **No `any`.** If absolutely required, the line must carry `// reason: <why>` and be wrapped in the smallest possible scope.
- Prefer `unknown` over `any` for boundary data; narrow with zod or type guards.
- Use `interface` for **object shapes that may be extended**; use `type` for **unions, intersections, and aliases**.
- Public function signatures are **fully typed** — return types are explicit, not inferred.
- Discriminated unions are preferred over loose flag bags. Example:
  ```ts
  type ImportOutcome =
    | { kind: "imported"; skillId: SkillId }
    | { kind: "skipped"; reason: SkipReason }
    | { kind: "conflict"; conflict: Conflict };
  ```
- **Brand the IDs.** Skill identifiers, source identifiers, and adapter identifiers are nominal types, not raw strings:
  ```ts
  export type SkillId = string & { readonly __brand: "SkillId" };
  ```

## 6. Zod-First at Every External Boundary

Any data crossing into the system from outside (filesystem, env, CLI args, adapter output, user input) **must** be parsed by a zod schema before being used.

- Schemas live under `src/core/schema/`.
- Inferred types are produced via `z.infer<typeof Schema>` — do **not** maintain a hand-written duplicate type next to a schema.
- Schema errors are converted to typed errors (§7), never thrown raw.

## 7. Error Handling

- A typed error hierarchy lives under `src/core/errors/`. Example baseline:
  - `SkillRelayError` (base)
    - `RegistryError`
    - `SchemaValidationError`
    - `AdapterError`
    - `SourceError`
    - `ConflictError`
- Errors carry a stable `code` string. The CLI surface maps codes to exit codes; the mapping is defined in [`specs/error-model.md`](../specs/error-model.md) (planned).
- **Never swallow errors.** Catch only to translate, then re-throw a typed error. `catch (_) {}` is forbidden.
- **No throw across async/await boundaries without context.** Wrap and re-throw with a meaningful message.
- The **CLI layer is the only place** that converts errors into stderr output and exit codes.

## 8. Async / Concurrency

- Always `async/await`. No `.then().catch()` chains except in one explicit narrow case: when joining many concurrent operations with `Promise.allSettled` for partial-success semantics.
- No callback-style APIs.
- No top-level `await` outside the CLI entry file.
- All filesystem operations use `node:fs/promises`. Synchronous fs is forbidden except for CLI start-up bootstrapping where async would complicate exit-code semantics — and such uses must be commented.

## 9. Side-Effect Boundaries

- **All filesystem writes** to the local registry go through `src/core/registry/`. No other module may write to the registry directory.
- **All filesystem writes** to an agent's directory go through that agent's adapter under `src/adapters/<agent>/`. No other module may write to an agent directory.
- The CLI layer **never** touches the filesystem directly; it always calls into `core/` or `adapters/`.
- `process.exit()` is called **only** from `src/cli/index.ts`.

These boundaries are enforced by review (and, later, by lint rules once tooling is configured).

## 10. Comments and Documentation

- Comments explain **why**, not **what**. The code already says what it does.
- Public exports of `core/` and `adapters/` carry **JSDoc** with at minimum:
  - one-line summary,
  - parameter and return documentation when not obvious,
  - `@throws` for typed errors that can escape.
- TODO comments must reference an issue or task ID: `// TODO(T-0042): ...`. Unbound TODOs are forbidden.
- No `console.log` outside `src/cli/output/` and tests. Logging goes through the logger defined in [`specs/logging.md`](../specs/logging.md) (planned).

## 11. Constants and Magic Values

- No string literals duplicated more than twice — extract a constant.
- Path-like constants live near the module that owns them, not in a global `constants.ts`.
- Configuration defaults live in `src/core/config/` and are documented in [`specs/config-file.md`](../specs/config-file.md) (planned).

## 12. Testing-Related Code Rules

- Test code follows the same standards as production code, with these exemptions:
  - `any` is allowed in test helpers if it materially simplifies a fixture, with `// reason: test-only` comment.
  - Snapshot inline assertions are allowed but discouraged — prefer explicit assertions.
- Test data fixtures live under `tests/fixtures/`; they are never modified by tests at runtime.
- Each test creates its own temp registry under `os.tmpdir()` — see [test-strategy.md](./test-strategy.md).

## 13. Forbidden Patterns

| Pattern | Reason |
|---|---|
| `any` without comment | hides type errors |
| `// @ts-ignore` / `// @ts-expect-error` without justification | bypasses the type system |
| Default exports outside commander command modules | inconsistent imports |
| `require()` | not ESM |
| `__dirname` / `__filename` | use `import.meta.url` |
| `JSON.parse(fs.readFile(...))` for skill data | must go through zod-validated loader |
| Mutating function arguments | hides data flow |
| Side effects at module top level (besides imports) | hidden execution order |
| `console.log` outside `cli/output/` and tests | bypasses the logger |
| `process.exit` outside `cli/index.ts` | bypasses the error model |
| Synchronous filesystem APIs | blocks the event loop |

## 14. Lint and Format Tooling

- **Biome** is the single source of truth for lint + format.
- Configuration lives at `biome.json` in the repo root.
- Formatting is **automatic**; never argue about whitespace in review.
- Lint rules are tracked in version control; rule changes require a PR with rationale.
- Pre-commit hook (planned) will run `biome check --apply`.

## 15. Acceptance Criteria (for this doc)

- [ ] Every section above is concrete enough that two engineers reading it would write code that passes Biome's check and matches the file naming used in [project-structure.md](./project-structure.md).
- [ ] Every forbidden pattern in §13 has a stated reason.
- [ ] All cross-referenced docs exist or are listed as `planned` in [../README.md](../README.md).

## 16. Test Items (for this doc)

- [ ] A `biome.json` exists in repo root once Phase 0 code lands (T-0001).
- [ ] CI step `biome check` runs on every PR (added in workflow doc).
- [ ] A representative module under `src/core/` demonstrates each rule (§§2–11) — verified by reviewer when Phase 0 lands.

## References

- [ADR-0001 Language and core stack](../decisions/0001-language-and-stack.md)
- [project-structure.md](./project-structure.md)
- [test-strategy.md](./test-strategy.md)
- [../specs/error-model.md](../specs/error-model.md) (planned)
- [../specs/logging.md](../specs/logging.md) (planned)
