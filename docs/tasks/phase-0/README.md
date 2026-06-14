# Phase 0: Foundation

- Status: done
- Goal: Establish the project skeleton, canonical schema, and core registry I/O.

## Task Index

| ID | Title | Status | Depends on |
|---|---|---|---|
| [T-0001](./T-0001-scaffold-typescript-project.md) | Scaffold TypeScript project | done | none |
| [T-0002](./T-0002-canonical-skill-schema.md) | Canonical skill schema (zod) | done | T-0001 |
| [T-0003](./T-0003-registry-init-read-write.md) | Registry init / read / write | done | T-0002 |
| [T-0004](./T-0004-import-local-file-dir.md) | Import from local file/dir | done | T-0003 |
| [T-0005](./T-0005-cli-list-info-status.md) | CLI: list / info / status / import | done | T-0004 |
| [T-0006](./T-0006-validate-command.md) | Validate command | done | T-0002, T-0004 |
| [T-0007](./T-0007-hermes-adapter-skeleton.md) | Hermes adapter skeleton (detect, discover) | done | T-0001 |
| [T-0008](./T-0008-hermes-adapter-export-push.md) | Hermes adapter: export / push | done | T-0003, T-0007 |

## Summary

All Phase 0 tasks are complete. The project has:
- Full TypeScript scaffold (strict mode, ESM, pnpm, tsup, vitest, Biome)
- Canonical skill schema (zod, branded types, all field types)
- Registry init/read/write (filesystem-only, atomic writes, soft-delete)
- Import pipeline (local file/dir, gray-matter front-matter parsing, canonical record building)
- Source management (add/list/remove/enable/disable — persisted in sources.yaml)
- CLI commands: init, list, info, import, status, validate, export, remove, source
- Hermes adapter: detect, discover, import, export, status, validate
- 180 tests passing: 93 unit + 12 integration + 21 E2E + coverage ≥ 87% (threshold 80%)
- All v0.1 acceptance criteria verified against built binary (`dist/cli/index.js`)

## References

- [../README.md](../README.md)
- [../../roadmap.md](../../roadmap.md)
- [../../v0.1-scope.md](../../v0.1-scope.md)
