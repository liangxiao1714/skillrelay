# Phase 0: Foundation

- Status: in-progress
- Goal: Establish the project skeleton, canonical schema, and core registry I/O.

## Task Index

| ID | Title | Status | Depends on |
|---|---|---|---|
| [T-0001](./T-0001-scaffold-typescript-project.md) | Scaffold TypeScript project | done | none |
| [T-0002](./T-0002-canonical-skill-schema.md) | Canonical skill schema (zod) | todo | T-0001 |
| [T-0003](./T-0003-registry-init-read-write.md) | Registry init / read / write | todo | T-0002 |
| [T-0004](./T-0004-import-local-file-dir.md) | Import from local file/dir | todo | T-0003 |
| [T-0005](./T-0005-cli-list-info-status.md) | CLI: list / info / status | todo | T-0004 |
| [T-0006](./T-0006-validate-command.md) | Validate command | todo | T-0002, T-0004 |
| [T-0007](./T-0007-hermes-adapter-skeleton.md) | Hermes adapter skeleton (detect, discover) | todo | T-0001 |
| [T-0008](./T-0008-hermes-adapter-export-push.md) | Hermes adapter: export / push | todo | T-0003, T-0007 |

## References

- [../README.md](../README.md)
- [../../roadmap.md](../../roadmap.md)
- [../../v0.1-scope.md](../../v0.1-scope.md)
