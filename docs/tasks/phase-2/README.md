# Phase 2: Claude Code Adapter & Config

- Status: done
- Goal: Claude Code adapter, user config, and registry update command.

## Task Index

| ID | Title | Status | Depends on |
|---|---|---|---|
| [T-0201](./T-0201-claude-adapter.md) | Claude Code adapter (detect, discover, import, export, status, validate) | done | Phase 1 done |
| [T-0202](./T-0202-config-command.md) | `skillrelay config` — user configuration | done | Phase 1 done |
| [T-0203](./T-0203-update-command.md) | `skillrelay update` — refresh skill from source | done | Phase 1 done |

## Goals

By the end of Phase 2, SkillRelay should:

1. Support exporting skills to Claude Code (`.claude/commands/` or Claude's skill format).
2. Allow user-level configuration (default registry, default adapter, etc.) in `~/.skillrelay/config.yaml`.
3. Allow refreshing a skill's metadata from its original source via `skillrelay update`.

## Summary

All Phase 2 tasks are complete. The project has:
- **Claude adapter**: detect (`CLAUDE_HOME` env or `~/.claude`), discover (`.claude/commands/*.md`), import (sets `compatibility.agents: ["claude"]`), export (YAML front-matter with `name`/`description`/`skillrelay_id`/`tags`), status, validate
- **`skillrelay export <skill-id> claude`** — exports to `~/.claude/commands/<name>.md`; supports `--dry-run`, `--overwrite`, `--target`
- **`skillrelay config get/set/unset`** — persistent config in `<registry>/config.yaml`; allowed keys: `default_registry`, `default_adapter`, `color`, `log_level`
- **`skillrelay update <skill-id>`** — re-fetches from `origin.uri`, rebuilds metadata, preserves `id`/`status`/`adapters`; supports `--dry-run`
- 11 unit tests (Claude adapter), 7 unit tests (config), 5 E2E tests (config), 4 E2E tests (update), 5 E2E tests (export claude)
- Total test suite: 259 tests (125 unit + 15 integration + 40 E2E), coverage ≥ 86%

## References

- [../phase-1/README.md](../phase-1/README.md)
- [../../roadmap.md](../../roadmap.md)
