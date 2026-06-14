# Phase 2: Claude Code Adapter & Config

- Status: in-progress
- Goal: Claude Code adapter, user config, and registry update command.

## Task Index

| ID | Title | Status | Depends on |
|---|---|---|---|
| [T-0201](./T-0201-claude-adapter.md) | Claude Code adapter (detect, discover, export) | todo | Phase 1 done |
| [T-0202](./T-0202-config-command.md) | `skillrelay config` — user configuration | todo | Phase 1 done |
| [T-0203](./T-0203-update-command.md) | `skillrelay update` — refresh skill from source | todo | Phase 1 done |

## Goals

By the end of Phase 2, SkillRelay should:

1. Support exporting skills to Claude Code (`.claude/commands/` or Claude's skill format).
2. Allow user-level configuration (default registry, default adapter, etc.) in `~/.skillrelay/config.yaml`.
3. Allow refreshing a skill's metadata from its original source via `skillrelay update`.

## References

- [../phase-1/README.md](../phase-1/README.md)
- [../../roadmap.md](../../roadmap.md)
