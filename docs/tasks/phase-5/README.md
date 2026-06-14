# Phase 5: Tag Management & Format Conversion

- Status: done
- Goal: Add tag management for skills and native format conversion between agents.

## Task Index

| ID | Title | Status | Depends on |
|---|---|---|---|
| T-0501 | `skillrelay tag <skill-id>` — list/add/remove/set tags without re-import | done | Phase 4 done |
| T-0502 | `skillrelay convert <input> <output>` — convert between hermes/claude native formats | done | Phase 4 done |
| T-0503 | E2E tests for tag (8) and convert (6) commands | done | T-0501, T-0502 |

## Goals

By the end of Phase 5, SkillRelay should:

1. Allow users to manage skill tags without a full re-import. ✅
2. Allow direct format conversion between Hermes and Claude native formats without the registry. ✅
3. Maintain ≥ 93% coverage with ≥ 307 tests. ✅ (321 tests, 93%+)

## Summary

All Phase 5 tasks are complete. The project now has:
- **`skillrelay tag`**: list/add/remove/set tags in-place; supports `--json`; idempotent add; `--set` replaces all.
- **`skillrelay convert`**: parses any Markdown+YAML-front-matter file (Hermes dir or Claude `.md`), builds canonical skill record, outputs converted format. Supports `--dry-run` and `--json`.
- 8 E2E tests (tag) + 6 E2E tests (convert)
- Total test suite: **321 tests** (161 unit + 15 integration + 66 E2E), coverage ≥ 93%

## References

- [../phase-4/README.md](../phase-4/README.md)
- [../../roadmap.md](../../roadmap.md)
